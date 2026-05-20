"""Train LightGBM + LSTM with a clean 2016 train / 2017 test split.

Uses leaked 2017 ground-truth data (downloaded post-competition from Kaggle
dataset khoongweihao/ashrae-leak-data-station-2) merged into the original
2016 training data. Result: 2016 → train, 2017 → genuinely unseen test.
"""

import json
import sys
from pathlib import Path

import numpy as np
import pandas as pd

# Allow imports from project root
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.data.preprocessing import clean_data
from src.data.features import build_features, get_feature_columns
from src.models.lgbm_model import LGBMForecaster
from src.models.lstm_model import LSTMForecaster
from src.models.trainer import prepare_multistep_targets, evaluate_per_step
from src.config import DATA_RAW, DataConfig


BUILDING_ID  = 171
SITE_ID      = 2
SPLIT_DATE   = "2018-01-01"     # 2016+2017 → train,  2018 → genuinely unseen test
DEMO_DIR     = Path(__file__).parent
MODELS_DIR   = DEMO_DIR / "models"
DATA_DIR     = DEMO_DIR / "data"
LEAK_FILE    = Path(__file__).parent.parent / "data" / "raw" / "leaked" / "leak2.feather"


def load_with_leak() -> pd.DataFrame:
    """Load original 2016 train + leaked 2017-2018 ground truth, merge with metadata + weather."""
    print("  Loading original 2016 train.csv...")
    train_2016 = pd.read_csv(DATA_RAW / "train.csv", parse_dates=["timestamp"])
    train_2016 = train_2016[train_2016["meter"] == 1]
    print(f"    2016 rows (meter=1): {len(train_2016):,}")

    print("  Loading leaked 2017-2018 from leak2.feather...")
    leak = pd.read_feather(LEAK_FILE)
    leak = leak[(leak["meter"] == 1) & (leak["timestamp"] >= "2017-01-01")].copy()
    leak["meter"] = leak["meter"].astype(int)
    print(f"    2017-2018 rows (meter=1, site=2): {len(leak):,}")

    # Concat
    df = pd.concat([train_2016, leak], ignore_index=True)
    df = df.sort_values(["building_id", "timestamp"]).reset_index(drop=True)

    print("  Merging building_metadata + weather...")
    meta = pd.read_csv(DATA_RAW / "building_metadata.csv")

    # Weather: combine 2016 + 2017+
    w_2016 = pd.read_csv(DATA_RAW / "weather_train.csv", parse_dates=["timestamp"])
    w_2017 = pd.read_csv(DATA_RAW / "weather_test.csv",  parse_dates=["timestamp"])
    weather = pd.concat([w_2016, w_2017], ignore_index=True).drop_duplicates(["site_id", "timestamp"])

    df = df.merge(meta,    on="building_id", how="left")
    df = df.merge(weather, on=["site_id", "timestamp"], how="left")
    print(f"    Total rows after merge: {len(df):,}")
    return df


