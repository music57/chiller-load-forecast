"""FastAPI route definitions."""

from datetime import datetime, timedelta
from functools import lru_cache

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from src.db.database import get_db
from src.db import models as db_models
from src.api.schemas import (
    BuildingOut,
    MeterReadingOut,
    PredictRequest,
    PredictionOut,
    ModelMetadataOut,
    HealthOut,
)

router = APIRouter()


@lru_cache(maxsize=1)
def _canonical_feature_columns() -> list[str]:
    """Load the trained model's feature column list (46 names)."""
    import json
    from src.config import MODEL_DIR
    p = MODEL_DIR / "feature_columns.json"
    if not p.exists():
        raise RuntimeError(
            f"Missing {p}. Run scripts/save_feature_names.py on the host first."
        )
    return json.loads(p.read_text())


@lru_cache(maxsize=8)
def _building_history(building_id: int):
    """Load chilled-water data for ONE building only — memory-efficient.

    Reads CSVs directly and filters to a single building before returning,
    so we avoid keeping all 4.18M rows in memory.
    """
    import pandas as pd
    from src.config import DATA_RAW

    train = pd.read_csv(DATA_RAW / "train.csv", parse_dates=["timestamp"])
    train = train[(train["meter"] == 1) & (train["building_id"] == building_id)]

    meta = pd.read_csv(DATA_RAW / "building_metadata.csv")
    meta = meta[meta["building_id"] == building_id]

    if train.empty or meta.empty:
        return None

    site_id = int(meta["site_id"].iloc[0])
    weather = pd.read_csv(DATA_RAW / "weather_train.csv", parse_dates=["timestamp"])
    weather = weather[weather["site_id"] == site_id]

    df = train.merge(meta, on="building_id", how="left").merge(
        weather, on=["site_id", "timestamp"], how="left",
    )
    return df.sort_values("timestamp").reset_index(drop=True)


@router.get("/health", response_model=HealthOut)
def health_check():
    return HealthOut()


@router.get("/buildings", response_model=list[BuildingOut])
def list_buildings(
    site_id: int | None = None,
    skip: int = 0,
    limit: int = Query(default=50, le=200),
    db: Session = Depends(get_db),
):
    q = db.query(db_models.Building)
    if site_id is not None:
        q = q.filter(db_models.Building.site_id == site_id)
    return q.offset(skip).limit(limit).all()


@router.get("/buildings/{building_id}", response_model=BuildingOut)
def get_building(building_id: int, db: Session = Depends(get_db)):
    building = db.query(db_models.Building).filter(
        db_models.Building.id == building_id,
    ).first()
    if not building:
        raise HTTPException(status_code=404, detail="Building not found")
    return building


@router.get("/buildings/{building_id}/readings", response_model=list[MeterReadingOut])
def get_readings(
    building_id: int,
    start: datetime | None = None,
    end: datetime | None = None,
    limit: int = Query(default=500, le=5000),
    db: Session = Depends(get_db),
):
    q = db.query(db_models.MeterReading).filter(
        db_models.MeterReading.building_id == building_id,
    )
    if start:
        q = q.filter(db_models.MeterReading.timestamp >= start)
    if end:
        q = q.filter(db_models.MeterReading.timestamp <= end)
    return q.order_by(db_models.MeterReading.timestamp.desc()).limit(limit).all()


