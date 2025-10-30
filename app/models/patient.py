from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship

from app.core.database import Base


class Patient(Base):
	__tablename__ = "patients"

	id = Column(Integer, primary_key=True, index=True)
	doctor_id = Column(Integer, ForeignKey("doctors.id", ondelete="SET NULL"), nullable=True, index=True)
	full_name = Column(String(255), nullable=False)
	age = Column(Integer, nullable=True)
	gender = Column(String(50), nullable=True)
	phone = Column(String(50), nullable=True)
	address = Column(String(255), nullable=True)
	bmi = Column(Float, nullable=True)
	avg_glucose_level = Column(Float, nullable=True)
	created_at = Column(DateTime(timezone=True), server_default=func.now())
	updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

	doctor = relationship("Doctor", back_populates="patients")
	predictions = relationship("PredictionHistory", back_populates="patient")
	files = relationship("UploadedFile", back_populates="patient")
