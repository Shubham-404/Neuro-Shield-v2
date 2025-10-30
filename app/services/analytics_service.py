from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.patient import Patient
from app.models.prediction_history import PredictionHistory


class AnalyticsService:
	@staticmethod
	def summary(db: Session) -> dict:
		total_patients = db.query(func.count(Patient.id)).scalar() or 0
		high_risk = db.query(func.count(PredictionHistory.id)).filter(PredictionHistory.risk_level == "Highly likely").scalar() or 0
		return {"total_patients": total_patients, "high_risk_cases": high_risk}

	@staticmethod
	def common_factors(db: Session) -> dict:
		# Simple heuristic: aggregate last 100 entries by keys of key_factors
		entries = db.query(PredictionHistory).order_by(PredictionHistory.id.desc()).limit(100).all()
		factors: dict[str, int] = {}
		for e in entries:
			if e.key_factors:
				for k, v in e.key_factors.items():
					key = f"{k}:{v}"
					factors[key] = factors.get(key, 0) + 1
		return {k: v for k, v in sorted(factors.items(), key=lambda kv: kv[1], reverse=True)[:10]}
