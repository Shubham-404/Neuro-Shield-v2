from sqlalchemy.orm import Session
from typing import Any

from app.models.prediction_history import PredictionHistory


class PredictionService:
	@staticmethod
	def log_prediction(db: Session, patient_id: int, doctor_id: int | None, probability: float, risk_level: str, key_factors: dict[str, Any] | None) -> PredictionHistory:
		entry = PredictionHistory(
			patient_id=patient_id,
			doctor_id=doctor_id,
			probability=probability,
			risk_level=risk_level,
			key_factors=key_factors or {},
		)
		db.add(entry)
		db.commit()
		db.refresh(entry)
		return entry
