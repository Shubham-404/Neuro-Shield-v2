from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.responses import success_response
from app.services.analytics_service import AnalyticsService

router = APIRouter()


@router.get("/summary")
async def analytics_summary(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
	data = AnalyticsService.summary(db)
	return success_response("Summary ready", data)


@router.get("/factors")
async def analytics_factors(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
	data = AnalyticsService.common_factors(db)
	return success_response("Factors ready", data)
