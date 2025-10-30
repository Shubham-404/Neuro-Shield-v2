from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import init_db
from app.core.exceptions import register_exception_handlers
from app.ml.model_loader import load_models_at_startup

# Routers (placeholders to be implemented)
from app.routes import auth, patients, predict, files, analytics


def create_app() -> FastAPI:
	app = FastAPI(title=settings.app_name)

	app.add_middleware(
		CORSMiddleware,
		allow_origins=["*"],
		allow_credentials=True,
		allow_methods=["*"],
		allow_headers=["*"],
	)

	init_db()
	register_exception_handlers(app)

	app.include_router(auth.router, prefix="/auth", tags=["auth"])
	app.include_router(patients.router, prefix="/patients", tags=["patients"])
	app.include_router(predict.router, prefix="/predict", tags=["predict"])
	app.include_router(files.router, prefix="/files", tags=["files"])
	app.include_router(analytics.router, prefix="/analytics", tags=["analytics"])

	@app.get("/health")
	async def health() -> dict:
		return {"status": "ok"}

	@app.on_event("startup")
	async def on_startup() -> None:
		load_models_at_startup()

	return app


app = create_app()
