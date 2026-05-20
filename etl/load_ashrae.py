"""ETL: load ASHRAE chilled-water data into PostgreSQL.

Usage:
    python -m etl.load_ashrae               # loads all 498 buildings
    python -m etl.load_ashrae --building 171  # only Building 171 (fast)
    python -m etl.load_ashrae --limit-buildings 20  # first 20 buildings

The script is idempotent: it TRUNCATEs the tables before loading.
"""

from __future__ import annotations

import argparse
import math
import sys
import time
from pathlib import Path

import numpy as np
import pandas as pd
from sqlalchemy import text

sys.path.insert(0, str(Path(__file__).parent.parent))

from src.data.loader import load_chilled_water_data
from src.data.preprocessing import clean_data
from src.db.database import SessionLocal, engine, init_db
from src.db.models import Building, MeterReading


CHUNK_SIZE = 5000  # rows per bulk insert


def reset_tables() -> None:
    """Drop dependent rows and re-create schema."""
    print("[reset] Creating tables (if not exist)...")
    init_db()

    print("[reset] Truncating meter_readings + buildings...")
    with engine.begin() as conn:
        conn.execute(text("TRUNCATE meter_readings RESTART IDENTITY CASCADE;"))
        conn.execute(text("TRUNCATE buildings RESTART IDENTITY CASCADE;"))


def _safe_int(v) -> int | None:
    if v is None or (isinstance(v, float) and math.isnan(v)):
        return None
    return int(v)


def _safe_float(v) -> float | None:
    if v is None or (isinstance(v, float) and math.isnan(v)):
        return None
    return float(v)


def load_buildings(df: pd.DataFrame) -> int:
    """Insert one row per unique building."""
    meta = (
        df[["building_id", "site_id", "primary_use", "square_feet", "year_built", "floor_count"]]
        .drop_duplicates(subset=["building_id"])
        .sort_values("building_id")
    )
    print(f"[buildings] Inserting {len(meta):,} buildings...")
    session = SessionLocal()
    try:
        rows = [
            Building(
                id=int(r.building_id),
                site_id=int(r.site_id),
                name=f"Building {int(r.building_id)}",
                square_feet=_safe_float(r.square_feet),
                primary_use=r.primary_use if isinstance(r.primary_use, str) else None,
                year_built=_safe_int(r.year_built),
                floor_count=_safe_int(r.floor_count),
            )
            for r in meta.itertuples()
        ]
        session.bulk_save_objects(rows)
        session.commit()
    finally:
        session.close()
    return len(meta)


def load_readings(df: pd.DataFrame) -> int:
    """Insert all meter_readings, chunked for memory safety."""
    cols = df[["building_id", "timestamp", "meter_reading", "is_anomaly"]].copy()
    cols["building_id"] = cols["building_id"].astype(int)
    cols["timestamp"] = pd.to_datetime(cols["timestamp"])
    cols = cols.dropna(subset=["meter_reading"])

    total = len(cols)
    print(f"[readings] Inserting {total:,} readings in chunks of {CHUNK_SIZE}...")
    inserted = 0
    t0 = time.time()

    with engine.begin() as conn:
        for start in range(0, total, CHUNK_SIZE):
            chunk = cols.iloc[start : start + CHUNK_SIZE]
            records = [
                {
                    "building_id": int(r.building_id),
                    "timestamp": r.timestamp.to_pydatetime(),
                    "reading": float(r.meter_reading),
                    "is_anomaly": bool(r.is_anomaly) if not pd.isna(r.is_anomaly) else False,
                }
                for r in chunk.itertuples()
            ]
            conn.execute(
                text(
                    "INSERT INTO meter_readings (building_id, timestamp, reading, is_anomaly) "
                    "VALUES (:building_id, :timestamp, :reading, :is_anomaly)"
                ),
                records,
            )
            inserted += len(records)
            if inserted % (CHUNK_SIZE * 20) == 0 or inserted == total:
                rate = inserted / (time.time() - t0 + 1e-9)
                print(f"  ... {inserted:,}/{total:,}  ({rate:,.0f} rows/sec)")

    return inserted


def main() -> None:
    parser = argparse.ArgumentParser(description="Load ASHRAE chilled-water data into PostgreSQL")
    parser.add_argument("--building", type=int, default=None,
                        help="Load only this building_id (e.g., 171)")
    parser.add_argument("--limit-buildings", type=int, default=None,
                        help="Load only the first N buildings by row-count (for fast demo)")
    parser.add_argument("--skip-clean", action="store_true",
                        help="Skip anomaly detection step (just raw load)")
    args = parser.parse_args()

    print("=" * 70)
    print("ETL: ASHRAE chilled-water -> PostgreSQL")
    print("=" * 70)

    print("\n[1] Loading ASHRAE CSVs from data/raw/...")
    df = load_chilled_water_data()
    print(f"  Total rows loaded: {len(df):,}")
    print(f"  Buildings:          {df['building_id'].nunique()}")

    if not args.skip_clean:
        print("\n[2] Running preprocessing (anomaly flagging + imputation)...")
        df = clean_data(df)
        df["meter_reading"] = df.groupby("building_id")["meter_reading"].transform(
            lambda s: s.interpolate(method="linear", limit_direction="both")
        )

    # Filter for fast demo
    if args.building is not None:
        df = df[df["building_id"] == args.building]
        print(f"\n[filter] Restricted to building {args.building}: {len(df):,} rows")
    elif args.limit_buildings is not None:
        top_ids = (
            df.groupby("building_id")["meter_reading"].count()
            .sort_values(ascending=False).head(args.limit_buildings).index.tolist()
        )
        df = df[df["building_id"].isin(top_ids)]
        print(f"\n[filter] Top {args.limit_buildings} buildings selected: {len(df):,} rows")

    print("\n[3] Resetting database tables...")
    reset_tables()

    print("\n[4] Loading buildings...")
    n_b = load_buildings(df)
    print(f"  OK {n_b} buildings written")

    print("\n[5] Loading meter readings...")
    n_r = load_readings(df)
    print(f"  OK {n_r:,} readings written")

    # Verify
    print("\n[6] Verifying database contents...")
    with engine.connect() as conn:
        b = conn.execute(text("SELECT COUNT(*) FROM buildings;")).scalar()
        r = conn.execute(text("SELECT COUNT(*) FROM meter_readings;")).scalar()
        rng = conn.execute(text(
            "SELECT MIN(timestamp), MAX(timestamp) FROM meter_readings;"
        )).fetchone()
    print(f"  buildings:       {b}")
    print(f"  meter_readings:  {r:,}")
    print(f"  time range:      {rng[0]}  →  {rng[1]}")

    print("\n" + "=" * 70)
    print(f"ETL complete in {time.time() - t_start:.1f}s")
    print("=" * 70)


if __name__ == "__main__":
    t_start = time.time()
    main()
