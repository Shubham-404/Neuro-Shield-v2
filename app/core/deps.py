from typing import Optional
from fastapi import Depends, Header, Cookie
from sqlalchemy.orm import Session
from jose import JWTError

from app.core.database import get_db
from app.core.security import decode_token
from app.models.doctor import Doctor


def get_current_user(
	Authorization: Optional[str] = Header(default=None),
	access_token: Optional[str] = Cookie(default=None),
	db: Session = Depends(get_db),
) -> Optional[Doctor]:
	token: Optional[str] = None
	if Authorization and Authorization.lower().startswith("bearer "):
		token = Authorization.split(" ", 1)[1]
	elif access_token:
		token = access_token
	if not token:
		return None
	try:
		payload = decode_token(token)
		doctor_id = int(payload.get("sub"))
		doctor = db.query(Doctor).get(doctor_id)
		return doctor
	except (JWTError, Exception):
		return None
