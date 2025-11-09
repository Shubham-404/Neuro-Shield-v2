# NeuroShield ML Service

FastAPI microservice for stroke prediction using pre-trained ML models.

## Setup

1. **Install dependencies:**
   ```bash
   cd ml-service
   pip install -r requirements.txt
   ```

2. **Place your model file:**
   - Place your `.pkl` file in the `ml-service/` directory
   - Or set `MODEL_PATH` environment variable to point to your model file
   - Default filename: `model.pkl`

3. **Configure environment (optional):**
   ```bash
   # Create .env file
   MODEL_PATH=model.pkl
   ML_SERVICE_PORT=8000
   ```

4. **Run the service:**
   ```bash
   # Option 1: Using uvicorn directly
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload

   # Option 2: Using Python
   python main.py
   ```

## API Endpoints

### Health Check
```bash
GET /
GET /health
```

### Prediction
```bash
POST /predict
Content-Type: application/json

{
  "age": 65,
  "hypertension": 1,
  "heart_disease": 0,
  "avg_glucose_level": 95.0,
  "bmi": 28.5,
  "smoking_status": "formerly smoked"
}
```

**Response:**
```json
{
  "prediction": 1,
  "probability": 0.75,
  "risk_level": "High",
  "key_factors": {
    "age": 0.25,
    "hypertension": 0.15,
    "heart_disease": 0.10,
    "avg_glucose_level": 0.20,
    "bmi": 0.15,
    "smoking_status": 0.15
  }
}
```

## Model Requirements

Your PKL file should contain a scikit-learn model that:
- Has a `.predict()` method
- Optionally has a `.predict_proba()` method for probability scores
- Optionally has `.feature_importances_` attribute for feature importance

## Adjusting for Your Model

If your model expects different features or preprocessing:

1. **Update `preprocess_input()` function** in `main.py` to match your model's expected input format
2. **Update feature names** in the key_factors extraction if different
3. **Adjust smoking_status mapping** if your model uses different encoding

## Testing

```bash
# Test health endpoint
curl http://localhost:8000/health

# Test prediction
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "age": 65,
    "hypertension": 1,
    "heart_disease": 0,
    "avg_glucose_level": 95.0,
    "bmi": 28.5,
    "smoking_status": "formerly smoked"
  }'
```

