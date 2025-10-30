from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship

from app.core.database import Base


class UploadedFile(Base):
	__tablename__ = "uploaded_files"

	id = Column(Integer, primary_key=True, index=True)
	patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
	uploaded_by = Column(Integer, ForeignKey("doctors.id", ondelete="SET NULL"), nullable=True, index=True)
	filename = Column(String(255), nullable=False)
	filepath = Column(String(512), nullable=False)
	content_type = Column(String(100), nullable=True)
	uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

	patient = relationship("Patient", back_populates="files")
	uploaded_by_doctor = relationship("Doctor", back_populates="uploaded_files")
