"""PyTorch LSTM for multi-step chiller load forecasting."""

import json
from pathlib import Path

import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset

from src.config import LSTMConfig, DataConfig
from src.models.base import BaseForecaster


class _LSTMNetwork(nn.Module):

    def __init__(self, n_features: int, cfg: LSTMConfig, horizon: int):
        super().__init__()
        self.lstm = nn.LSTM(
            input_size=n_features,
            hidden_size=cfg.hidden_size,
            num_layers=cfg.num_layers,
            dropout=cfg.dropout if cfg.num_layers > 1 else 0.0,
            batch_first=True,
        )
        self.fc = nn.Linear(cfg.hidden_size, horizon)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        out, _ = self.lstm(x)
        return self.fc(out[:, -1, :])


class LSTMForecaster(BaseForecaster):

    def __init__(
        self,
        lstm_config: LSTMConfig = LSTMConfig(),
        data_config: DataConfig = DataConfig(),
    ):
        self._cfg = lstm_config
        self._horizon = data_config.forecast_horizon
        self._seq_len = data_config.sequence_length
        self._device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self._model: _LSTMNetwork | None = None
        self._n_features: int = 0
        self._mean: np.ndarray | None = None
        self._std: np.ndarray | None = None
        self._y_mean: float = 0.0
        self._y_std: float = 1.0

    @property
    def name(self) -> str:
        return "LSTM"

    def _normalize(self, X: np.ndarray, fit: bool = False) -> np.ndarray:
        if fit:
            self._mean = X.mean(axis=(0, 1)) if X.ndim == 3 else X.mean(axis=0)
            self._std = X.std(axis=(0, 1)) if X.ndim == 3 else X.std(axis=0)
            self._std[self._std == 0] = 1.0
        return (X - self._mean) / self._std

    def _to_sequences(self, X: np.ndarray, y: np.ndarray | None = None):
        """Reshape flat features into (samples, seq_len, features) windows."""
        if X.ndim == 3:
            return (X, y)
        n_samples = len(X) - self._seq_len + 1
        X_seq = np.stack([X[i:i + self._seq_len] for i in range(n_samples)])
        if y is not None:
            y_seq = y[self._seq_len - 1:]
        else:
            y_seq = None
        return X_seq, y_seq

    def fit(
        self,
        X_train: np.ndarray | pd.DataFrame,
        y_train: np.ndarray,
        X_val: np.ndarray | pd.DataFrame | None = None,
        y_val: np.ndarray | None = None,
    ) -> dict:
        if isinstance(X_train, pd.DataFrame):
            X_train = X_train.values
        if isinstance(X_val, pd.DataFrame) and X_val is not None:
            X_val = X_val.values

        X_train_seq, y_train_seq = self._to_sequences(X_train, y_train)
        X_train_seq = self._normalize(X_train_seq, fit=True)

        # Normalize y (target) — critical for LSTM convergence on raw kWh scales
        self._y_mean = float(y_train_seq.mean())
        self._y_std  = float(y_train_seq.std() + 1e-8)
        y_train_seq_norm = (y_train_seq - self._y_mean) / self._y_std

        self._n_features = X_train_seq.shape[-1]
        self._model = _LSTMNetwork(self._n_features, self._cfg, self._horizon).to(self._device)

        train_ds = TensorDataset(
            torch.FloatTensor(X_train_seq),
            torch.FloatTensor(y_train_seq_norm),
        )
        train_loader = DataLoader(train_ds, batch_size=self._cfg.batch_size, shuffle=True)

        optimizer = torch.optim.Adam(self._model.parameters(), lr=self._cfg.learning_rate)
        criterion = nn.MSELoss()

        best_val_loss = float("inf")
        patience_counter = 0
        history: dict[str, list[float]] = {"train_loss": [], "val_loss": []}

        for epoch in range(self._cfg.max_epochs):
            self._model.train()
            epoch_loss = 0.0
            for X_batch, y_batch in train_loader:
                X_batch, y_batch = X_batch.to(self._device), y_batch.to(self._device)
                optimizer.zero_grad()
                pred = self._model(X_batch)
                loss = criterion(pred, y_batch)
                loss.backward()
                # Gradient clipping prevents gradient explosion on LSTM
                grad_clip = getattr(self._cfg, "grad_clip", 0.0)
                if grad_clip > 0:
                    torch.nn.utils.clip_grad_norm_(self._model.parameters(), grad_clip)
                optimizer.step()
                epoch_loss += loss.item() * len(X_batch)
            epoch_loss /= len(train_ds)
            history["train_loss"].append(epoch_loss)

            if X_val is not None and y_val is not None:
                val_loss = self._evaluate(X_val, y_val, criterion)
                history["val_loss"].append(val_loss)
                if val_loss < best_val_loss:
                    best_val_loss = val_loss
                    patience_counter = 0
                else:
                    patience_counter += 1
                    if patience_counter >= self._cfg.patience:
                        break

        return {"train_loss": history["train_loss"][-1], "val_loss": best_val_loss}

    def _evaluate(self, X_val: np.ndarray, y_val: np.ndarray, criterion: nn.Module) -> float:
        X_seq, y_seq = self._to_sequences(X_val, y_val)
        X_seq = self._normalize(X_seq)
        y_seq_norm = (y_seq - self._y_mean) / self._y_std
        self._model.eval()
        with torch.no_grad():
            X_t = torch.FloatTensor(X_seq).to(self._device)
            y_t = torch.FloatTensor(y_seq_norm).to(self._device)
            pred = self._model(X_t)
            return criterion(pred, y_t).item()

    def predict(self, X: np.ndarray | pd.DataFrame) -> np.ndarray:
        if isinstance(X, pd.DataFrame):
            X = X.values
        X_seq, _ = self._to_sequences(X)
        X_seq = self._normalize(X_seq)
        self._model.eval()
        with torch.no_grad():
            X_t = torch.FloatTensor(X_seq).to(self._device)
            pred_norm = self._model(X_t).cpu().numpy()
        # Inverse transform back to original kWh scale
        return pred_norm * self._y_std + self._y_mean

    def save(self, path: str) -> None:
        p = Path(path)
        p.mkdir(parents=True, exist_ok=True)
        torch.save(self._model.state_dict(), p / "lstm_weights.pt")
        meta = {
            "n_features": self._n_features,
            "horizon": self._horizon,
            "seq_len": self._seq_len,
            "mean": self._mean.tolist() if self._mean is not None else None,
            "std": self._std.tolist() if self._std is not None else None,
            "y_mean": self._y_mean,
            "y_std":  self._y_std,
        }
        with open(p / "lstm_meta.json", "w") as f:
            json.dump(meta, f)

    def load(self, path: str) -> None:
        p = Path(path)
        with open(p / "lstm_meta.json") as f:
            meta = json.load(f)
        self._n_features = meta["n_features"]
        self._horizon = meta["horizon"]
        self._seq_len = meta["seq_len"]
        if meta["mean"] is not None:
            self._mean = np.array(meta["mean"])
            self._std = np.array(meta["std"])
        self._y_mean = float(meta.get("y_mean", 0.0))
        self._y_std  = float(meta.get("y_std", 1.0))
        self._model = _LSTMNetwork(self._n_features, self._cfg, self._horizon).to(self._device)
        self._model.load_state_dict(torch.load(p / "lstm_weights.pt", map_location=self._device))
