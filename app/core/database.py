from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.core.config import settings


class Base(DeclarativeBase):
	pass


engine = create_engine(
	settings.database_url,
	connect_args={"check_same_thread": False} if settings.database_url.startswith("sqlite") else {},
	pool_pre_ping=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
	db = SessionLocal()
	try:
		yield db
	finally:
		db.close()


def init_db() -> None:
	# Import models to register metadata
	from app.models import doctor, patient, prediction_history, uploaded_file  # noqa: F401
	Base.metadata.create_all(bind=engine)
