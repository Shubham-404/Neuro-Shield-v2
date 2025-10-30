from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.responses import success_response
from app.schemas.patient import PatientCreate, PatientUpdate
from app.services.patient_service import PatientService

router = APIRouter()


@router.post("/")
async def create_patient(payload: PatientCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
	doctor_id = current_user.id if current_user else None
	patient = PatientService.create(db, doctor_id=doctor_id, data=payload.model_dump())
	return success_response("Patient created", {"patient": {"id": patient.id}})


@router.get("/")
async def list_patients(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
	patients = PatientService.list_all(db)
	data = [
		{
			"id": p.id,
			"full_name": p.full_name,
			"age": p.age,
			"gender": p.gender,
			"bmi": p.bmi,
			"avg_glucose_level": p.avg_glucose_level,
		}
		for p in patients
	]
	return success_response("Patients fetched", data)


@router.get("/{patient_id}")
async def get_patient(patient_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
	p = PatientService.get(db, patient_id)
	data = {
		"id": p.id,
		"full_name": p.full_name,
		"age": p.age,
		"gender": p.gender,
		"phone": p.phone,
		"address": p.address,
		"bmi": p.bmi,
		"avg_glucose_level": p.avg_glucose_level,
	}
	return success_response("Patient fetched", data)


@router.put("/{patient_id}")
async def update_patient(patient_id: int, payload: PatientUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
	p = PatientService.update(db, patient_id, {k: v for k, v in payload.model_dump().items() if v is not None})
	return success_response("Patient updated", {"id": p.id})


@router.delete("/{patient_id}")
async def delete_patient(patient_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
	PatientService.delete(db, patient_id)
	return success_response("Patient deleted")
