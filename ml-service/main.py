"""
FastAPI ML Service for NeuroShield
Handles stroke prediction using pre-trained XGBoost model with LIME explanations
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import pickle
import os
import numpy as np
from typing import Optional, Dict, Any, List
import logging
from lime.lime_tabular import LimeTabularExplainer

# ==================== Logging ====================

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# ==================== FastAPI Setup ====================

app = FastAPI(
    title="NeuroShield ML Service",
    version="1.0.0",
    description="Stroke prediction API with LIME explainability"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with frontend domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== Globals ====================

model = None
scaler = None
explainer = None
feature_names = None
lime_config = None

# ==================== File Paths ====================

MODEL_PATH = os.getenv("MODEL_PATH", "best_model.pkl")
SCALER_PATH = os.getenv("SCALER_PATH", "scaler.pkl")
X_TRAIN_PATH = os.getenv("X_TRAIN_PATH", "X_train_lime.pkl")
LIME_CONFIG_PATH = os.getenv("LIME_CONFIG_PATH", "lime_config.pkl")

# ======================================================
# Utility — find files in flexible locations
# ======================================================

def find_file(filename: str):
    search_paths = [
        filename,
        f"./ml-service/{filename}",
        f"../{filename}",
        f"./models/{filename}",
        f"../models/{filename}"
    ]
    for path in search_paths:
        if os.path.exists(path):
            logger.info(f"✅ Found {filename} at {path}")
            return path
    logger.error(f"❌ File {filename} not found in {search_paths}")
    return None

# ======================================================
# Load all artifacts and build explainer
# ======================================================

def load_model_artifacts():
    global model, scaler, explainer, feature_names, lime_config
    try:
        logger.info("=" * 60)
        logger.info("🚀 LOADING MODEL ARTIFACTS FOR NEUROSHIELD")
        logger.info("=" * 60)

        # --- 1. Load Model ---
        model_file = find_file(MODEL_PATH)
        if not model_file:
            raise FileNotFoundError("Model file missing")
        
        logger.info(f"Loading model from: {model_file}")
        with open(model_file, "rb") as f:
            loaded_obj = pickle.load(f)
        
        # Handle different model storage formats
        if isinstance(loaded_obj, dict):
            # Model might be stored in a dictionary
            logger.info(f"Loaded object is a dictionary with keys: {list(loaded_obj.keys())}")
            if 'model' in loaded_obj:
                model = loaded_obj['model']
                logger.info("✅ Model extracted from 'model' key")
            elif 'classifier' in loaded_obj:
                model = loaded_obj['classifier']
                logger.info("✅ Model extracted from 'classifier' key")
            elif 'xgb_model' in loaded_obj:
                model = loaded_obj['xgb_model']
                logger.info("✅ Model extracted from 'xgb_model' key")
            elif 'estimator' in loaded_obj:
                model = loaded_obj['estimator']
                logger.info("✅ Model extracted from 'estimator' key")
            else:
                # Check if any value in dict is a model
                for key, value in loaded_obj.items():
                    if hasattr(value, 'predict') and hasattr(value, 'predict_proba'):
                        model = value
                        logger.info(f"✅ Model extracted from '{key}' key")
                        break
                else:
                    raise ValueError(f"Could not find model in dictionary. Keys available: {list(loaded_obj.keys())}")
        elif hasattr(loaded_obj, 'predict') and hasattr(loaded_obj, 'predict_proba'):
            # It's already a model object
            model = loaded_obj
            logger.info("✅ Model loaded directly")
        else:
            raise ValueError(f"Unknown model format. Type: {type(loaded_obj)}, has predict: {hasattr(loaded_obj, 'predict')}")
        
        # Verify model has required methods
        if not hasattr(model, 'predict') or not hasattr(model, 'predict_proba'):
            raise ValueError(f"Loaded model missing predict/predict_proba methods. Type: {type(model)}")
        
        logger.info(f"✅ Model loaded successfully: {type(model).__name__}")

        # --- 2. Load Scaler ---
        scaler_file = find_file(SCALER_PATH)
        if scaler_file:
            with open(scaler_file, "rb") as f:
                scaler = pickle.load(f)
            logger.info("✅ Scaler loaded successfully")
        else:
            scaler = None
            logger.warning("⚠ No scaler found — predictions will be unscaled")

        # --- 3. Load Config ---
        config_file = find_file(LIME_CONFIG_PATH)
        if not config_file:
            raise FileNotFoundError("LIME config missing")
        with open(config_file, "rb") as f:
            lime_config = pickle.load(f)
        logger.info("✅ LIME config loaded")

        if not isinstance(lime_config, dict):
            raise TypeError("LIME config must be a dictionary")

        feature_names = lime_config.get("feature_names", [])
        logger.info(f"✅ {len(feature_names)} features loaded")

        # --- 4. Load X_train for LIME ---
        x_train_file = find_file(X_TRAIN_PATH)
        if not x_train_file:
            explainer = None
            logger.warning("⚠ X_train_lime.pkl not found. LIME disabled.")
        else:
            with open(x_train_file, "rb") as f:
                X_train = pickle.load(f)
            logger.info(f"✅ X_train_lime loaded: {X_train.shape}")

            # --- 5. Create LIME Explainer Safely ---
            try:
                explainer = LimeTabularExplainer(
                    training_data=X_train,
                    feature_names=lime_config["feature_names"],
                    class_names=lime_config.get("class_names", ["No Stroke", "Stroke"]),
                    categorical_features=lime_config.get("categorical_features", []),
                    categorical_names=lime_config.get("categorical_names", {}),
                    mode=lime_config.get("mode", "classification"),
                    random_state=lime_config.get("random_state", 42)
                )
                logger.info("✅ LIME explainer created successfully")
            except Exception as e:
                explainer = None
                logger.error(f"❌ Failed to create LIME explainer: {e}", exc_info=True)

        logger.info("=" * 60)
        logger.info("✅ MODEL SYSTEM READY")
        logger.info("=" * 60)

    except Exception as e:
        logger.error(f"❌ ERROR loading model artifacts: {e}", exc_info=True)
        raise

# ======================================================
# FastAPI startup event
# ======================================================

@app.on_event("startup")
async def startup_event():
    try:
        load_model_artifacts()
    except Exception as e:
        logger.error(f"Startup failed: {e}")
        logger.warning("⚠ API started without model artifacts")

# ======================================================
# Request & Response Models
# ======================================================

class PredictionRequest(BaseModel):
    age: float
    hypertension: int
    heart_disease: int
    avg_glucose_level: float
    bmi: float
    ever_married: Optional[int] = 1
    gender: Optional[str] = "Male"
    work_type: Optional[str] = "Private"
    residence_type: Optional[str] = "Urban"
    smoking_status: str

class LIMEExplanation(BaseModel):
    name: str
    rule: str
    impact: float
    direction: str

class PredictionResponse(BaseModel):
    prediction: int  # 0 or 1 (0 = no stroke, 1 = stroke) - for backend compatibility
    probability: float
    risk_level: str
    key_factors: Optional[Dict[str, Any]] = None  # Feature contributions from LIME
    # Additional fields for enhanced frontend
    prediction_label: Optional[str] = None  # "Stroke" or "No Stroke"
    risk_color: Optional[str] = None
    top_features: Optional[List[LIMEExplanation]] = None
    explanation_available: Optional[bool] = None

# ======================================================
# Helper Functions
# ======================================================

def preprocess_input(data: PredictionRequest) -> np.ndarray:
    if not feature_names:
        raise ValueError("Feature names not loaded")

    # Initialize feature dictionary with numeric features
    feature_dict = {
        "age": float(data.age),
        "avg_glucose_level": float(data.avg_glucose_level),
        "bmi": float(data.bmi),
        "hypertension": int(data.hypertension),
        "heart_disease": int(data.heart_disease),
        "ever_married": int(data.ever_married or 1)
    }

    # Gender one-hot encoding - ensure mutually exclusive
    gender = (data.gender or "male").strip().lower()
    if gender == "female":
        feature_dict["female"] = 1
        feature_dict["male"] = 0
    else:  # Default to male
        feature_dict["female"] = 0
        feature_dict["male"] = 1

    # Work type one-hot encoding - handle all cases correctly
    work = (data.work_type or "private").strip().lower()
    # Initialize all work type features to 0
    feature_dict["private_work"] = 0
    feature_dict["self_employed"] = 0
    feature_dict["government_work"] = 0
    feature_dict["children_work"] = 0
    feature_dict["never_worked"] = 0
    
    # Match work types (check in order of specificity)
    # Handle exact matches first, then partial matches
    if work == "never_worked" or "never" in work:
        feature_dict["never_worked"] = 1
    elif work == "children" or "child" in work:
        feature_dict["children_work"] = 1
    elif work == "govt_job" or "govt" in work or "government" in work:
        feature_dict["government_work"] = 1
    elif work == "self-employed" or work == "self_employed" or ("self" in work and ("employed" in work or "-" in work or "_" in work)):
        feature_dict["self_employed"] = 1
    else:  # Default to private (including "private" or any other value)
        feature_dict["private_work"] = 1

    # Residence type one-hot encoding - ensure mutually exclusive
    residence = (data.residence_type or "urban").strip().lower()
    if residence == "rural":
        feature_dict["urban_resident"] = 0
        feature_dict["rural_resident"] = 1
    else:  # Default to urban
        feature_dict["urban_resident"] = 1
        feature_dict["rural_resident"] = 0

    # Smoking status one-hot encoding - handle all cases correctly
    smoking = (data.smoking_status or "unknown").strip().lower()
    # Initialize all smoking features to 0
    feature_dict["formerly_smoked"] = 0
    feature_dict["never_smoked"] = 0
    feature_dict["smokes"] = 0
    feature_dict["smoking_unknown"] = 0
    
    # Match smoking status (check in order of specificity)
    if "formerly" in smoking or "former" in smoking:
        feature_dict["formerly_smoked"] = 1
    elif "never" in smoking:
        feature_dict["never_smoked"] = 1
    elif "smoke" in smoking or "smokes" in smoking or "smoking" in smoking:
        feature_dict["smokes"] = 1
    else:  # Default to unknown
        feature_dict["smoking_unknown"] = 1

    # Build final feature array in the exact order expected by the model
    features = []
    missing_features = []
    for f in feature_names:
        if f in feature_dict:
            features.append(feature_dict[f])
        else:
            features.append(0)
            missing_features.append(f)
    
    if missing_features:
        logger.warning(f"Features not found in feature_dict (using 0): {missing_features}")
    
    features = np.array([features], dtype=np.float64)

    # Log feature values for debugging
    logger.info(f"Preprocessed features summary:")
    logger.info(f"  - age={feature_dict.get('age', 'N/A')}")
    logger.info(f"  - gender: female={feature_dict.get('female', 0)}, male={feature_dict.get('male', 0)}")
    logger.info(f"  - hypertension={feature_dict.get('hypertension', 0)}, heart_disease={feature_dict.get('heart_disease', 0)}")
    logger.info(f"  - avg_glucose_level={feature_dict.get('avg_glucose_level', 'N/A')}, bmi={feature_dict.get('bmi', 'N/A')}")
    logger.info(f"  - ever_married={feature_dict.get('ever_married', 0)}")
    logger.info(f"  - work_type: {data.work_type} -> private={feature_dict.get('private_work', 0)}, self_employed={feature_dict.get('self_employed', 0)}, govt={feature_dict.get('government_work', 0)}")
    logger.info(f"  - residence: {data.residence_type} -> urban={feature_dict.get('urban_resident', 0)}, rural={feature_dict.get('rural_resident', 0)}")
    logger.info(f"  - smoking: {data.smoking_status} -> formerly={feature_dict.get('formerly_smoked', 0)}, never={feature_dict.get('never_smoked', 0)}, smokes={feature_dict.get('smokes', 0)}, unknown={feature_dict.get('smoking_unknown', 0)}")
    logger.info(f"Total features: {len(features[0])}, Feature names count: {len(feature_names)}")

    # Apply scaling if available
    if scaler is not None:
        try:
            if hasattr(scaler, "n_features_in_") and scaler.n_features_in_ == 3:
                # Only scale the 3 numeric features
                idxs = [feature_names.index(f) for f in ["age", "avg_glucose_level", "bmi"] if f in feature_names]
                if len(idxs) == 3:
                    features[0, idxs] = scaler.transform(features[0, idxs].reshape(1, -1))[0]
            else:
                # Scale all features
                features = scaler.transform(features)
        except Exception as e:
            logger.warning(f"Scaling failed: {e}. Continuing without scaling.")
    
    return features

def calculate_risk(prob):
    if prob < 0.3:
        return "Low", "green"
    elif prob < 0.7:
        return "Moderate", "orange"
    return "High", "red"

def generate_lime_explanation(features, num_features=5):
    if explainer is None:
        logger.warning("⚠ Explainer unavailable")
        return []

    if isinstance(explainer, dict):
        logger.error("❌ Explainer is a dict, not valid. Restart the service.")
        return []

    try:
        exp = explainer.explain_instance(
            features[0],
            model.predict_proba,
            num_features=num_features,
            num_samples=500
        )
        result = []
        for rule, val in exp.as_list()[:num_features]:
            result.append({
                "name": rule.split()[0],
                "rule": rule,
                "impact": round(float(val), 4),
                "direction": "increases" if val > 0 else "decreases"
            })
        return result
    except Exception as e:
        logger.error(f"LIME generation failed: {e}", exc_info=True)
        return []

# ======================================================
# Endpoints
# ======================================================

@app.get("/")
async def root():
    return {
        "service": "NeuroShield ML Service",
        "status": "healthy",
        "model_loaded": model is not None,
        "explainer_available": explainer is not None
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "scaler_loaded": scaler is not None,
        "explainer_loaded": explainer is not None
    }

@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    global model
    
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    # Double-check model is actually a model object, not a dict
    if isinstance(model, dict):
        raise HTTPException(
            status_code=500, 
            detail=f"Model is a dictionary, not a model object. Keys: {list(model.keys()) if model else 'empty'}"
        )
    
    if not hasattr(model, 'predict') or not hasattr(model, 'predict_proba'):
        raise HTTPException(
            status_code=500,
            detail=f"Model object missing predict methods. Type: {type(model)}"
        )

    try:
        logger.info(f"Making prediction with model type: {type(model).__name__}")
        logger.info(f"Received input data: age={request.age}, hypertension={request.hypertension}, "
                   f"heart_disease={request.heart_disease}, avg_glucose_level={request.avg_glucose_level}, "
                   f"bmi={request.bmi}, gender={request.gender}, ever_married={request.ever_married}, "
                   f"work_type={request.work_type}, residence_type={request.residence_type}, "
                   f"smoking_status={request.smoking_status}")
        
        features = preprocess_input(request)
        logger.info(f"Features shape: {features.shape}")
        logger.info(f"Feature values (first 10): {features[0][:10] if len(features[0]) > 10 else features[0]}")
        logger.info(f"Number of features: {len(features[0])}, Expected: {len(feature_names) if feature_names else 'unknown'}")
        
        prob = float(model.predict_proba(features)[0][1])
        pred_class = int(model.predict(features)[0])
        logger.info(f"Prediction result: class={pred_class}, probability={prob:.4f}")
        
        risk_level, risk_color = calculate_risk(prob)
        explanation = generate_lime_explanation(features, num_features=5)

        # Convert LIME explanations to key_factors dict for backend compatibility
        key_factors = {}
        if explanation:
            for exp in explanation:
                key_factors[exp['name']] = exp['impact']
        
        return PredictionResponse(
            prediction=pred_class,  # 0 or 1 for backend compatibility
            probability=round(prob, 4),
            risk_level=risk_level,
            key_factors=key_factors if key_factors else None,
            # Additional fields for enhanced frontend
            prediction_label="Stroke" if pred_class == 1 else "No Stroke",
            risk_color=risk_color,
            top_features=[LIMEExplanation(**e) for e in explanation] if explanation else None,
            explanation_available=len(explanation) > 0
        )
    except Exception as e:
        logger.error(f"Prediction error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/test-predict")
async def test_predict():
    sample = PredictionRequest(
        age=67,
        hypertension=1,
        heart_disease=0,
        avg_glucose_level=228.69,
        bmi=36.6,
        ever_married=1,
        gender="Male",
        work_type="Private",
        residence_type="Urban",
        smoking_status="formerly smoked"
    )
    return await predict(sample)

# ======================================================
# Server entry
# ======================================================


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("ML_SERVICE_PORT", "8000"))
    logger.info(f"Starting server on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)