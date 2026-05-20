"""One-off script: extract the canonical feature column list and save to JSON.

Run this once on the host so the API container can later use a small per-building
slice without losing one-hot columns.
"""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from src.data.loader import load_chilled_water_data
from src.data.preprocessing import clean_data
from src.data.features import build_features, get_feature_columns
from src.config import MODEL_DIR


def main():
    print("[1/3] Loading data...")
    df = load_chilled_water_data()
    print(f"  rows: {len(df):,}")

    print("[2/3] Cleaning + building features...")
    df = clean_data(df)
    df["meter_reading"] = df.groupby("building_id")["meter_reading"].transform(
        lambda s: s.interpolate(method="linear", limit_direction="both")
    )
    df = build_features(df)
    feat_cols = get_feature_columns(df)
    print(f"  feature columns: {len(feat_cols)}")

    out = MODEL_DIR / "feature_columns.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(feat_cols, indent=2, ensure_ascii=False))
    print(f"[3/3] Saved -> {out}")
    print(f"\nColumns: {feat_cols}")


if __name__ == "__main__":
    main()
