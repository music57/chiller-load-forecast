"""LightGBM multi-step forecaster using recursive prediction."""

import json
import pickle
from pathlib import Path

import lightgbm as lgb
import numpy as np
import pandas as pd

from src.config import LGBMConfig, DataConfig
from src.models.base import BaseForecaster


class LGBMForecaster(BaseForecaster):

    def __init__(
        self,
        lgbm_config: LGBMConfig = LGBMConfig(),
        data_config: DataConfig = DataConfig(),
    ):
        self._cfg = lgbm_config
        self._horizon = data_config.forecast_horizon
        self._models: list[lgb.LGBMRegressor] = []
        self._feature_names: list[str] = []

    @property
    def name(self) -> str:
        return "LightGBM"

    def fit(
        self,
        X_train: np.ndarray | pd.DataFrame,
        y_train: np.ndarray,
        X_val: np.ndarray | pd.DataFrame | None = None,
        y_val: np.ndarray | None = None,
    ) -> dict:
        if isinstance(X_train, pd.DataFrame):
            self._feature_names = list(X_train.columns)

        self._models = []
        metrics: dict[str, float] = {}

        for step in range(self._horizon):
            model = lgb.LGBMRegressor(
                n_estimators=self._cfg.n_estimators,
                learning_rate=self._cfg.learning_rate,
                max_depth=self._cfg.max_depth,
                num_leaves=self._cfg.num_leaves,
                subsample=self._cfg.subsample,
                colsample_bytree=self._cfg.colsample_bytree,
                random_state=self._cfg.random_state,
                verbosity=-1,
            )
            callbacks = []
            if self._cfg.early_stopping_rounds:
                callbacks.append(lgb.early_stopping(self._cfg.early_stopping_rounds, verbose=False))

            fit_params: dict = {"callbacks": callbacks}
            if X_val is not None and y_val is not None:
                fit_params["eval_set"] = [(X_val, y_val[:, step])]

            model.fit(X_train, y_train[:, step], **fit_params)
            self._models.append(model)

        return metrics

    def predict(self, X: np.ndarray | pd.DataFrame) -> np.ndarray:
        preds = np.column_stack([m.predict(X) for m in self._models])
        return preds

    def feature_importance(self) -> pd.DataFrame:
        if not self._models:
            raise RuntimeError("Model not trained yet")
        importances = np.mean(
            [m.feature_importances_ for m in self._models], axis=0,
        )
        names = self._feature_names or [f"f{i}" for i in range(len(importances))]
        return (
            pd.DataFrame({"feature": names, "importance": importances})
            .sort_values("importance", ascending=False)
            .reset_index(drop=True)
        )

    def save(self, path: str) -> None:
        p = Path(path)
        p.mkdir(parents=True, exist_ok=True)
        for i, model in enumerate(self._models):
            with open(p / f"lgbm_step_{i}.pkl", "wb") as f:
                pickle.dump(model, f)
        with open(p / "meta.json", "w") as f:
            json.dump({"feature_names": self._feature_names, "horizon": self._horizon}, f)

    def load(self, path: str) -> None:
        p = Path(path)
        with open(p / "meta.json") as f:
            meta = json.load(f)
        self._feature_names = meta["feature_names"]
        self._horizon = meta["horizon"]
        self._models = []
        for i in range(self._horizon):
            with open(p / f"lgbm_step_{i}.pkl", "rb") as f:
                self._models.append(pickle.load(f))
