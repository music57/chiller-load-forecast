"""Feature engineering for chiller load forecasting."""

import pandas as pd
import numpy as np

from src.config import DataConfig


def add_temporal_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    ts = df["timestamp"]
    df["hour"] = ts.dt.hour
    df["day_of_week"] = ts.dt.dayofweek
    df["month"] = ts.dt.month
    df["is_weekend"] = ts.dt.dayofweek.isin([5, 6]).astype(int)
    df["is_business_hour"] = ((ts.dt.hour >= 8) & (ts.dt.hour <= 18)).astype(int)
    df["hour_sin"] = np.sin(2 * np.pi * df["hour"] / 24)
    df["hour_cos"] = np.cos(2 * np.pi * df["hour"] / 24)
    df["month_sin"] = np.sin(2 * np.pi * df["month"] / 12)
    df["month_cos"] = np.cos(2 * np.pi * df["month"] / 12)
    return df


def add_weather_features(
    df: pd.DataFrame,
    config: DataConfig = DataConfig(),
) -> pd.DataFrame:
    df = df.copy()
    if "air_temperature" in df.columns:
        df["cooling_degree_hours"] = (
            df["air_temperature"] - config.cooling_base_temp
        ).clip(lower=0)

    if "air_temperature" in df.columns and "dew_temperature" in df.columns:
        df["temp_dew_diff"] = df["air_temperature"] - df["dew_temperature"]

    if "air_temperature" in df.columns:
        df["temp_squared"] = df["air_temperature"] ** 2

    return df


def add_lag_features(
    df: pd.DataFrame,
    config: DataConfig = DataConfig(),
) -> pd.DataFrame:
    """Add lag and rolling-window features per building."""
    df = df.copy()
    target = "meter_reading"

    for lag in [1, 6, 24, 168]:
        df[f"lag_{lag}h"] = df.groupby("building_id")[target].shift(lag)

    for window in [6, 24]:
        rolled = df.groupby("building_id")[target].shift(1).rolling(window, min_periods=1)
        df[f"rolling_mean_{window}h"] = rolled.mean().values
        df[f"rolling_std_{window}h"] = rolled.std().values
        df[f"rolling_max_{window}h"] = rolled.max().values

    return df


def add_building_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    if "year_built" in df.columns:
        current_year = df["timestamp"].dt.year.max()
        df["building_age"] = current_year - df["year_built"]

    if "square_feet" in df.columns:
        df["log_square_feet"] = np.log1p(df["square_feet"])

    if "primary_use" in df.columns:
        dummies = pd.get_dummies(df["primary_use"], prefix="use", dtype=int)
        df = pd.concat([df, dummies], axis=1)

    return df


def build_features(
    df: pd.DataFrame,
    config: DataConfig = DataConfig(),
) -> pd.DataFrame:
    """Run the full feature engineering pipeline."""
    df = add_temporal_features(df)
    df = add_weather_features(df, config)
    df = add_lag_features(df, config)
    df = add_building_features(df)
    return df


def get_feature_columns(df: pd.DataFrame) -> list[str]:
    """Return columns suitable for model input (exclude metadata and target)."""
    exclude = {
        "building_id", "site_id", "meter", "timestamp",
        "meter_reading", "is_anomaly", "primary_use",
        "year_built", "floor_count",
    }
    return [c for c in df.columns if c not in exclude and df[c].dtype in ("float64", "int64", "int32", "float32", "uint8")]
