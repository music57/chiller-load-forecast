"""Abstract base class for all forecasting models."""

from abc import ABC, abstractmethod

import numpy as np
import pandas as pd


class BaseForecaster(ABC):
    """Common interface for LightGBM, LSTM, and any future model."""

    @abstractmethod
    def fit(
        self,
        X_train: np.ndarray | pd.DataFrame,
        y_train: np.ndarray,
        X_val: np.ndarray | pd.DataFrame | None = None,
        y_val: np.ndarray | None = None,
    ) -> dict:
        """Train the model. Return a dict of training metrics."""

    @abstractmethod
    def predict(self, X: np.ndarray | pd.DataFrame) -> np.ndarray:
        """Return predictions with shape (n_samples, forecast_horizon)."""

    @abstractmethod
    def save(self, path: str) -> None:
        """Persist model artefacts to disk."""

    @abstractmethod
    def load(self, path: str) -> None:
        """Restore model artefacts from disk."""

    @property
    @abstractmethod
    def name(self) -> str:
        """Human-readable model name for logging."""
