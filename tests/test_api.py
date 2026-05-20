"""Tests for the FastAPI endpoints (uses TestClient with SQLite)."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from src.db.database import Base, get_db
from src.db.models import Building
from src.api.main import app


SQLALCHEMY_TEST_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_TEST_URL, connect_args={"check_same_thread": False})
TestSession = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def override_get_db():
    db = TestSession()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    db = TestSession()
    db.add(Building(id=1, site_id=1, name="Test Building", square_feet=5000, primary_use="Office"))
    db.commit()
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)


client = TestClient(app)


def test_health():
    r = client.get("/api/v1/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_list_buildings():
    r = client.get("/api/v1/buildings")
    assert r.status_code == 200
    data = r.json()
    assert len(data) >= 1
    assert data[0]["name"] == "Test Building"


def test_get_building():
    r = client.get("/api/v1/buildings/1")
    assert r.status_code == 200
    assert r.json()["id"] == 1


def test_get_building_not_found():
    r = client.get("/api/v1/buildings/999")
    assert r.status_code == 404


def test_list_models_empty():
    r = client.get("/api/v1/models")
    assert r.status_code == 200
    assert r.json() == []
