#!/bin/bash
# Start ML Service
# Usage: ./start.sh or bash start.sh

echo "Starting NeuroShield ML Service..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Check if model file exists
if [ ! -f "model.pkl" ] && [ ! -f "models/model.pkl" ]; then
    echo "⚠️  WARNING: model.pkl not found!"
    echo "Please place your model.pkl file in the ml-service directory"
    echo "Or set MODEL_PATH environment variable"
fi

# Start the service
echo "Starting FastAPI server on port 8000..."
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

