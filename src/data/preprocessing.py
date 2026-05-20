"""Data cleaning: missing value imputation, anomaly detection, quality reporting."""

import pandas as pd
import numpy as np


def impute_weather(df: pd.DataFrame) -> pd.DataFrame:
    """Fill weather gaps per site: forward-fill then linear interpolation."""
    weather_cols = [
        "air_temperature", "cloud_coverage", "dew_temperature",
        "precip_depth_1_hr", "sea_level_pressure", "wind_direction", "wind_speed",
    ]
    existing = [c for c in weather_cols if c in df.columns]
    df = df.copy()
    for col in existing:
        df[col] = df.groupby("site_id")[col].transform(
            lambda s: s.ffill().bfill().interpolate(method="linear")
        )
    return df


def detect_anomalies_iqr(
    df: pd.DataFrame,
    column: str = "meter_reading",
    factor: float = 3.0,
) -> pd.Series:
    """Flag anomalies per building using the IQR method."""
    def _flag(group: pd.Series) -> pd.Series:
        q1 = group.quantile(0.25)
        q3 = group.quantile(0.75)
        iqr = q3 - q1
        lower = q1 - factor * iqr
        upper = q3 + factor * iqr
        return (group < lower) | (group > upper)

    return df.groupby("building_id")[column].transform(_flag)


def detect_long_zero_runs(
    df: pd.DataFrame,
    column: str = "meter_reading",
    min_hours: int = 48,
) -> pd.Series:
    """Flag suspiciously long streaks of zero readings (sensor fault vs. shutdown)."""
    is_zero = df[column] == 0
    groups = (~is_zero).groupby(df["building_id"]).cumsum()
    run_lengths = is_zero.groupby([df["building_id"], groups]).transform("sum")
    return is_zero & (run_lengths >= min_hours)


def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """Full cleaning pipeline: impute weather, flag and remove anomalies."""
    df = impute_weather(df)

    iqr_anomaly = detect_anomalies_iqr(df)
    zero_anomaly = detect_long_zero_runs(df)
    df["is_anomaly"] = iqr_anomaly | zero_anomaly

    df.loc[df["is_anomaly"], "meter_reading"] = np.nan
    return df


def data_quality_report(df: pd.DataFrame) -> pd.DataFrame:
    """Per-building summary of data quality."""
    def _stats(g: pd.DataFrame) -> pd.Series:
        total = len(g)
        missing = g["meter_reading"].isna().sum()
        anomaly = g["is_anomaly"].sum() if "is_anomaly" in g.columns else 0
        return pd.Series({
            "total_rows": total,
            "missing_count": missing,
            "missing_pct": round(missing / total * 100, 2),
            "anomaly_count": anomaly,
            "anomaly_pct": round(anomaly / total * 100, 2),
        })

    return df.groupby("building_id").apply(_stats, include_groups=False).reset_index()
