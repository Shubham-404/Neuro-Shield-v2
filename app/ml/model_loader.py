from __future__ import annotations

import os
import pickle
from typing import Any, Optional

import numpy as np

from app.core.config import settings

_model: Optional[Any] = None
_scaler: Optional[Any] = None


def load_models_at_startup() -> None:
	global _model, _scaler
	try:
		if os.path.exists(settings.ml_model_path):
			with open(settings.ml_model_path, "rb") as f:
				_model = pickle.load(f)
		except_path = settings.ml_scaler_path or ""
		if except_path and os.path.exists(except_path):
			with open(except_path, "rb") as f:
				_scaler = pickle.load(f)
	except Exception:
		# Keep None if loading fails; prediction will handle gracefully
		_model = _model


def predict_stroke(input_features: dict[str, Any]) -> dict[str, Any]:
	if _model is None:
		return {"probability": 0.0, "risk_level": "Unknown", "key_factors": {}}

	# Example preprocessing; adjust to real feature order
	numeric_features = [
		float(input_features.get("age", 0)),
		float(input_features.get("avg_glucose_level", 0)),
		float(input_features.get("bmi", 0)),
	]
	X = np.array([numeric_features])
	if _scaler is not None:
		X = _scaler.transform(X)

	# Model should output probability for positive class
	proba = 0.0
	try:
		if hasattr(_model, "predict_proba"):
			proba = float(_model.predict_proba(X)[0, 1])
		elif hasattr(_model, "predict"):
			pred = _model.predict(X)
			proba = float(pred[0]) if isinstance(pred, (list, np.ndarray)) else float(pred)
	except Exception:
		proba = 0.0

	if proba < 0.3:
		risk_level = "Less likely"
	elif proba <= 0.6:
		risk_level = "More likely"
	else:
		risk_level = "Highly likely"

	key_factors = {
		"age": "High" if input_features.get("age", 0) >= 60 else "Moderate" if input_features.get("age", 0) >= 40 else "Low",
		"glucose_level": "High" if input_features.get("avg_glucose_level", 0) >= 150 else "Moderate" if input_features.get("avg_glucose_level", 0) >= 110 else "Low",
		"bmi": "High" if input_features.get("bmi", 0) >= 30 else "Moderate" if input_features.get("bmi", 0) >= 25 else "Low",
	}

	return {
		"probability": round(proba, 4),
		"risk_level": risk_level,
		"key_factors": key_factors,
	}
