"""Load and merge ASHRAE Great Energy Predictor III dataset."""

import pandas as pd
from pathlib import Path

from src.config import DATA_RAW, DataConfig


def load_raw_data(data_dir: Path = DATA_RAW) -> dict[str, pd.DataFrame]:
    train = pd.read_csv(data_dir / "train.csv", parse_dates=["timestamp"])
    building = pd.read_csv(data_dir / "building_metadata.csv")
    weather = pd.read_csv(data_dir / "weather_train.csv", parse_dates=["timestamp"])
    return {"train": train, "building": building, "weather": weather}


def merge_datasets(
    train: pd.DataFrame,
    building: pd.DataFrame,
    weather: pd.DataFrame,
) -> pd.DataFrame:
    df = train.merge(building, on="building_id", how="left")
    df = df.merge(weather, on=["site_id", "timestamp"], how="left")
    return df


def load_chilled_water_data(
    data_dir: Path = DATA_RAW,
    config: DataConfig = DataConfig(),
) -> pd.DataFrame:
    raw = load_raw_data(data_dir)
    df = merge_datasets(raw["train"], raw["building"], raw["weather"])
    df = df[df["meter"] == config.chilled_water_meter].copy()
    df = df.sort_values(["building_id", "timestamp"]).reset_index(drop=True)
    return df
