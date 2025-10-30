from pydantic import BaseModel
from typing import Any, Optional


class PredictInput(BaseModel):
	age: Optional[float] = None
	avg_glucose_level: Optional[float] = None
	bmi: Optional[float] = None
	# extend with more features later


class PredictResult(BaseModel):
	risk_level: str
	probability: float
	key_factors: dict[str, Any]


class PredictionHistoryOut(BaseModel):
	id: int
	patient_id: int
	doctor_id: int | None
	probability: float
	risk_level: str
	key_factors: dict[str, Any] | None

	class Config:
		from_attributes = True
