from typing import Any, Optional


def success_response(message: str, data: Optional[Any] = None) -> dict[str, Any]:
	resp: dict[str, Any] = {"status": "success", "message": message}
	if data is not None:
		resp["data"] = data
	return resp


def error_response(message: str, details: Optional[Any] = None) -> dict[str, Any]:
	resp: dict[str, Any] = {"status": "error", "message": message}
	if details is not None:
		resp["details"] = details
	return resp
