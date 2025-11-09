"""
FastAPI ML Service for NeuroShield
Handles stroke prediction using pre-trained model
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle
import os
from pathlib import Path
import numpy as np
from typing import Optional, Dict, Any
import logging

# Setup logging with more detail
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(title="NeuroShield ML Service", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model on startup
model = None
model_path = os.getenv("MODEL_PATH", "model.pkl")

def load_model():
    """Load the pre-trained model from PKL file"""
    global model
    try:
        # Try to find model in current directory or models directory
        possible_paths = [
            model_path,
            f"models/{model_path}",
            f"../{model_path}",
            f"./ml-service/{model_path}",
        ]
        
        model_file = None
        for path in possible_paths:
            if os.path.exists(path):
                model_file = path
                break
        
        if not model_file:
            raise FileNotFoundError(f"Model file not found. Tried: {possible_paths}")
        
        logger.info(f"Loading model from: {model_file}")
        with open(model_file, 'rb') as f:
            model = pickle.load(f)
        logger.info("Model loaded successfully!")
        
    except Exception as e:
        logger.error(f"Error loading model: {e}")
        raise

@app.on_event("startup")
async def startup_event():
    """Load model when server starts"""
    try:
        load_model()
    except Exception as e:
        logger.error(f"Failed to load model on startup: {e}")
        logger.warning("Server will start but predictions will fail until model is loaded")
        # Don't raise - allow server to start for health checks

# Request/Response models
class PredictionRequest(BaseModel):
    age: float
    hypertension: int  # 0 or 1
    heart_disease: int  # 0 or 1
    avg_glucose_level: float
    bmi: float
    smoking_status: str  # e.g., "never smoked", "formerly smoked", "smokes", "Unknown"

class PredictionResponse(BaseModel):
    prediction: int  # 0 or 1 (0 = no stroke, 1 = stroke)
    probability: float  # Probability of stroke (0-1)
    risk_level: str  # "Low", "Moderate", or "High"
    key_factors: Optional[Dict[str, Any]] = None  # SHAP values or feature importance

def preprocess_input(data: PredictionRequest) -> np.ndarray:
    """
    Preprocess input data for model prediction
    Adjust this based on your model's expected input format
    """
    # Map smoking status to numeric if needed
    smoking_map = {
        "never smoked": 0,
        "formerly smoked": 1,
        "smokes": 2,
        "smoking": 2,
        "unknown": 0,
        "Unknown": 0,
        "": 0
    }
    
    smoking_numeric = smoking_map.get(data.smoking_status.lower() if data.smoking_status else "unknown", 0)
    
    # Ensure all values are numeric and handle None values
    age = float(data.age) if data.age is not None else 0.0
    hypertension = int(data.hypertension) if data.hypertension is not None else 0
    heart_disease = int(data.heart_disease) if data.heart_disease is not None else 0
    avg_glucose_level = float(data.avg_glucose_level) if data.avg_glucose_level is not None else 0.0
    bmi = float(data.bmi) if data.bmi is not None else 0.0
    
    # Create feature array - adjust order/features based on your model
    features = np.array([[
        age,
        hypertension,
        heart_disease,
        avg_glucose_level,
        bmi,
        smoking_numeric
    ]], dtype=np.float64)
    
    return features

def calculate_risk_level(probability: float) -> str:
    """Calculate risk level based on probability"""
    if probability >= 0.7:
        return "High"
    elif probability >= 0.4:
        return "Moderate"
    else:
        return "Low"

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "NeuroShield ML Service",
        "model_loaded": model is not None
    }

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy", "model_loaded": model is not None}

@app.get("/model-info")
async def model_info():
    """Get information about the loaded model"""
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    info = {
        "model_type": str(type(model)),
        "model_loaded": True
    }
    
    # Try to get model attributes
    try:
        if hasattr(model, 'n_features_in_'):
            info["n_features_in_"] = model.n_features_in_
        if hasattr(model, 'feature_names_in_'):
            info["feature_names_in_"] = model.feature_names_in_.tolist() if hasattr(model.feature_names_in_, 'tolist') else list(model.feature_names_in_)
        if hasattr(model, 'classes_'):
            info["classes_"] = model.classes_.tolist() if hasattr(model.classes_, 'tolist') else list(model.classes_)
        if hasattr(model, 'feature_importances_'):
            info["has_feature_importances"] = True
            info["n_features_importance"] = len(model.feature_importances_)
        if hasattr(model, 'predict_proba'):
            info["has_predict_proba"] = True
    except Exception as e:
        info["error"] = str(e)
    
    return info

@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    """
    Predict stroke risk based on patient data
    
    Expected input:
    - age: Patient age
    - hypertension: 0 or 1
    - heart_disease: 0 or 1
    - avg_glucose_level: Average glucose level
    - bmi: Body Mass Index
    - smoking_status: "never smoked", "formerly smoked", "smokes", or "Unknown"
    """
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded. Please ensure model.pkl file exists.")
    
    try:
        logger.info(f"Received prediction request: age={request.age}, hypertension={request.hypertension}, heart_disease={request.heart_disease}, avg_glucose_level={request.avg_glucose_level}, bmi={request.bmi}, smoking_status={request.smoking_status}")
        
        # Validate input values
        if request.age is None or request.age < 0:
            raise HTTPException(status_code=400, detail="Invalid age value")
        if request.avg_glucose_level is None or request.avg_glucose_level < 0:
            raise HTTPException(status_code=400, detail="Invalid avg_glucose_level value")
        if request.bmi is None or request.bmi < 0:
            raise HTTPException(status_code=400, detail="Invalid bmi value")
        
        # Preprocess input
        logger.info("Preprocessing input data...")
        features = preprocess_input(request)
        logger.info(f"Preprocessed features shape: {features.shape}, values: {features}")
        
        # Check for NaN or infinite values
        if np.isnan(features).any() or np.isinf(features).any():
            raise HTTPException(status_code=400, detail="Invalid input values (NaN or Infinity detected)")
        
        # Make prediction
        logger.info("Making prediction...")
        try:
            prediction = model.predict(features)
            logger.info(f"Raw prediction result: {prediction}, type: {type(prediction)}")
            
            # Handle different prediction output formats
            if isinstance(prediction, np.ndarray):
                prediction_value = int(prediction[0]) if len(prediction) > 0 else int(prediction)
            elif isinstance(prediction, (list, tuple)):
                prediction_value = int(prediction[0]) if len(prediction) > 0 else int(prediction)
            else:
                prediction_value = int(prediction)
                
            logger.info(f"Prediction value: {prediction_value}")
        except Exception as e:
            logger.error(f"Model prediction error: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Model prediction failed: {str(e)}. Check model input format.")
        
        # Get probability (if model supports predict_proba)
        probability = 0.0
        logger.info("Getting probability...")
        try:
            if hasattr(model, 'predict_proba'):
                probabilities = model.predict_proba(features)
                logger.info(f"Probabilities shape: {probabilities.shape if hasattr(probabilities, 'shape') else 'no shape'}, values: {probabilities}")
                
                # Handle different probability output formats
                if isinstance(probabilities, np.ndarray):
                    prob_array = probabilities[0] if len(probabilities.shape) > 1 else probabilities
                else:
                    prob_array = probabilities
                
                # Handle binary classification (2 classes) or multi-class
                if len(prob_array) >= 2:
                    probability = float(prob_array[1])  # Probability of stroke (class 1)
                else:
                    probability = float(prob_array[0])
                    
                logger.info(f"Probability from predict_proba: {probability}")
            else:
                # If model doesn't have predict_proba, use prediction as probability
                probability = float(prediction_value)
                logger.warning("Model does not support predict_proba, using prediction as probability")
        except AttributeError as e:
            # If model doesn't have predict_proba, use prediction as probability
            probability = float(prediction_value)
            logger.warning(f"Model does not support predict_proba: {e}, using prediction as probability")
        except Exception as e:
            logger.warning(f"Error getting probability: {e}, using prediction value", exc_info=True)
            probability = float(prediction_value)
        
        # Ensure probability is between 0 and 1
        probability = max(0.0, min(1.0, probability))
        logger.info(f"Final probability: {probability}")
        
        # Calculate risk level
        risk_level = calculate_risk_level(probability)
        logger.info(f"Risk level: {risk_level}")
        
        # Extract key factors (feature importance if available)
        key_factors = None
        try:
            if hasattr(model, 'feature_importances_'):
                feature_names = ['age', 'hypertension', 'heart_disease', 'avg_glucose_level', 'bmi', 'smoking_status']
                importances = model.feature_importances_
                logger.info(f"Feature importances: {importances}")
                if len(importances) == len(feature_names):
                    key_factors = dict(zip(feature_names, importances.tolist()))
                else:
                    logger.warning(f"Feature importance count ({len(importances)}) doesn't match feature names ({len(feature_names)})")
        except Exception as e:
            logger.warning(f"Could not extract feature importance: {e}")
        
        logger.info("Prediction successful!")
        return PredictionResponse(
            prediction=prediction_value,
            probability=probability,
            risk_level=risk_level,
            key_factors=key_factors
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Prediction error: {e}", exc_info=True)
        import traceback
        error_trace = traceback.format_exc()
        logger.error(f"Full traceback: {error_trace}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}. Check logs for details.")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("ML_SERVICE_PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)

