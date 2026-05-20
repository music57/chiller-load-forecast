"""Tests for data preprocessing module."""

import numpy as np
import pandas as pd
import pytest

from src.data.preprocessing import (
    impute_weather,
    detect_anomalies_iqr,
    detect_long_zero_runs,
    clean_data,
    data_quality_report,
)


@pytest.fixture
def sample_df():
    n = 200
    rng = np.random.default_rng(42)
    return pd.DataFrame({
        "building_id": np.repeat([1, 2], n // 2),
        "site_id": np.repeat([0, 0], n // 2),
        "timestamp": pd.date_range("2024-01-01", periods=n, freq="h"),
        "meter_reading": rng.normal(300, 50, n).clip(0),
        "air_temperature": np.where(
            rng.random(n) < 0.1, np.nan, rng.normal(25, 5, n),
        ),
        "dew_temperature": rng.normal(15, 3, n),
        "wind_speed": rng.uniform(0, 10, n),
    })


def test_impute_weather_fills_nans(sample_df):
    result = impute_weather(sample_df)
    assert result["air_temperature"].isna().sum() == 0


def test_detect_anomalies_iqr_returns_bool(sample_df):
    flags = detect_anomalies_iqr(sample_df)
    assert flags.dtype == bool
    assert len(flags) == len(sample_df)


def test_detect_long_zero_runs(sample_df):
    df = sample_df.copy()
    df.loc[10:70, "meter_reading"] = 0
    flags = detect_long_zero_runs(df, min_hours=48)
    assert flags.any()


def test_clean_data_marks_anomalies(sample_df):
    df = sample_df.copy()
    df.loc[0, "meter_reading"] = 99999
    result = clean_data(df)
    assert "is_anomaly" in result.columns
    assert result["is_anomaly"].any()


def test_data_quality_report_shape(sample_df):
    df = clean_data(sample_df)
    report = data_quality_report(df)
    assert "building_id" in report.columns
    assert "missing_pct" in report.columns
    assert len(report) == sample_df["building_id"].nunique()
