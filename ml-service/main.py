"""
FastAPI ML Service for NeuroShield (Balanced Random Forest + LIME)
Handles stroke prediction using a pre-trained Balanced RF pipeline with LIME explainability.
Compatible with Pydantic v2 (uses field_validator).
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field as PydanticField, field_validator
import joblib
import pickle
import os
import numpy as np
import logging
from typing import Optional, List, Dict, Any
from lime.lime_tabular import LimeTabularExplainer

# ==================== Logging ====================
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("NeuroShield")

# ==================== FastAPI Setup ====================
app = FastAPI(
    title="NeuroShield ML Service",
    version="2.0.0",
    description="Stroke prediction API using Balanced Random Forest with LIME explainability"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== Globals ====================
pipeline = None
explainer = None
lime_config = None

# ==================== File Paths (directly in this directory) ====================
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))

PIPELINE_PATH = os.path.join(CURRENT_DIR, "stroke_balanced_rf_pipeline.pkl")
LIME_CONFIG_PATH = os.path.join(CURRENT_DIR, "lime_config.pkl")
X_TRAIN_PATH = os.path.join(CURRENT_DIR, "X_train_lime.pkl")


# ==================== Thresholds ====================
RISK_THRESHOLDS = {"low": 0.3, "high": 0.6}

# ==================== Load Artifacts ====================
def load_artifacts():
    global pipeline, explainer, lime_config

    logger.info("=" * 60)
    logger.info("🚀 Loading Balanced RF Pipeline and LIME Configuration...")
    logger.info("=" * 60)

    try:
        # Pipeline
        if not os.path.exists(PIPELINE_PATH):
            raise FileNotFoundError(f"Missing model pipeline at {PIPELINE_PATH}")
        pipeline = joblib.load(PIPELINE_PATH)
        model = pipeline.named_steps['model']
        logger.info(f"✅ Loaded Balanced RF pipeline with model type: {type(model).__name__}")

        # LIME config
        if not os.path.exists(LIME_CONFIG_PATH):
            raise FileNotFoundError(f"Missing LIME config at {LIME_CONFIG_PATH}")
        with open(LIME_CONFIG_PATH, "rb") as f:
            lime_config = pickle.load(f)
        logger.info(f"✅ Loaded LIME configuration with {len(lime_config['feature_names'])} features")

        # X_train for LIME
        if not os.path.exists(X_TRAIN_PATH):
            raise FileNotFoundError(f"Missing X_train_lime.pkl at {X_TRAIN_PATH}")
        with open(X_TRAIN_PATH, "rb") as f:
            X_train_lime = pickle.load(f)
        logger.info(f"✅ Loaded LIME training data: {getattr(X_train_lime, 'shape', 'unknown shape')}")

        # Create LIME explainer
        explainer = LimeTabularExplainer(
            training_data=X_train_lime,
            feature_names=lime_config["feature_names"],
            class_names=lime_config.get("class_names", ["No Stroke", "Stroke"]),
            categorical_features=lime_config.get("categorical_features", []),
            categorical_names=lime_config.get("categorical_names", {}),
            mode=lime_config.get("mode", "classification"),
            random_state=lime_config.get("random_state", 42)
        )
        logger.info("✅ LIME explainer initialized successfully")

        logger.info("=" * 60)
        logger.info("✅ NeuroShield Model System Ready")
        logger.info("=" * 60)

    except Exception as e:
        logger.error(f"❌ Error loading artifacts: {e}", exc_info=True)
        raise

# ==================== Helpers ====================
def map_risk(prob: float):
    if prob < RISK_THRESHOLDS["low"]:
        return "Low", "green"
    elif prob < RISK_THRESHOLDS["high"]:
        return "Moderate", "orange"
    return "High", "red"

def generate_lime_explanation(X_transformed, num_features=5):
    if explainer is None:
        logger.warning("⚠ LIME explainer not available.")
        return []

    try:
        exp = explainer.explain_instance(
            X_transformed[0],
            pipeline.named_steps["model"].predict_proba,
            num_features=num_features,
            num_samples=500
        )
        explanations = []
        for rule, val in exp.as_list()[:num_features]:
            explanations.append({
                "name": rule.split()[0],
                "rule": rule,
                "impact": round(float(val), 4),
                "direction": "increases" if val > 0 else "decreases"
            })
        return explanations
    except Exception as e:
        logger.error(f"❌ LIME explanation failed: {e}", exc_info=True)
        return []

# ==================== Request / Response Schemas (Pydantic v2) ====================
class PredictionRequest(BaseModel):
    """
    Field names match the original dataframe column names used by the preprocessor.
    Residence_type now supports both 'residence_type' (frontend) and 'Residence_type' (model) via alias + validation_alias.
    """
    age: float
    hypertension: int
    heart_disease: int
    avg_glucose_level: float
    bmi: float
    ever_married: Optional[str] = "Yes"        # expects "Yes"/"No" but validators below accept 1/0
    gender: Optional[str] = "Male"
    work_type: Optional[str] = "Private"

    # ✅ Accept both "residence_type" and "Residence_type" as input keys
    Residence_type: Optional[str] = PydanticField(
        "Urban",
        alias="residence_type",
        validation_alias="Residence_type"
    )

    smoking_status: Optional[str] = "Unknown"

    # ✅ Pydantic v2 config
    model_config = {
        "populate_by_name": True,   # allows using attribute names when dumping to dict
        "extra": "ignore"           # ignore unexpected fields in incoming JSON
    }

    # === Normalizers ===
    @field_validator("ever_married", mode="before")
    @classmethod
    def _normalize_ever_married(cls, v):
        if v is None:
            return "No"
        if isinstance(v, bool):
            return "Yes" if v else "No"
        if isinstance(v, (int, float)):
            return "Yes" if int(v) == 1 else "No"
        if isinstance(v, str):
            s = v.strip().lower()
            if s in {"1", "true", "yes", "y", "t"}:
                return "Yes"
            if s in {"0", "false", "no", "n", "f"}:
                return "No"
            return v.capitalize()
        return "No"

    @field_validator("gender", mode="before")
    @classmethod
    def _normalize_gender(cls, v):
        if v is None:
            return "Male"
        if isinstance(v, str):
            s = v.strip().lower()
            if s.startswith("f"):
                return "Female"
            if s.startswith("o"):
                return "Other"
            return "Male" if s.startswith("m") else v.capitalize()
        return v

    @field_validator("work_type", mode="before")
    @classmethod
    def _normalize_work(cls, v):
        if v is None:
            return "Private"
        if isinstance(v, str):
            s = v.strip().lower()
            if "never" in s:
                return "Never_worked"
            if "child" in s:
                return "children"
            if "gov" in s or "government" in s:
                return "Govt_job"
            if "self" in s:
                return "Self-employed"
            if "private" in s:
                return "Private"
            return v
        return v

    @field_validator("Residence_type", mode="before")
    @classmethod
    def _normalize_residence(cls, v):
        # Accept "urban"/"Urban" or 1/0 forms
        if v is None:
            return "Urban"
        if isinstance(v, (int, float)):
            return "Urban" if int(v) == 1 else "Rural"
        if isinstance(v, str):
            s = v.strip().lower()
            return "Urban" if s.startswith("u") else "Rural"
        return v

    @field_validator("smoking_status", mode="before")
    @classmethod
    def _normalize_smoking(cls, v):
        if v is None:
            return "Unknown"
        if isinstance(v, (int, float)):
            return "smokes" if int(v) == 1 else "never smoked"
        if isinstance(v, str):
            s = v.strip().lower()
            if "former" in s or "formerly" in s:
                return "formerly smoked"
            if "never" in s:
                return "never smoked"
            if "smoke" in s:
                return "smokes"
            return "Unknown"
        return v

class LIMEFeature(BaseModel):
    name: str
    rule: str
    impact: float
    direction: str

class PredictionResponse(BaseModel):
    prediction: int
    probability: float
    risk_level: str
    risk_color: str
    prediction_label: str
    explanation_available: bool
    top_features: Optional[List[LIMEFeature]] = None

# ==================== Endpoints & Startup ====================
@app.on_event("startup")
async def startup_event():
    load_artifacts()

@app.get("/")
async def root():
    return {
        "service": "NeuroShield ML Service",
        "version": "2.0.0",
        "model_loaded": pipeline is not None,
        "explainer_available": explainer is not None
    }

@app.post("/predict", response_model=PredictionResponse)
async def predict(data: PredictionRequest):
    if pipeline is None:
        raise HTTPException(status_code=503, detail="Model pipeline not loaded")

    try:
        # Convert validated model to dict using attribute names (not aliases) so keys match preprocessor columns
        # model_dump() returns field names by default (attribute names), which we designed to match the dataframe
        input_dict = data.model_dump()  # uses field names like 'Residence_type' (not alias)
        # Make DataFrame
        import pandas as pd
        X_input = pd.DataFrame([input_dict])

        # Preprocess using pipeline's preprocessor then predict
        preprocessor = pipeline.named_steps.get("preprocessor")
        if preprocessor is None:
            # If pipeline is just the model, assume the pipeline expects already-transformed input
            X_transformed = X_input.values
        else:
            X_transformed = preprocessor.transform(X_input)

        model = pipeline.named_steps["model"]
        prob = float(model.predict_proba(X_transformed)[0][1])
        pred_class = int(prob >= 0.5)

        # Map risk & LIME explanation
        risk_level, risk_color = map_risk(prob)
        explanation = generate_lime_explanation(X_transformed)

        return PredictionResponse(
            prediction=pred_class,
            probability=round(prob, 4),
            risk_level=risk_level,
            risk_color=risk_color,
            prediction_label="Stroke" if pred_class == 1 else "No Stroke",
            explanation_available=len(explanation) > 0,
            top_features=[LIMEFeature(**e) for e in explanation] if explanation else None
        )

    except Exception as e:
        logger.error(f"❌ Prediction error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

# ==================== Server Entry ====================
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("ML_SERVICE_PORT", "8000"))
    logger.info(f"Starting NeuroShield service on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)
