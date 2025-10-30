from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse


class AppException(Exception):
	def __init__(self, message: str, status_code: int = 400):
		self.message = message
		self.status_code = status_code


def register_exception_handlers(app: FastAPI) -> None:
	@app.exception_handler(AppException)
	async def app_exception_handler(_: Request, exc: AppException):
		return JSONResponse(status_code=exc.status_code, content={"status": "error", "message": exc.message})

	@app.exception_handler(Exception)
	async def unhandled_exception_handler(_: Request, exc: Exception):
		return JSONResponse(status_code=500, content={"status": "error", "message": "Internal server error"})
