from typing import Optional
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from app.core.config import settings


conf = ConnectionConfig(
	MAIL_USERNAME=settings.mail_username or "",
	MAIL_PASSWORD=settings.mail_password or "",
	MAIL_FROM=settings.mail_from or "no-reply@example.com",
	MAIL_FROM_NAME=settings.mail_from_name or "NeuroShield",
	MAIL_SERVER=settings.mail_server or "smtp.gmail.com",
	MAIL_PORT=int(settings.mail_port or 587),
	MAIL_STARTTLS=bool(settings.mail_tls),
	MAIL_SSL_TLS=bool(settings.mail_ssl),
	USE_CREDENTIALS=True,
	VALIDATE_CERTS=True,
)


async def send_email(subject: str, recipients: list[str], body_html: str) -> None:
	fm = FastMail(conf)
	message = MessageSchema(subject=subject, recipients=recipients, body=body_html, subtype="html")
	await fm.send_message(message)
