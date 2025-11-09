@echo off
REM Start ML Service (Windows)
REM Usage: start.bat

echo Starting NeuroShield ML Service...

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt

REM Check if model file exists
if not exist "model.pkl" (
    if not exist "models\model.pkl" (
        echo WARNING: model.pkl not found!
        echo Please place your model.pkl file in the ml-service directory
        echo Or set MODEL_PATH environment variable
    )
)

REM Start the service
echo Starting FastAPI server on port 8000...
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

