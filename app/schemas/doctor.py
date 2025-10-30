from pydantic import BaseModel, EmailStr
from typing import Optional


class DoctorBase(BaseModel):
	email: EmailStr
	full_name: Optional[str] = None


class DoctorCreate(DoctorBase):
	password: str


class DoctorLogin(BaseModel):
	email: EmailStr
	password: str


class DoctorOut(DoctorBase):
	id: int
	is_verified: bool

	class Config:
		from_attributes = True
