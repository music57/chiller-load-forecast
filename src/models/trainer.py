"""Training pipeline with walk-forward validation and MLflow tracking."""

import numpy as np
import pandas as pd
import mlflow
from sklearn.metrics import mean_squared_error, mean_absolute_error

from src.config import DataConfig, MODEL_DIR, MLRUNS_DIR
from src.models.base import BaseForecaster


def mean_absolute_percentage_error(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    mask = y_true != 0
    if mask.sum() == 0:
        return 0.0
    return float(np.mean(np.abs((y_true[mask] - y_pred[mask]) / y_true[mask])) * 100)


def walk_forward_split(
    df: pd.DataFrame,
    n_splits: int = 3,
    train_ratio: float = 0.6,
):
    """Yield (train_idx, val_idx) respecting temporal order."""
    n = len(df)
    fold_size = int(n * (1 - train_ratio)) // n_splits

    for i in range(n_splits):
        val_end = n - i * fold_size
        val_start = val_end - fold_size
        train_end = val_start
        if train_end < fold_size:
            continue
        yield df.index[:train_end], df.index[val_start:val_end]


def prepare_multistep_targets(
    series: pd.Series,
    horizon: int,
) -> np.ndarray:
    """Create (n_samples, horizon) target array from a 1-D series."""
    arr = series.values
    targets = np.column_stack([
        arr[h:len(arr) - horizon + h] for h in range(horizon)
    ])
    return targets


def evaluate_per_step(
    y_true: np.ndarray,
    y_pred: np.ndarray,
) -> dict[str, list[float]]:
    """Compute RMSE, MAE, MAPE for each forecast step."""
    horizon = y_true.shape[1]
    rmse, mae, mape = [], [], []
    for h in range(horizon):
        rmse.append(float(np.sqrt(mean_squared_error(y_true[:, h], y_pred[:, h]))))
        mae.append(float(mean_absolute_error(y_true[:, h], y_pred[:, h])))
        mape.append(mean_absolute_percentage_error(y_true[:, h], y_pred[:, h]))
    return {"rmse": rmse, "mae": mae, "mape": mape}


def train_and_evaluate(
    model: BaseForecaster,
    df: pd.DataFrame,
    feature_cols: list[str],
    target_col: str = "meter_reading",
    config: DataConfig = DataConfig(),
    experiment_name: str = "chiller_forecast",
) -> dict:
    """Full training loop: walk-forward CV + MLflow logging."""
    MLRUNS_DIR.mkdir(parents=True, exist_ok=True)
    mlflow.set_tracking_uri(MLRUNS_DIR.as_uri())
    mlflow.set_experiment(experiment_name)

    y_all = prepare_multistep_targets(df[target_col], config.forecast_horizon)
    X_all = df[feature_cols].iloc[:len(y_all)]

    all_metrics: list[dict] = []

    with mlflow.start_run(run_name=model.name):
        for fold, (train_idx, val_idx) in enumerate(walk_forward_split(df)):
            train_mask = train_idx[train_idx < len(y_all)]
            val_mask = val_idx[val_idx < len(y_all)]
            if len(train_mask) == 0 or len(val_mask) == 0:
                continue

            X_train = X_all.iloc[train_mask]
            y_train = y_all[train_mask]
            X_val = X_all.iloc[val_mask]
            y_val = y_all[val_mask]

            model.fit(X_train, y_train, X_val, y_val)

            preds = model.predict(X_val)
            if len(preds) < len(y_val):
                y_val = y_val[-len(preds):]

            fold_metrics = evaluate_per_step(y_val, preds)
            all_metrics.append(fold_metrics)

            mlflow.log_metrics({
                f"fold{fold}_rmse_avg": float(np.mean(fold_metrics["rmse"])),
                f"fold{fold}_mae_avg": float(np.mean(fold_metrics["mae"])),
            })

        avg_rmse = float(np.mean([np.mean(m["rmse"]) for m in all_metrics]))
        avg_mae = float(np.mean([np.mean(m["mae"]) for m in all_metrics]))
        avg_mape = float(np.mean([np.mean(m["mape"]) for m in all_metrics]))

        mlflow.log_metrics({"avg_rmse": avg_rmse, "avg_mae": avg_mae, "avg_mape": avg_mape})
        mlflow.log_param("model_name", model.name)
        mlflow.log_param("horizon", config.forecast_horizon)
        mlflow.log_param("n_features", len(feature_cols))

        save_path = str(MODEL_DIR / model.name.lower())
        model.save(save_path)
        mlflow.log_artifacts(save_path, artifact_path="model")

    return {
        "model": model.name,
        "avg_rmse": avg_rmse,
        "avg_mae": avg_mae,
        "avg_mape": avg_mape,
        "per_fold": all_metrics,
    }
