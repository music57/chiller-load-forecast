"""Pre-compute LightGBM + LSTM predictions for every test timestamp.

The output `predictions.parquet` is loaded at runtime, eliminating the need to
load PyTorch / LightGBM in the Streamlit container — drops memory from ~1 GB
to ~300 MB so the app can fit on smaller Zeabur instances.
"""

import json
import sys
from pathlib import Path

import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

DEMO_DIR   = Path(__file__).resolve().parent
MODELS_DIR = DEMO_DIR / "models"
DATA_FILE  = DEMO_DIR / "data" / "building_171.parquet"
OUT_FILE   = DEMO_DIR / "data" / "predictions.parquet"

HORIZON = 6


def main():
    print("=" * 70)
    print("Pre-computing predictions for all test timestamps")
    print("=" * 70)

    # Load metadata + data
    meta = json.loads((MODELS_DIR / "split_meta.json").read_text())
    feature_cols = json.loads((MODELS_DIR / "feature_columns.json").read_text())
    test_start = pd.to_datetime(meta["test_range"][0])
    test_end   = pd.to_datetime(meta["test_range"][1])

    df_all = pd.read_parquet(DATA_FILE)
    df_all["timestamp"] = pd.to_datetime(df_all["timestamp"])
    df_all = df_all.sort_values("timestamp").reset_index(drop=True)
    print(f"  Total rows loaded: {len(df_all):,}")
    print(f"  Test range: {test_start} → {test_end}")

    # Lazy-load models (only here, NOT in the deployed app)
    from src.models.lgbm_model import LGBMForecaster
    from src.models.lstm_model import LSTMForecaster
    lgbm = LGBMForecaster();  lgbm.load(str(MODELS_DIR / "lightgbm"))
    lstm = LSTMForecaster();  lstm.load(str(MODELS_DIR / "lstm"))

    # Iterate every hour in the test range (minus 6 hours buffer for forecast actuals)
    end_iter = test_end - pd.Timedelta(hours=HORIZON)
    timestamps = pd.date_range(test_start, end_iter, freq="h")
    print(f"  Will compute predictions for {len(timestamps):,} timestamps")

    rows = []
    failed = 0
    for i, ts in enumerate(timestamps):
        if i % 500 == 0:
            print(f"    {i:>5,} / {len(timestamps):,}  ({ts})")
        try:
            # Build history slice (must have ≥ 400 h before ts to compute lag/rolling)
            start = ts - pd.Timedelta(hours=400)
            hist = df_all[(df_all["timestamp"] >= start) & (df_all["timestamp"] <= ts)].copy()
            hist = hist.dropna(subset=feature_cols).reset_index(drop=True)
            if len(hist) < 60:
                failed += 1
                continue

            # LightGBM uses last row only
            X_lgbm = hist.tail(1)[feature_cols].to_numpy()
            preds_lgbm = lgbm.predict(X_lgbm)
            if preds_lgbm.ndim == 2:
                preds_lgbm = preds_lgbm[-1]

            # LSTM needs sequence
            X_lstm = hist.tail(80)[feature_cols].to_numpy().astype("float32")
            preds_lstm = lstm.predict(X_lstm)
            if preds_lstm.ndim == 2:
                preds_lstm = preds_lstm[-1]

            row = {"timestamp": ts}
            for h in range(HORIZON):
                row[f"lgbm_h{h+1}"] = float(preds_lgbm[h])
                row[f"lstm_h{h+1}"] = float(preds_lstm[h])
            rows.append(row)
        except Exception as e:
            failed += 1
            if failed < 5:
                print(f"    ! skip {ts}: {e}")

    out = pd.DataFrame(rows)
    out.to_parquet(OUT_FILE)

    print()
    print(f"  Saved {len(out):,} rows ({len(timestamps) - len(out):,} skipped) → {OUT_FILE}")
    print(f"  File size: {OUT_FILE.stat().st_size / 1024:.1f} KB")
    print()
    print("=" * 70)
    print("Done. Streamlit app can now run without PyTorch / LightGBM at runtime.")
    print("=" * 70)


if __name__ == "__main__":
    main()
