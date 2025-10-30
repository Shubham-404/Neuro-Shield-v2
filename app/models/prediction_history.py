from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, JSON, func
from sqlalchemy.orm import relationship

from app.core.database import Base


class PredictionHistory(Base):
	__tablename__ = "prediction_history"

	id = Column(Integer, primary_key=True, index=True)
	patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
	doctor_id = Column(Integer, ForeignKey("doctors.id", ondelete="SET NULL"), nullable=True, index=True)
	probability = Column(Float, nullable=False)
	risk_level = Column(String(50), nullable=False)
	key_factors = Column(JSON, nullable=True)
	created_at = Column(DateTime(timezone=True), server_default=func.now())

	patient = relationship("Patient", back_populates="predictions")
	doctor = relationship("Doctor", back_populates="predictions")