def main():
    print("=" * 70)
    print("Demo training:  2016 → train,  2017 → held-out test  (with leaked truth)")
    print("=" * 70)

    print("\n[1] Loading data (2016 + leaked 2017-2018)...")
    df = load_with_leak()
    df = df[df["building_id"] == BUILDING_ID].reset_index(drop=True)
    print(f"  Building {BUILDING_ID}: {len(df):,} rows  ({df['timestamp'].min()} -> {df['timestamp'].max()})")

    print("\n[2] Cleaning + feature engineering...")
    df = clean_data(df)
    df["meter_reading"] = df["meter_reading"].interpolate(method="linear", limit_direction="both")
    df = build_features(df)
    feature_cols = get_feature_columns(df)
    print(f"  Feature columns: {len(feature_cols)}")

    df = df.dropna(subset=feature_cols).reset_index(drop=True)
    print(f"  Rows after dropna: {len(df):,}")

    print(f"\n[3] Splitting at {SPLIT_DATE}...")
    train = df[df["timestamp"] < SPLIT_DATE].reset_index(drop=True)
    # 2018 as the genuinely-unseen held-out test set
    test  = df[(df["timestamp"] >= SPLIT_DATE) & (df["timestamp"] < "2019-01-01")].reset_index(drop=True)
    print(f"  Train rows: {len(train):,}  ({train['timestamp'].min()} -> {train['timestamp'].max()})")
    print(f"  Test  rows: {len(test):,}   ({test['timestamp'].min()} -> {test['timestamp'].max()})")

    cfg = DataConfig()
    y_train_full = prepare_multistep_targets(train["meter_reading"], cfg.forecast_horizon)
    X_train_full = train[feature_cols].iloc[:len(y_train_full)]

    val_size = int(len(X_train_full) * 0.1)
    X_tr, X_val = X_train_full.iloc[:-val_size], X_train_full.iloc[-val_size:]
    y_tr, y_val = y_train_full[:-val_size], y_train_full[-val_size:]

    print(f"\n[4] Tail-split for early-stopping:")
    print(f"  Fit rows:        {len(X_tr):,}")
    print(f"  Validation rows: {len(X_val):,}")

    MODELS_DIR.mkdir(parents=True, exist_ok=True)

    # LightGBM
    print("\n[5] Training LightGBM...")
    lgbm = LGBMForecaster()
    lgbm.fit(X_tr, y_tr, X_val, y_val)
    lgbm.save(str(MODELS_DIR / "lightgbm"))
    print(f"  Saved to {MODELS_DIR / 'lightgbm'}")

    # LSTM
    print("\n[6] Training LSTM...")
    lstm = LSTMForecaster()
    lstm.fit(X_tr, y_tr, X_val, y_val)
    lstm.save(str(MODELS_DIR / "lstm"))
    print(f"  Saved to {MODELS_DIR / 'lstm'}")

    # Held-out evaluation
    print("\n[7] Evaluating on held-out 2018...")
    y_test = prepare_multistep_targets(test["meter_reading"], cfg.forecast_horizon)
    X_test = test[feature_cols].iloc[:len(y_test)]

    lgbm_preds = lgbm.predict(X_test)
    if lgbm_preds.ndim == 2 and len(lgbm_preds) < len(y_test):
        y_lgbm = y_test[-len(lgbm_preds):]
    else:
        y_lgbm = y_test
    lgbm_metrics = evaluate_per_step(y_lgbm, lgbm_preds)
    print(f"  LightGBM 2018 RMSE avg: {np.mean(lgbm_metrics['rmse']):.2f}")
    print(f"  LightGBM 2018 MAE  avg: {np.mean(lgbm_metrics['mae']):.2f}")

    lstm_preds = lstm.predict(X_test[feature_cols].to_numpy().astype("float32"))
    if lstm_preds.ndim == 2 and len(lstm_preds) < len(y_test):
        y_lstm = y_test[-len(lstm_preds):]
    else:
        y_lstm = y_test
    lstm_metrics = evaluate_per_step(y_lstm, lstm_preds)
    print(f"  LSTM     2018 RMSE avg: {np.mean(lstm_metrics['rmse']):.2f}")
    print(f"  LSTM     2018 MAE  avg: {np.mean(lstm_metrics['mae']):.2f}")

    # Persist meta + feature names + demo data
    (MODELS_DIR / "feature_columns.json").write_text(
        json.dumps(feature_cols, indent=2, ensure_ascii=False)
    )
    (MODELS_DIR / "split_meta.json").write_text(json.dumps({
        "building_id": BUILDING_ID, "site_id": SITE_ID,
        "split_date": SPLIT_DATE,
        "train_range": [str(train["timestamp"].min()), str(train["timestamp"].max())],
        "test_range":  [str(test["timestamp"].min()),  str(test["timestamp"].max())],
        "train_rows": len(train), "test_rows": len(test),
        "lightgbm_holdout_rmse": float(np.mean(lgbm_metrics["rmse"])),
        "lightgbm_holdout_mae":  float(np.mean(lgbm_metrics["mae"])),
        "lstm_holdout_rmse": float(np.mean(lstm_metrics["rmse"])),
        "lstm_holdout_mae":  float(np.mean(lstm_metrics["mae"])),
        "data_source_note": "2016 from ASHRAE GEPIII train.csv; 2017 from khoongweihao/ashrae-leak-data-station-2 (post-competition leaked ground truth)",
    }, indent=2))

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    out = DATA_DIR / "building_171.parquet"
    df.to_parquet(out)
    print(f"\n[8] Saved demo data ({len(df):,} rows) to {out}")
    print(f"   Size: {out.stat().st_size / 1024:.1f} KB")

    print("\n" + "=" * 70)
    print("DONE.  Train 2016 → Test 2017 with leaked ground truth.")
    print("=" * 70)


if __name__ == "__main__":
    main()
