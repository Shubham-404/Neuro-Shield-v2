from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.responses import success_response
from app.services.file_service import FileService

router = APIRouter()


@router.post("/upload")
async def upload_file(patient_id: int, file: UploadFile = File(...), db: Session = Depends(get_db), current_user=Depends(get_current_user)):
	db_file = FileService.upload(db, patient_id=patient_id, uploaded_by=current_user.id if current_user else None, file=file)
	return success_response("File uploaded", {"file": {"id": db_file.id, "filename": db_file.filename}})


@router.get("/{patient_id}")
async def list_files(patient_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
	files = FileService.list_for_patient(db, patient_id)
	data = [
		{"id": f.id, "filename": f.filename, "content_type": f.content_type, "uploaded_at": f.uploaded_at.isoformat() if f.uploaded_at else None}
		for f in files
	]
	return success_response("Files fetched", data)


@router.delete("/{file_id}")
async def delete_file(file_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
	FileService.delete(db, file_id)
	return success_response("File deleted")
