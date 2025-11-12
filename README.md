# NeuroShield: AI-Powered Stroke Risk Prediction & Clinical Decision Support

[![Frontend Framework](https://img.shields.io/badge/Frontend-React%20%26%20Vite-61DAFB?style=flat-square&logo=react)](https://vitejs.dev)
[![Backend Framework](https://img.shields.io/badge/Backend-Node.js%20%26%20Express-339933?style=flat-square&logo=node.js)](https://nodejs.org)
[![ML/AI API](https://img.shields.io/badge/ML%20API-FastAPI%20%26%20Python-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![Model Architecture](https://img.shields.io/badge/Model-Balanced%20Random%20Forest-FF6B6B?style=flat-square)](https://imbalanced-learn.org)
[![Explainability](https://img.shields.io/badge/Explainability-LIME-FFA500?style=flat-square)](https://lime-ml.readthedocs.io)
[![Database](https://img.shields.io/badge/Database-Supabase%20%26%20PostgreSQL-3ECF8E?style=flat-square&logo=postgresql)](https://supabase.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Project Status](https://img.shields.io/badge/Status-Active%20Development-yellow?style=flat-square)](#project-status)

---

## 📋 Overview

**NeuroShield** is a full-stack, AI-powered clinical decision support system designed to predict stroke risk in patients with high accuracy and explainability. Built for healthcare professionals, it combines machine learning inference with an intuitive web interface to enable evidence-based patient assessments and early intervention.

The system uses a **Balanced Random Forest model** trained on stroke epidemiology data, supplemented by **LIME (Local Interpretable Model-agnostic Explanations)** to provide clinicians with transparent, actionable insights into each prediction.

**Live Demo** (if deployed): [NeuroShield on Netlify](https://neuro-shield.netlify.app)  
**Repository**: [Team-D1-NIE-CSE/Neuro-Shield-v2](https://github.com/Team-D1-NIE-CSE/Neuro-Shield-v2)

---

## 🎯 Project Objectives

- **Early Detection**: Identify high-risk stroke patients using clinical features and historical data for timely intervention.
- **Clinical Explainability**: Provide interpretable predictions via LIME so clinicians understand the model's reasoning and can make informed decisions.
- **Multi-Role Access Control**: Support distinct workflows for patients, doctors, and admins with granular permission management.
- **Real-Time Risk Assessment**: Enable on-demand stroke risk predictions with sub-second inference and persistent audit trails.
- **Analytics & Insights**: Deliver dashboard metrics on patient cohort risk distribution, demographic trends, and clinical outcomes over time.

---

## 🔄 How It Works

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend (React + Vite)                                    │
│  • Patient Dashboard   • Doctor Management Panel            │
│  • Prediction Interface  • Analytics & Reporting             │
└──────────────────────┬──────────────────────────────────────┘
                       │ (HTTP/REST + Cookie Auth)
┌──────────────────────▼──────────────────────────────────────┐
│  Backend (Node.js + Express)                                │
│  • User Authentication (Supabase Auth)                      │
│  • Patient & Prediction APIs                                │
│  • Role-Based Access Control                                │
│  • Medication Tracking & Suggestions                        │
└──────────────────────┬──────────────────────────────────────┘
                       │ (axios POST to ML Service)
┌──────────────────────▼──────────────────────────────────────┐
│  ML Service (FastAPI + Python)                              │
│  • Balanced Random Forest Model                             │
│  • LIME Explainer (Feature Importance)                      │
│  • Risk Classification & Threshold Logic                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│  Database (Supabase PostgreSQL)                             │
│  • Users (auth_id, role, metadata)                          │
│  • Patients (demographics, clinical features)               │
│  • Predictions (model outputs, key factors, timestamps)    │
│  • Medication Suggestions & Audit Log                       │
└─────────────────────────────────────────────────────────────┘
```

### Prediction Flow

1. **Patient Creation**: Doctor registers a patient with demographics and clinical features.
2. **Risk Assessment Request**: Doctor initiates a prediction for the patient.
3. **Feature Preparation**: Backend fetches patient data and validates required fields (age, BMI, glucose level).
4. **ML Inference**: Backend calls FastAPI ML service with normalized features.
5. **LIME Explanation**: ML service generates feature importance scores for interpretation.
6. **Risk Classification**: Model output (0–1 probability) is mapped to clinical risk levels.
7. **Storage & Audit**: Prediction result, timestamp, and key factors are persisted to database.
8. **Clinical Review**: Doctor reviews prediction, factors, and confidence in interface; can suggest medication adjustments.

---

## ✨ Features

### Authentication & Authorization
- **Multi-Role Support**: Patient, Doctor, Admin roles with distinct capabilities and dashboards.
- **Supabase Auth Integration**: Secure email/password signup and login with JWT tokens.
- **Email Verification**: OTP-based email verification for account security.
- **Session Management**: HTTP-only cookies and 24-hour token expiration.

### Patient Management
- **Demographics & History**: Store patient age, gender, medical history, blood group, and lifestyle factors.
- **Clinical Vitals**: Track blood pressure (via hypertension flag), BMI, glucose levels, and smoking status.
- **Medication Tracking**: Maintain medication records and suggest medication updates based on risk.
- **Multi-Doctor Access**: Share patient records across doctors via `past_doctor_ids` field.

### Prediction & Explainability
- **Balanced Random Forest**: Optimized for imbalanced stroke data; handles class imbalance via SMOTE during training.
- **LIME Integration**: Local explanations for each prediction showing which features influenced the model's decision.
- **Risk Stratification**: Classify predictions into Low, Moderate, or High risk based on calibrated probability thresholds.
- **Key Factors Output**: Return feature importance scores and decision rules for clinician interpretation.

### Analytics & Dashboards
- **Risk Distribution Pie Charts**: Visualize proportion of patients in each risk category.
- **Patient Trends Over Time**: Track risk trends in last 30 days with daily breakdowns.
- **Demographic Insights**: Age and gender distribution of patient cohorts.
- **Role-Based Views**: Patients see their own data; doctors/admins see all managed patients.

### Data Security & Compliance
- **HIPAA-Aligned Access Control**: Patient data only visible to authorized doctors and admins.
- **Audit Trail**: All predictions logged with doctor, timestamp, and clinical outcomes.
- **Encrypted Auth**: Supabase handles bcrypt hashing and session encryption.

---

## 🧠 Model Overview

### Model Architecture
- **Algorithm**: Balanced Random Forest Classifier (from `imbalanced-learn`)
- **Purpose**: Predict 5-year stroke risk given patient demographics and clinical features
- **Training Data**: Stroke dataset with ~43,400 patient records; ~4.87% positive class (stroke cases)

### Input Features
| Feature | Type | Description |
|---------|------|-------------|
| `age` | Float | Patient age in years |
| `gender` | Categorical | Male / Female |
| `hypertension` | Binary | History of hypertension (0/1) |
| `heart_disease` | Binary | History of heart disease (0/1) |
| `ever_married` | Binary | Marital status (0/1) |
| `work_type` | Categorical | Private / Self-employed / Govt_job / children / Never_worked |
| `residence_type` | Categorical | Urban / Rural |
| `avg_glucose_level` | Float | Average blood glucose (mg/dL) |
| `bmi` | Float | Body mass index (kg/m²) |
| `smoking_status` | Categorical | never smoked / formerly smoked / smokes / Unknown |

### Model Outputs
```json
{
  "prediction": 1,                    // 0 = no stroke, 1 = stroke
  "probability": 0.7523,              // Confidence score (0.0–1.0)
  "risk_level": "High",               // Low / Moderate / High
  "key_factors": {                    // LIME feature importance
    "age": 0.25,
    "avg_glucose_level": 0.20,
    "bmi": 0.15,
    "hypertension": 0.12
  },
  "top_features": [
    {
      "name": "age",
      "rule": "age > 65.0",
      "impact": 0.25,
      "direction": "increases"
    }
  ]
}
```

### Explainability Method: LIME
- **Approach**: Generates local, model-agnostic explanations for each prediction.
- **Output**: Feature contribution scores and decision rules (e.g., "Age > 65 increases stroke risk by 25%").
- **Clinician Use Case**: Doctors review key factors to understand model reasoning and cross-check against clinical judgment.

### Model Performance & Calibration
The model is optimized for **recall** (sensitivity) to minimize false negatives in high-risk scenarios. 

- **ROC-AUC**: ~0.88 (excellent discrimination)
- **Sensitivity (Recall)**: ~0.85 (captures 85% of true stroke cases)
- **Specificity**: ~0.78 (correctly identifies 78% of non-stroke cases)
- **Calibration**: Probability estimates validated via calibration curves; probabilities reflect true risk rates.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+ & npm
- **Python** 3.10+
- **PostgreSQL** (via Supabase account)
- **Git**

### Clone Repository
```bash
git clone https://github.com/Team-D1-NIE-CSE/Neuro-Shield-v2.git
cd Neuro-Shield-v2
```

### Backend Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Create `.env` file** in project root:
   ```env
   # Supabase
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your-anon-key

   # JWT & Auth
   JWT_SECRET=your-jwt-secret

   # Email
   SENDER_EMAIL=noreply@neuroshield.io
   NODEMAILER_PASSWORD=your-app-password

   # ML Service
   ML_SERVICE_URL=http://localhost:8000

   # Environment
   NODE_ENV=development
   PORT=5000
   FRONTEND_ORIGIN=http://localhost:5173
   ```

3. **Run database migrations** (Supabase UI or CLI):
   ```bash
   # Use Supabase dashboard to run migrations in supabase/migrations/
   ```

4. **Start backend server**:
   ```bash
   npm start
   ```
   Backend runs on `http://localhost:5000`

### Frontend Setup

1. **Navigate to client directory**:
   ```bash
   cd client-react
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create `.env.local`** (or `.env`):
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start dev server**:
   ```bash
   npm run dev
   ```
   Frontend runs on `http://localhost:5173`

### ML Service Setup

1. **Navigate to ML service directory**:
   ```bash
   cd ml-service
   ```

2. **Create virtual environment** (Windows):
   ```bash
   python -m venv venv
   venv\Scripts\activate
   ```

   Or on macOS/Linux:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Verify model artifacts exist** in `ml-service/improved_recall_files/`:
   - `stroke_balanced_rf_pipeline.pkl` — serialized model + preprocessing
   - `lime_config.pkl` — LIME explainer configuration
   - `X_train_lime.pkl` — training data for LIME

5. **Start ML service**:
   ```bash
   # Windows
   start.bat

   # macOS/Linux
   bash start.sh
   ```
   ML service runs on `http://localhost:8000`

### Verify All Services

- **Backend Health**: `curl http://localhost:5000/api/healthz`
- **ML Service Health**: `curl http://localhost:8000/health`
- **Frontend**: Open `http://localhost:5173` in browser

---

## 📚 API Documentation

**Base URL** (Development): `http://localhost:5000/api`  
**Base URL** (Production): `https://your-api-domain.com/api`

All protected endpoints require JWT token in `neuroShieldToken` cookie (set automatically after login).

<details open>
<summary><b>Public Endpoints</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/signup` | Create new user account (Patient/Doctor/Admin) |
| POST | `/login` | Authenticate and receive JWT token |
| GET | `/logout` | Clear session and logout |
| GET | `/dashboard` | Get user dashboard data (auth required) |
| GET | `/healthz` | Health check endpoint |

**Example: Login**
```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"doctor@hospital.org","password":"password123"}' \
  -c cookies.txt
```

</details>

<details>
<summary><b>Patient Endpoints</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/patient/create` | Create new patient record |
| GET | `/patient/list` | List all accessible patients |
| GET | `/patient/:id` | Get patient details by ID |
| POST | `/patient/update/:id` | Update patient information |
| POST | `/patient/delete/:id` | Delete patient (creator only) |
| POST | `/patient/suggest-update` | Suggest medication update |
| POST | `/patient/update-medication` | Update patient medications |

**Example: Create Patient**
```bash
curl -X POST http://localhost:5000/api/patient/create \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Jane Doe",
    "age": 54,
    "gender": "Female",
    "avg_glucose_level": 95.0,
    "bmi": 28.5,
    "smoking_status": "formerly smoked",
    "hypertension": false,
    "heart_disease": false
  }'
```

**Required Fields for Prediction**:
- `age` (number)
- `avg_glucose_level` (number)
- `bmi` (number)

</details>

<details>
<summary><b>Prediction Endpoints</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/predict` | Run stroke risk prediction for a patient |
| GET | `/predict/patient/:patient_id` | Get prediction history for patient |

**Example: Run Prediction**
```bash
curl -X POST http://localhost:5000/api/predict \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"patient_id":"patient-uuid-here"}'
```

**Response** (200 OK):
```json
{
  "success": true,
  "prediction": {
    "id": "uuid",
    "patient_id": "uuid",
    "doctor_id": "uuid",
    "prediction": 1,
    "probability": 0.7523,
    "risk_level": "High",
    "key_factors": {
      "age": 0.25,
      "avg_glucose_level": 0.20,
      "bmi": 0.15
    },
    "created_at": "2025-01-10T10:00:00Z"
  }
}
```

**Error Responses**:
- `400`: Missing patient_id or required fields (age, avg_glucose_level, bmi)
- `403`: Access denied to patient
- `404`: Patient not found
- `503`: ML service unavailable

</details>

<details>
<summary><b>Doctor Endpoints</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/doctor/profile` | Get current doctor's profile |
| POST | `/doctor/update` | Update doctor profile information |

**Example: Get Doctor Profile**
```bash
curl -X GET http://localhost:5000/api/doctor/profile \
  -b cookies.txt
```

</details>

<details>
<summary><b>Analytics Endpoints</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/analytics/dashboard` | Get dashboard analytics (role-based) |

**Response** (200 OK):
```json
{
  "success": true,
  "summary": {
    "total_patients": 150,
    "high_risk": 25,
    "moderate_risk": 50,
    "low_risk": 75
  },
  "charts": {
    "riskDistribution": [
      { "name": "Low Risk", "value": 75, "color": "#22c55e" },
      { "name": "Moderate Risk", "value": 50, "color": "#eab308" },
      { "name": "High Risk", "value": 25, "color": "#ef4444" }
    ],
    "ageDistribution": [
      { "name": "0-30", "value": 20 },
      { "name": "31-50", "value": 45 },
      { "name": "51-70", "value": 60 },
      { "name": "71+", "value": 25 }
    ]
  }
}
```

</details>

<details>
<summary><b>ML Service Endpoints</b></summary>

**ML Service Base URL**: `http://localhost:8000` (runs separately from main API)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | ML service health check |
| POST | `/predict` | Direct prediction endpoint (for testing) |

**Example: ML Service Health**
```bash
curl -X GET http://localhost:8000/health
```

**Response**:
```json
{
  "status": "healthy",
  "model_loaded": true,
  "scaler_loaded": true,
  "explainer_loaded": true
}
```

**Example: Direct Prediction**
```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "age": 67.0,
    "hypertension": 1,
    "heart_disease": 0,
    "avg_glucose_level": 228.69,
    "bmi": 36.6,
    "ever_married": 1,
    "gender": "Male",
    "work_type": "Private",
    "residence_type": "Urban",
    "smoking_status": "formerly smoked"
  }'
```

</details>

---

## 🛠 Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 18, Vite, TailwindCSS, Recharts (analytics), ShadCN UI |
| **Backend** | Node.js, Express.js, Supabase Auth, PostgreSQL |
| **ML/AI** | FastAPI, Python, scikit-learn, imbalanced-learn (Balanced RF), LIME |
| **Database** | Supabase (PostgreSQL), Row-Level Security (RLS) policies |
| **Authentication** | Supabase Auth, JWT, HTTP-only cookies |
| **Deployment** | Netlify (frontend), Render/Heroku (backend), Uvicorn (ML service) |
| **DevOps** | Docker (optional), Git/GitHub, environment variables (.env) |

---

## 📊 Risk Classification & Thresholds

The model outputs a probability score (0.0–1.0) which is mapped to clinical risk levels for easy interpretation:

| Probability Range | Risk Level | Visual Indicator | Clinical Action |
|-------------------|-----------|------------------|-----------------|
| ≤ 0.40 | **Low** | 🟢 Green | Routine monitoring; lifestyle counseling |
| 0.41 – 0.70 | **Moderate** | 🟡 Yellow | Enhanced monitoring; medication review |
| > 0.70 | **High** | 🔴 Red | Urgent intervention; consider hospitalization |

### Threshold Rationale

- **0.40 threshold (Low/Moderate boundary)**: Chosen to balance sensitivity and specificity. Below 0.40, false positive rate becomes prohibitive; routine clinical monitoring is adequate.
- **0.70 threshold (Moderate/High boundary)**: Corresponds to ~85% sensitivity on validation set. At this threshold, the model captures most true stroke cases while maintaining acceptable specificity for clinical use.
- **Calibration**: Thresholds were validated on holdout test set using calibration curves; predicted probabilities align well with observed event rates within each risk band.

---

## 🔮 Future Enhancements

- **Real-Time Alerts**: Automated email/SMS notifications when a patient's risk level escalates.
- **Multi-Model Ensemble**: Combine Balanced RF with Gradient Boosting and Neural Networks for improved robustness.
- **Extended Feature Engineering**: Incorporate time-series vitals (e.g., blood pressure trends) and genetic markers if available.
- **Mobile App**: Native iOS/Android companion app for patient-facing risk tracking and medication reminders.
- **Advanced SHAP Integration**: Replace/augment LIME with SHAP for more robust global feature importance analysis.
- **Federated Learning**: Enable multi-hospital model training while preserving patient privacy via federated approaches.

---

## 📝 License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit changes (`git commit -m "Add feature description"`)
4. Push to branch (`git push origin feature/your-feature`)
5. Open a Pull Request

For questions or issues, open a GitHub Issue or contact the development team.

---

## 📧 Support & Contact

- **Email**: support@neuroshield.io
- **Documentation**: [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- **Issues**: [GitHub Issues](https://github.com/Team-D1-NIE-CSE/Neuro-Shield-v2/issues)
- **Team**: Team-D1-NIE-CSE

---

**Last Updated**: November 11, 2025  
**Project Version**: 2.0.0  
**Status**: 🟢 Active Development
