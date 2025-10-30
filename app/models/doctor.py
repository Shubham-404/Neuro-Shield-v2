from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
from sqlalchemy.orm import relationship

from app.core.database import Base


class Doctor(Base):
	__tablename__ = "doctors"

	id = Column(Integer, primary_key=True, index=True)
	email = Column(String(255), unique=True, index=True, nullable=False)
	password_hash = Column(String(255), nullable=False)
	full_name = Column(String(255), nullable=True)
	is_active = Column(Boolean, default=True)
	is_verified = Column(Boolean, default=False)
	created_at = Column(DateTime(timezone=True), server_default=func.now())
	updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

	patients = relationship("Patient", back_populates="doctor")
	predictions = relationship("PredictionHistory", back_populates="doctor")
	uploaded_files = relationship("UploadedFile", back_populates="uploaded_by_doctor")
