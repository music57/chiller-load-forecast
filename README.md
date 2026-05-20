# Chiller Load Forecast Platform

Multi-site chiller cooling load prediction platform — end-to-end ML pipeline from raw sensor data to interactive dashboard.

## Architecture

```
┌──────────────┐    ┌───────────────┐    ┌──────────────┐    ┌───────────────┐
│  ASHRAE Data │───▶│  Data Pipeline │───▶│  ML Models   │───▶│  FastAPI      │
│  (Kaggle)    │    │  Clean + FE    │    │  LGBM / LSTM │    │  REST API     │
└──────────────┘    └───────────────┘    └───────┬──────┘    └──────┬────────┘
                                                 │                  │
                                          ┌──────▼──────┐    ┌─────▼─────────┐
                                          │   MLflow    │    │  Streamlit    │
                                          │  Tracking   │    │  Dashboard    │
                                          └─────────────┘    └───────────────┘
                                                                    │
                                                             ┌──────▼──────┐
                                                             │ PostgreSQL  │
                                                             └─────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| ML Models | LightGBM, PyTorch (LSTM) |
| Experiment Tracking | MLflow |
| Backend API | FastAPI + Pydantic |
| Database | PostgreSQL + SQLAlchemy ORM |
| Dashboard | Streamlit + Plotly |
| Deployment | Docker Compose |

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Python 3.11+
- ASHRAE dataset from [Kaggle](https://www.kaggle.com/competitions/ashrae-energy-prediction/data)

### 1. Place Data
Download from Kaggle and put these files in `data/raw/`:
- `train.csv`
- `building_metadata.csv`
- `weather_train.csv`

### 2. Run with Docker
```bash
docker-compose up --build
```

Services:
- **API**: http://localhost:8000/docs (Swagger UI)
- **Dashboard**: http://localhost:8501
- **Database**: localhost:5432

### 3. Run Locally (Development)
```bash
pip install -r requirements.txt

# Start PostgreSQL (or use Docker for DB only)
docker-compose up db -d

# Run API
uvicorn src.api.main:app --reload

# Run Dashboard (separate terminal)
streamlit run src/dashboard/app.py

# Run Tests
pytest tests/ -v
```

### 4. Train Models
```python
from src.data.loader import load_chilled_water_data
from src.data.preprocessing import clean_data
from src.data.features import build_features, get_feature_columns
from src.models.lgbm_model import LGBMForecaster
from src.models.lstm_model import LSTMForecaster
from src.models.trainer import train_and_evaluate

df = load_chilled_water_data()
df = clean_data(df)
df = build_features(df)
df = df.dropna(subset=["meter_reading"])

feature_cols = get_feature_columns(df)

# Train LightGBM
lgbm_results = train_and_evaluate(LGBMForecaster(), df, feature_cols)
print(lgbm_results)

# Train LSTM
lstm_results = train_and_evaluate(LSTMForecaster(), df, feature_cols)
print(lstm_results)
```

## Project Structure

```
chiller-forecast/
├── src/
│   ├── data/           # Data loading, cleaning, feature engineering
│   ├── models/         # LightGBM, LSTM, training pipeline
│   ├── api/            # FastAPI REST endpoints
│   ├── db/             # SQLAlchemy models & connection
│   └── dashboard/      # Streamlit visualization
├── notebooks/          # Exploratory analysis
├── tests/              # Unit tests
├── docker-compose.yml  # One-command deployment
└── requirements.txt
```

## Design Decisions

**Why LightGBM + LSTM?**
LightGBM provides a strong baseline — tree-based models dominated the ASHRAE Kaggle competition. LSTM captures long-range temporal dependencies that gradient boosting misses. Together they cover short-term and medium-term forecasting.

**Why walk-forward validation?**
Standard k-fold CV leaks future information in time-series. Walk-forward validation mirrors the real deployment scenario where we always predict unseen future data.

**Why multi-site architecture?**
The platform uses `site_id` and `building_id` to isolate data per building while sharing the same codebase. Adding a new site requires zero code changes — just insert building metadata.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/health` | Health check |
| GET | `/api/v1/buildings` | List buildings (filter by site_id) |
| GET | `/api/v1/buildings/{id}/readings` | Historical readings |
| POST | `/api/v1/predict` | Get 6-hour forecast |
| GET | `/api/v1/predictions/{building_id}` | Prediction history |
| GET | `/api/v1/models` | Registered model metadata |

## Future Extensions

- Real-time streaming with Apache Kafka
- Reinforcement learning for optimal chiller sequencing
- Automated retraining pipeline (Airflow / Prefect)
- AI Agent for anomaly alerting and report generation
