from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import Optional


class Settings(BaseSettings):
	app_name: str = "NeuroShield API"
	app_env: str = "development"
	app_debug: bool = True
	app_host: str = "0.0.0.0"
	app_port: int = 8000

	# Auth
	jwt_secret: str = "change_this_secret"
	jwt_algorithm: str = "HS256"
	access_token_expire_minutes: int = 60
	cookie_secure: bool = False
	cookie_domain: Optional[str] = None

	# Database
	database_url: str = "sqlite:///./data.db"

	# Mail
	mail_username: Optional[str] = None
	mail_password: Optional[str] = None
	mail_from: Optional[str] = None
	mail_from_name: Optional[str] = "NeuroShield"
	mail_server: Optional[str] = None
	mail_port: Optional[int] = 587
	mail_tls: bool = True
	mail_ssl: bool = False

	# ML
	ml_model_path: str = "app/ml/stroke_model.pkl"
	ml_scaler_path: Optional[str] = "app/ml/scaler.pkl"

	model_config = {
		"env_file": ".env",
		"env_prefix": "",
		"case_sensitive": False,
	}

	@field_validator("database_url")
	@classmethod
	def validate_db_url(cls, v: str) -> str:
		return v


settings = Settings()
