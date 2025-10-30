from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.responses import success_response
from app.ml.model_loader import predict_stroke
from app.schemas.prediction import PredictInput
from app.services.prediction_service import PredictionService

router = APIRouter()


@router.post("/")
async def predict(payload: PredictInput, patient_id: int | None = None, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
	result = predict_stroke(payload.model_dump())
	if patient_id:
		PredictionService.log_prediction(
			db,
			patient_id=patient_id,
			doctor_id=current_user.id if current_user else None,
			probability=float(result["probability"]),
			risk_level=str(result["risk_level"]),
			key_factors=dict(result.get("key_factors", {})),
		)
	return success_response("Prediction complete", result)
