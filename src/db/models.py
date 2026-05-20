"""SQLAlchemy ORM models for the chiller forecast platform."""

from datetime import datetime

from sqlalchemy import (
    Column, Integer, BigInteger, String, Float, Boolean,
    DateTime, ForeignKey, JSON,
)
from sqlalchemy.orm import relationship

from src.db.database import Base


class Building(Base):
    __tablename__ = "buildings"

    id = Column(Integer, primary_key=True, index=True)
    site_id = Column(Integer, nullable=False, index=True)
    name = Column(String(200), nullable=True)
    square_feet = Column(Float)
    primary_use = Column(String(100))
    year_built = Column(Integer)
    floor_count = Column(Integer)

    readings = relationship("MeterReading", back_populates="building")
    predictions = relationship("Prediction", back_populates="building")


class MeterReading(Base):
    __tablename__ = "meter_readings"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    building_id = Column(Integer, ForeignKey("buildings.id"), nullable=False, index=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    reading = Column(Float, nullable=False)
    is_anomaly = Column(Boolean, default=False)

    building = relationship("Building", back_populates="readings")


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    building_id = Column(Integer, ForeignKey("buildings.id"), nullable=False, index=True)
    model_name = Column(String(50), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    horizon_hours = Column(Integer, nullable=False)
    predicted_values = Column(JSON, nullable=False)

    building = relationship("Building", back_populates="predictions")


class ModelMetadata(Base):
    __tablename__ = "model_metadata"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(50), nullable=False)
    version = Column(String(20), nullable=False)
    metrics = Column(JSON)
    trained_at = Column(DateTime, default=datetime.utcnow)
    file_path = Column(String(500))
