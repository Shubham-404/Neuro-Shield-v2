from sqlalchemy.orm import Session
from typing import Optional

from app.models.doctor import Doctor
from app.core.security import hash_password, verify_password, create_access_token
from app.core.exceptions import AppException


class AuthService:
	@staticmethod
	def get_by_email(db: Session, email: str) -> Optional[Doctor]:
		return db.query(Doctor).filter(Doctor.email == email).first()

	@staticmethod
	def register(db: Session, email: str, password: str, full_name: str | None = None) -> Doctor:
		existing = AuthService.get_by_email(db, email)
		if existing:
			raise AppException("Email already registered", 400)
		doctor = Doctor(email=email, password_hash=hash_password(password), full_name=full_name or "")
		db.add(doctor)
		db.commit()
		db.refresh(doctor)
		return doctor

	@staticmethod
	def authenticate(db: Session, email: str, password: str) -> tuple[Doctor, str]:
		doctor = AuthService.get_by_email(db, email)
		if not doctor or not verify_password(password, doctor.password_hash):
			raise AppException("Invalid credentials", 401)
		token = create_access_token(subject=doctor.id, extra_claims={"email": doctor.email})
		return doctor, token
