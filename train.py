"""One-command training script: load data → clean → features → train both models."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from src.data.loader import load_chilled_water_data
from src.data.preprocessing import clean_data, data_quality_report
from src.data.features import build_features, get_feature_columns
from src.models.lgbm_model import LGBMForecaster
from src.models.lstm_model import LSTMForecaster
from src.models.trainer import train_and_evaluate


def main():
    print("=" * 60)
    print("Chiller Load Forecast — Training Pipeline")
    print("=" * 60)

    print("\n[1/4] Loading chilled water data...")
    df = load_chilled_water_data()
    print(f"  Loaded {len(df):,} rows, {df['building_id'].nunique()} buildings")

    print("\n[2/4] Cleaning data...")
    df = clean_data(df)
    report = data_quality_report(df)
    print(f"  Avg missing: {report['missing_pct'].mean():.1f}%")
    print(f"  Avg anomaly: {report['anomaly_pct'].mean():.1f}%")

    print("\n[3/4] Building features...")
    # Interpolate anomaly-flagged meter_reading so lag/rolling features stay computable.
    # We keep is_anomaly as a signal but fill the gap for time-series continuity.
    df["meter_reading"] = df.groupby("building_id")["meter_reading"].transform(
        lambda s: s.interpolate(method="linear", limit_direction="both")
    )
    df = build_features(df)
    feature_cols = get_feature_columns(df)
    print(f"  {len(feature_cols)} features generated")

    # Use a single representative building for faster demo training
    top_building = df.groupby("building_id")["meter_reading"].count().idxmax()
    df_single = df[df["building_id"] == top_building].reset_index(drop=True)

    # Drop early rows where lag_168h is still NaN
    df_single = df_single.dropna(subset=feature_cols + ["meter_reading"]).reset_index(drop=True)
    print(f"  Training on building {top_building} ({len(df_single):,} rows after NaN drop)")

    print("\n[4/4] Training models...")

    print("\n  --- LightGBM ---")
    lgbm_results = train_and_evaluate(LGBMForecaster(), df_single, feature_cols)
    print(f"  Avg RMSE: {lgbm_results['avg_rmse']:.2f}")
    print(f"  Avg MAE:  {lgbm_results['avg_mae']:.2f}")
    print(f"  Avg MAPE: {lgbm_results['avg_mape']:.1f}%")

    print("\n  --- LSTM ---")
    lstm_results = train_and_evaluate(LSTMForecaster(), df_single, feature_cols)
    print(f"  Avg RMSE: {lstm_results['avg_rmse']:.2f}")
    print(f"  Avg MAE:  {lstm_results['avg_mae']:.2f}")
    print(f"  Avg MAPE: {lstm_results['avg_mape']:.1f}%")

    print("\n" + "=" * 60)
    print("Training complete! Models saved to models_saved/")
    print("View experiments: mlflow ui --backend-store-uri mlruns")
    print("=" * 60)


if __name__ == "__main__":
    main()
