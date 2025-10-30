from pydantic import BaseModel


class MessageResponse(BaseModel):
	status: str
	message: str


class DataResponse(BaseModel):
	status: str
	data: dict | list | None = None
