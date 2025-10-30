import os
from typing import List
from sqlalchemy.orm import Session
from fastapi import UploadFile

from app.models.uploaded_file import UploadedFile
from app.core.exceptions import AppException


UPLOAD_DIR = "uploads"


class FileService:
	@staticmethod
	def ensure_upload_dir() -> None:
		os.makedirs(UPLOAD_DIR, exist_ok=True)

	@staticmethod
	def upload(db: Session, patient_id: int, uploaded_by: int | None, file: UploadFile) -> UploadedFile:
		FileService.ensure_upload_dir()
		filepath = os.path.join(UPLOAD_DIR, file.filename)
		with open(filepath, "wb") as out:
			out.write(file.file.read())
		db_file = UploadedFile(
			patient_id=patient_id,
			uploaded_by=uploaded_by,
			filename=file.filename,
			filepath=filepath,
			content_type=file.content_type or None,
		)
		db.add(db_file)
		db.commit()
		db.refresh(db_file)
		return db_file

	@staticmethod
	def list_for_patient(db: Session, patient_id: int) -> List[UploadedFile]:
		return db.query(UploadedFile).filter(UploadedFile.patient_id == patient_id).order_by(UploadedFile.uploaded_at.desc()).all()

	@staticmethod
	def delete(db: Session, file_id: int) -> None:
		f = db.query(UploadedFile).filter(UploadedFile.id == file_id).first()
		if not f:
			raise AppException("File not found", 404)
		try:
			if os.path.exists(f.filepath):
				os.remove(f.filepath)
		except Exception:
			pass
		db.delete(f)
		db.commit()