@router.post("/predict", response_model=PredictionOut)
def predict(req: PredictRequest, db: Session = Depends(get_db)):
    import numpy as np
    from src.config import MODEL_DIR

    model_dir = MODEL_DIR / req.model_name.lower()
    if not model_dir.exists():
        raise HTTPException(status_code=404, detail=f"Model '{req.model_name}' not found on disk")

    if req.model_name.lower() == "lightgbm":
        from src.models.lgbm_model import LGBMForecaster
        forecaster = LGBMForecaster()
    elif req.model_name.lower() == "lstm":
        from src.models.lstm_model import LSTMForecaster
        forecaster = LSTMForecaster()
    else:
        raise HTTPException(status_code=400, detail=f"Unknown model: {req.model_name}")

    forecaster.load(str(model_dir))

    import pandas as pd
    X = pd.DataFrame(req.features)
    preds = forecaster.predict(X)
    predicted_values = preds[-1].tolist() if preds.ndim == 2 else preds.tolist()

    record = db_models.Prediction(
        building_id=req.building_id,
        model_name=req.model_name,
        horizon_hours=len(predicted_values),
        predicted_values=predicted_values,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("/predict_next/{building_id}")
def predict_next(
    building_id: int,
    as_of: datetime,
    model_name: str = "LightGBM",
    horizon: int = 6,
):
    """Real end-to-end forecast: build features from history, run model, return predictions.

    Returns predictions for the `horizon` hours AFTER `as_of`.
    """
    import pandas as pd
    from src.data.features import build_features, get_feature_columns
    from src.data.preprocessing import clean_data
    from src.config import MODEL_DIR

    # 1. Load ONLY this building's data (memory-efficient — no 4.18M-row load)
    df = _building_history(building_id)
    if df is None or df.empty:
        raise HTTPException(404, f"No data for building {building_id}")

    # 2. Restrict to history window — load 400h so we have >= 48h of clean sequence
    #    after the first ~168h are dropped (lag_168h needs that warmup)
    start = as_of - timedelta(hours=400)
    df = df[(df["timestamp"] >= start) & (df["timestamp"] <= as_of)].reset_index(drop=True)
    if len(df) < 220:
        raise HTTPException(400, f"Insufficient history before {as_of} (need ~220h, got {len(df)})")

    # 3. Clean + interpolate (mirror training preprocessing)
    df = clean_data(df)
    df["meter_reading"] = df["meter_reading"].interpolate(method="linear", limit_direction="both")

    # 4. Build features on this slice — will produce fewer one-hot columns
    df = build_features(df)

    # 5. Add missing one-hot columns as 0 to match the trained 46-col schema
    feature_cols = _canonical_feature_columns()
    for col in feature_cols:
        if col not in df.columns:
            df[col] = 0

    # 6. Drop rows where lag/rolling features are still NaN (first ~168h)
    lag_cols = [c for c in feature_cols if c.startswith("lag_") or c.startswith("rolling_")]
    df_clean = df.dropna(subset=lag_cols).reset_index(drop=True)
    if len(df_clean) < 54:
        raise HTTPException(400, f"Not enough clean rows for LSTM sequence (need 54, got {len(df_clean)})")

    # 4. Select input rows for the model
    if model_name.lower() == "lightgbm":
        from src.models.lgbm_model import LGBMForecaster
        forecaster = LGBMForecaster()
        X = df_clean.tail(1)[feature_cols].to_numpy()
    elif model_name.lower() == "lstm":
        from src.models.lstm_model import LSTMForecaster
        forecaster = LSTMForecaster()
        # LSTM needs a sequence — sequence_length=48, send last 80 rows so it has
        # room to produce at least one sliding window prediction
        X = df_clean.tail(80)[feature_cols].to_numpy().astype("float32")
    else:
        raise HTTPException(400, f"Unknown model: {model_name}")

    model_dir = MODEL_DIR / model_name.lower()
    if not model_dir.exists():
        raise HTTPException(404, f"Trained model '{model_name}' not found at {model_dir}")
    forecaster.load(str(model_dir))

    # 5. Run prediction — take last prediction (predicting from the most recent feature row)
    preds = forecaster.predict(X)
    if preds.ndim == 2:
        preds = preds[-1]
    preds = preds[:horizon].tolist()

    # 6. Build forecast timestamps (as_of + 1h, +2h, ..., +horizon h)
    forecast_ts = [(as_of + timedelta(hours=i + 1)).isoformat() for i in range(len(preds))]

    return {
        "building_id": building_id,
        "model_name": model_name,
        "as_of": as_of.isoformat(),
        "forecast_timestamps": forecast_ts,
        "predicted_values": preds,
    }


@router.get("/predictions/{building_id}", response_model=list[PredictionOut])
def get_predictions(
    building_id: int,
    model_name: str | None = None,
    limit: int = Query(default=50, le=500),
    db: Session = Depends(get_db),
):
    q = db.query(db_models.Prediction).filter(
        db_models.Prediction.building_id == building_id,
    )
    if model_name:
        q = q.filter(db_models.Prediction.model_name == model_name)
    return q.order_by(db_models.Prediction.created_at.desc()).limit(limit).all()


@router.get("/models", response_model=list[ModelMetadataOut])
def list_models(db: Session = Depends(get_db)):
    return db.query(db_models.ModelMetadata).all()
