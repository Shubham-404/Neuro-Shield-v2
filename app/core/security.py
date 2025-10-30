from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from jose import jwt
from passlib.context import CryptContext

from app.core.config import settings


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
	return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
	return pwd_context.verify(plain_password, hashed_password)


def create_access_token(subject: str | int, expires_minutes: Optional[int] = None, extra_claims: Optional[dict[str, Any]] = None) -> str:
	expire_delta = expires_minutes or settings.access_token_expire_minutes
	expire = datetime.now(timezone.utc) + timedelta(minutes=expire_delta)
	to_encode: dict[str, Any] = {"sub": str(subject), "exp": expire}
	if extra_claims:
		to_encode.update(extra_claims)
	encoded_jwt = jwt.encode(to_encode, settings.jwt_secret, algorithm=settings.jwt_algorithm)
	return encoded_jwt


def decode_token(token: str) -> dict[str, Any]:
	return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
