from pathlib import Path
from dataclasses import dataclass

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_RAW = PROJECT_ROOT / "data" / "raw" / "ashrae-energy-prediction"
DATA_PROCESSED = PROJECT_ROOT / "data" / "processed"
MLRUNS_DIR = PROJECT_ROOT / "mlruns"
MODEL_DIR = PROJECT_ROOT / "models_saved"


@dataclass
class DataConfig:
    chilled_water_meter: int = 1
    train_ratio: float = 0.8
    sequence_length: int = 48
    forecast_horizon: int = 6
    cooling_base_temp: float = 18.0


@dataclass
class LGBMConfig:
    n_estimators: int = 1000
    learning_rate: float = 0.05
    max_depth: int = 7
    num_leaves: int = 63
    subsample: float = 0.8
    colsample_bytree: float = 0.8
    early_stopping_rounds: int = 50
    random_state: int = 42


@dataclass
class LSTMConfig:
    hidden_size: int = 128         # bigger capacity
    num_layers: int = 2
    dropout: float = 0.15
    learning_rate: float = 5e-4    # smaller LR for more stable convergence
    batch_size: int = 128
    max_epochs: int = 150          # longer training
    patience: int = 20             # more patience
    grad_clip: float = 1.0         # prevent gradient explosion


@dataclass
class DBConfig:
    host: str = "localhost"
    port: int = 5432
    database: str = "chiller_forecast"
    user: str = "postgres"
    password: str = "postgres"

    @property
    def url(self) -> str:
        return f"postgresql://{self.user}:{self.password}@{self.host}:{self.port}/{self.database}"


@dataclass
class APIConfig:
    host: str = "0.0.0.0"
    port: int = 8000
    api_prefix: str = "/api/v1"
