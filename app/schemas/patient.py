from pydantic import BaseModel
from typing import Optional


class PatientBase(BaseModel):
	full_name: str
	age: Optional[int] = None
	gender: Optional[str] = None
	phone: Optional[str] = None
	address: Optional[str] = None
	bmi: Optional[float] = None
	avg_glucose_level: Optional[float] = None


class PatientCreate(PatientBase):
	pass


class PatientUpdate(BaseModel):
	full_name: Optional[str] = None
	age: Optional[int] = None
	gender: Optional[str] = None
	phone: Optional[str] = None
	address: Optional[str] = None
	bmi: Optional[float] = None
	avg_glucose_level: Optional[float] = None


class PatientOut(PatientBase):
	id: int
	doctor_id: Optional[int] = None

	class Config:
		from_attributes = True
