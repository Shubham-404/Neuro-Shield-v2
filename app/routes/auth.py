from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.config import settings
from app.core.deps import get_current_user
from app.core.email import send_email
from app.core.responses import success_response
from app.schemas.doctor import DoctorCreate, DoctorLogin, DoctorOut
from app.services.auth_service import AuthService

router = APIRouter()


@router.post("/register", response_model=dict)
async def register(payload: DoctorCreate, response: Response, db: Session = Depends(get_db)):
	doctor = AuthService.register(db, email=payload.email, password=payload.password, full_name=payload.full_name)
	_, token = AuthService.authenticate(db, email=payload.email, password=payload.password)
	response.set_cookie(
		key="access_token",
		value=token,
		http_only=True,
		secure=bool(settings.cookie_secure),
		domain=settings.cookie_domain,
		max_age=settings.access_token_expire_minutes * 60,
		path="/",
	)
	# Send verification email (OTP flow stub)
	try:
		await send_email(
			subject="Verify your email",
			recipients=[payload.email],
			body_html=f"<p>Your verification code is: <b>123456</b></p>",
		)
	except Exception:
		pass
	return success_response("Registered successfully", {"user": {"id": doctor.id, "email": doctor.email}})


@router.post("/login", response_model=dict)
async def login(payload: DoctorLogin, response: Response, db: Session = Depends(get_db)):
	doctor, token = AuthService.authenticate(db, email=payload.email, password=payload.password)
	response.set_cookie(
		key="access_token",
		value=token,
		http_only=True,
		secure=bool(settings.cookie_secure),
		domain=settings.cookie_domain,
		max_age=settings.access_token_expire_minutes * 60,
		path="/",
	)
	return success_response("Logged in", {"user": {"id": doctor.id, "email": doctor.email}})


@router.post("/verify-email", response_model=dict)
async def verify_email(_: dict, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
	# Replace with real OTP verification and user flag update
	if not current_user:
		return success_response("Not authenticated", {"verified": False})
	current_user.is_verified = True
	db.add(current_user)
	db.commit()
	return success_response("Email verified", {"verified": True})


@router.post("/send-verify-otp", response_model=dict)
async def send_verify_otp(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
	if not current_user:
		return success_response("Not authenticated", {"sent": False})
	try:
		await send_email(
			subject="Your verification code",
			recipients=[current_user.email],
			body_html=f"<p>Your verification code is: <b>123456</b></p>",
		)
		return success_response("OTP sent", {"sent": True})
	except Exception:
		return success_response("Failed to send OTP", {"sent": False})


@router.get("/profile", response_model=dict)
async def profile(current_user=Depends(get_current_user)):
	if not current_user:
		return success_response("Not authenticated", {"user": None})
	return success_response("Profile fetched", {"user": {"id": current_user.id, "email": current_user.email, "is_verified": current_user.is_verified}})
