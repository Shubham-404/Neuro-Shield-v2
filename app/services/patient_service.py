from sqlalchemy.orm import Session
from typing import List, Optional

from app.models.patient import Patient
from app.core.exceptions import AppException


class PatientService:
	@staticmethod
	def create(db: Session, doctor_id: int | None, data: dict) -> Patient:
		patient = Patient(doctor_id=doctor_id, **data)
		db.add(patient)
		db.commit()
		db.refresh(patient)
		return patient

	@staticmethod
	def list_all(db: Session) -> List[Patient]:
		return db.query(Patient).order_by(Patient.created_at.desc()).all()

	@staticmethod
	def get(db: Session, patient_id: int) -> Patient:
		patient = db.query(Patient).filter(Patient.id == patient_id).first()
		if not patient:
			raise AppException("Patient not found", 404)
		return patient

	@staticmethod
	def update(db: Session, patient_id: int, data: dict) -> Patient:
		patient = PatientService.get(db, patient_id)
		for k, v in data.items():
			setattr(patient, k, v)
		db.commit()
		db.refresh(patient)
		return patient

	@staticmethod
	def delete(db: Session, patient_id: int) -> None:
		patient = PatientService.get(db, patient_id)
		db.delete(patient)
		db.commit()
