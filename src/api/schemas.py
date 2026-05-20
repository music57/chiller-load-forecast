"""Pydantic schemas for API request / response validation."""

from datetime import datetime

from pydantic import BaseModel, Field


class BuildingOut(BaseModel):
    id: int
    site_id: int
    name: str | None = None
    square_feet: float | None = None
    primary_use: str | None = None
    year_built: int | None = None

    model_config = {"from_attributes": True}


class MeterReadingOut(BaseModel):
    building_id: int
    timestamp: datetime
    reading: float
    is_anomaly: bool = False

    model_config = {"from_attributes": True}


class PredictRequest(BaseModel):
    model_config = {"protected_namespaces": ()}

    building_id: int
    features: list[dict[str, float]] = Field(
        ..., description="List of feature rows (1 row for LightGBM, 48+ rows for LSTM)",
    )
    model_name: str = "LightGBM"


class PredictionOut(BaseModel):
    model_config = {"from_attributes": True, "protected_namespaces": ()}

    building_id: int
    model_name: str
    created_at: datetime
    horizon_hours: int
    predicted_values: list[float]


class ModelMetadataOut(BaseModel):
    id: int
    name: str
    version: str
    metrics: dict | None = None
    trained_at: datetime | None = None

    model_config = {"from_attributes": True}


class HealthOut(BaseModel):
    status: str = "ok"
    version: str = "0.1.0"
