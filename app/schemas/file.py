from pydantic import BaseModel
from typing import Optional


class FileOut(BaseModel):
	id: int
	patient_id: int
	uploaded_by: int | None
	filename: str
	filepath: str
	content_type: Optional[str] = None

	class Config:
		from_attributes = True
