# ML Service Setup Guide

## Overview

The NeuroShield application uses a **separate FastAPI microservice** for ML predictions. This is the recommended approach because:

✅ **Better Performance**: Python is optimized for ML workloads  
✅ **Separation of Concerns**: ML logic is isolated from main backend  
✅ **Scalability**: Can scale ML service independently  
✅ **Easy Updates**: Update model without touching main backend  
✅ **Production Ready**: Industry standard architecture  

## Architecture

```
[Frontend] → [Node.js/Express] → [FastAPI ML Service] → [PKL Model]
                ↓
           [Supabase DB]
```

## Setup Instructions

### 1. Install Python Dependencies

```bash
cd ml-service
pip install -r requirements.txt
```

Or use a virtual environment (recommended):

```bash
cd ml-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Add Your Model File

Place your `.pkl` file in the `ml-service/` directory:

```bash
# Option 1: Place in ml-service directory
cp your_model.pkl ml-service/model.pkl

# Option 2: Use custom path (set in .env)
cp your_model.pkl ml-service/models/stroke_model.pkl
```

### 3. Configure Environment Variables

Create a `.env` file in the **root directory** (not ml-service):

```env
# ML Service Configuration
ML_SERVICE_URL=http://localhost:8000
ML_SERVICE_PORT=8000

# Optional: Custom model path
MODEL_PATH=model.pkl
```

### 4. Start the ML Service

```bash
cd ml-service
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Model loaded successfully!
```

### 5. Start the Node.js Backend

In a separate terminal:

```bash
# Make sure ML_SERVICE_URL is set in .env
npm run start:server
```

### 6. Test the Integration

1. **Test ML Service directly:**
   ```bash
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

2. **Test through Node.js backend:**
   - Login as a doctor
   - Go to a patient's page
   - Click "Run Prediction"
   - Check the response

## Customizing for Your Model

If your model expects different features or format, update `ml-service/main.py`:

### 1. Update Feature Preprocessing

In the `preprocess_input()` function:

```python
def preprocess_input(data: PredictionRequest) -> np.ndarray:
    # Adjust feature order/format to match your model
    features = np.array([[
        data.age,
        data.hypertension,
        # ... your features in the correct order
    ]])
    return features
```

### 2. Update Feature Names

If extracting feature importance:

```python
feature_names = ['age', 'hypertension', ...]  # Match your model
```

### 3. Handle Different Model Types

If your model is not scikit-learn:

```python
# For TensorFlow/Keras
import tensorflow as tf
model = tf.keras.models.load_model('model.h5')

# For XGBoost
import xgboost as xgb
model = xgb.Booster()
model.load_model('model.json')
```

## Troubleshooting

### Model Not Found
- Check that your `.pkl` file is in the correct location
- Set `MODEL_PATH` environment variable
- Check file permissions

### Prediction Errors
- Verify input format matches your model's expectations
- Check model file is not corrupted
- Review logs in ML service terminal

### Connection Errors
- Ensure ML service is running on port 8000
- Check `ML_SERVICE_URL` in Node.js `.env` file
- Verify firewall/network settings

### Port Conflicts
- Change `ML_SERVICE_PORT` in `.env` if 8000 is taken
- Update `ML_SERVICE_URL` in Node.js `.env` accordingly

## Production Deployment

### Option 1: Same Server
- Run both services on same server
- Use process manager (PM2 for Node, systemd for Python)
- Set `ML_SERVICE_URL=http://localhost:8000`

### Option 2: Separate Servers
- Deploy ML service on separate server/container
- Set `ML_SERVICE_URL=https://ml-service.yourdomain.com`
- Add authentication if needed

### Option 3: Docker
```dockerfile
# ml-service/Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Next Steps

1. ✅ Place your `.pkl` file in `ml-service/`
2. ✅ Install dependencies
3. ✅ Start ML service
4. ✅ Test prediction endpoint
5. ✅ Run prediction from frontend

Your ML integration is ready! 🚀

