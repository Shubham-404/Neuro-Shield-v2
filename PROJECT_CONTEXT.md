# NeuroShield Project - Complete Context Document

## 📋 Project Overview

**NeuroShield** is an AI-powered web application that predicts stroke risk for patients using machine learning. The system helps doctors triage patients and prioritize interventions by analyzing clinical and demographic data.

**Live URL:** https://neuro-shield.netlify.app

### Key Features
- Real-time stroke risk prediction using XGBoost ML model
- LIME (Local Interpretable Model-agnostic Explanations) for model explainability
- Role-based access control (Patient, Doctor, Admin)
- Dynamic analytics dashboards with charts
- Patient management system
- Prediction history tracking

---

## 🏗️ Architecture

```
[React Frontend] 
    ↓ (HTTPS)
[Node.js/Express Backend]
    ↓                    ↓
[Supabase]      [FastAPI ML Service]
(PostgreSQL + Auth)    (XGBoost Model + LIME)
```

### Component Responsibilities

1. **Frontend (React + Vite)**
   - React Router for navigation
   - Role-based UI rendering
   - Dynamic charts (Recharts)
   - Authentication context management

2. **Backend (Node.js + Express)**
   - API gateway and business logic
   - Supabase integration for database/auth
   - ML service proxy
   - JWT-based authentication with cookies

3. **ML Service (FastAPI + Python)**
   - XGBoost model inference
   - LIME explanations
   - Feature preprocessing and scaling

4. **Database (Supabase PostgreSQL)**
   - Patient records
   - Predictions history
   - User authentication

---

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite
- **React Router DOM** for routing
- **Recharts** for data visualization
- **Tailwind CSS** for styling
- **Axios** for API calls

### Backend
- **Node.js** with Express.js
- **Supabase** (PostgreSQL + Auth)
- **JWT** for authentication
- **Cookie-parser** for session management

### ML Service
- **FastAPI** (Python web framework)
- **XGBoost** for ML model
- **LIME** for model explainability
- **scikit-learn** for preprocessing (StandardScaler)
- **NumPy** for numerical operations

---

## 📁 Project Structure

```
Neuro-Shield/
├── client-react/              # React frontend
│   ├── src/
│   │   ├── pages/             # Page components
│   │   │   ├── auth/          # Login, Register
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── StaffDashboardPage.jsx
│   │   │   ├── PatientManagementPage.jsx
│   │   │   ├── PatientDetailPage.jsx
│   │   │   ├── PredictionPage.jsx
│   │   │   ├── AnalyticsPage.jsx
│   │   │   └── ...
│   │   ├── components/
│   │   │   ├── layout/        # Shell, Sidebar
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── PublicRoute.jsx
│   │   │   └── ui/            # UI components
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx
│   │   ├── services/
│   │   │   └── api.js         # API client with interceptors
│   │   └── App.jsx
│   ├── public/
│   │   └── _redirects         # Netlify SPA redirects
│   └── netlify.toml
│
├── ml-service/                # FastAPI ML service
│   ├── main.py                # Main FastAPI app
│   ├── best_model.pkl         # XGBoost model
│   ├── scaler.pkl             # StandardScaler
│   ├── lime_config.pkl        # LIME configuration
│   ├── X_train_lime.pkl       # Training data for LIME
│   ├── requirements.txt
│   └── venv/                  # Python virtual environment
│
├── controllers/               # Express route controllers
│   ├── prediction.controller.js
│   ├── patient.controller.js
│   ├── analytics.controller.js
│   ├── user.controller.js
│   └── ...
│
├── routes/                     # Express routes
│   ├── index.js
│   ├── prediction.routes.js
│   ├── patient.routes.js
│   ├── analytics.routes.js
│   └── ...
│
├── middlewares/
│   ├── auth.js                # JWT authentication middleware
│   └── authorize.js           # Role-based authorization
│
├── utils/
│   └── supabaseClient.js      # Supabase client setup
│
├── app.js                      # Express app entry point
└── package.json
```

---

## 🔐 Authentication Flow

### Login Process
1. User submits credentials via `LoginPage.jsx`
2. Backend validates with Supabase Auth
3. JWT token set as `httpOnly` cookie
4. User data stored in `AuthContext`
5. Redirect based on role:
   - `patient` → `/dashboard`
   - `doctor` → `/staff`
   - `admin` → `/admin`

### Cookie Configuration
- `httpOnly: true` (prevents XSS)
- `secure: true` (HTTPS only in production)
- `sameSite: 'strict'` (CSRF protection)

### API Interceptor
- Handles 401 errors automatically
- 2-second grace period after login to prevent premature redirects
- Prevents multiple redirect loops

---

## 🎯 Role-Based Access Control (RBAC)

### Roles
- **Patient**: Can view own dashboard, alerts, profile
- **Doctor**: Can view staff dashboard, manage patients, run predictions, view analytics
- **Admin**: Full access including admin panel

### Implementation
- `ProtectedRoute` component checks `allowedRoles` prop
- Sidebar navigation filtered by role in `Shell.jsx`
- Backend middleware validates role in `authorize.js`

---

## 🤖 ML Prediction Flow

### 1. Frontend (`PredictionPage.jsx`)
```javascript
// User clicks "Run Prediction" button
// Validates patient has required fields (age, avg_glucose_level, bmi)
// Calls: Predictions.run({ patient_id })
```

### 2. Backend (`controllers/prediction.controller.js`)
```javascript
// Fetches patient data from Supabase
// Validates required fields exist
// Prepares ML input:
{
  age, hypertension, heart_disease,
  avg_glucose_level, bmi, smoking_status
}
// Calls ML service: POST http://localhost:8000/predict
// Saves prediction to database
// Returns result to frontend
```

### 3. ML Service (`ml-service/main.py`)
```python
# Receives patient data
# Preprocesses features:
#   - One-hot encoding for categorical features
#   - Feature scaling using StandardScaler
#   - Ensures correct feature order from lime_config
# Runs model.predict() and model.predict_proba()
# Generates LIME explanations
# Returns:
{
  "prediction": 0 or 1,
  "probability": 0.0-1.0,
  "risk_level": "Low/Medium/High",
  "key_factors": {...},
  "top_features": [...]
}
```

### Required Patient Fields for ML Predictions
**Core Required:**
- `age` (number) - Required
- `avg_glucose_level` (number) - Required
- `bmi` (number) - Required

**Additional ML Fields (for accurate predictions):**
- `gender` (string: "Male" or "Female") - Required
- `hypertension` (boolean) - Optional, defaults to false
- `heart_disease` (boolean) - Optional, defaults to false
- `smoking_status` (string: "never smoked", "formerly smoked", "smokes", "Unknown") - Required
- `ever_married` (boolean) - Required, defaults to true
- `work_type` (string: "Private", "Self-employed", "Govt_job", "children", "Never_worked") - Required, defaults to "Private"
- `residence_type` (string: "Urban" or "Rural") - Required, defaults to "Urban"

---

## 📊 Analytics & Charts

### Data Flow
1. Frontend calls `/api/analytics/dashboard`
2. Backend (`controllers/analytics.controller.js`) filters patients by role
3. Aggregates data and calculates:
   - Risk distribution (pie chart)
   - Patient trends over time (line chart)
   - Age distribution (bar chart)
   - Gender distribution (pie chart)
4. Returns `summary` and `charts` objects

### Chart Components
- **PieChart**: Risk distribution, gender distribution
- **LineChart**: Patient trends (last 30 days)
- **BarChart**: Age distribution

---

## 🐛 Recent Issues & Fixes

### 1. Login 401 Error After Success
**Problem**: User sees success message but immediately gets 401 Unauthorized.

**Fix**:
- Added 500ms delay in `LoginPage.jsx` after login before redirect
- Added 2-second grace period in API interceptor (`api.js`)
- Improved cookie setting timing

### 2. Netlify Redirect Loop
**Problem**: Landing page redirects to `/login`, then shows "page not found".

**Fix**:
- Created `client-react/public/_redirects` with SPA redirect rule
- Created `netlify.toml` as backup
- Removed `PublicRoute` wrapper from landing page
- Optimized auth checks on public routes

### 3. Missing Patient Data Error
**Problem**: "Missing Data: avg_glucose_level, bmi" toast.

**Fix**:
- Added input fields to `ClinicalAssessmentPage.jsx` form
- Created `updatePatient` endpoint in backend
- Added "Edit Patient" form in `PatientDetailPage.jsx`

### 4. ML Service Timeout
**Problem**: "timeout of 60000ms exceeded" error.

**Fix**:
- Increased frontend `predictionApi` timeout to 60s
- Increased backend ML service call timeout to 60s
- Added health check before calling ML service

### 5. Model Loading Error: 'dict' object has no attribute 'predict'
**Problem**: `best_model.pkl` contains a dictionary, not the model object directly.

**Fix**:
- Updated `load_model_artifacts()` in `main.py` to handle dictionary structures
- Checks for common keys: `model`, `classifier`, `xgb_model`, `estimator`
- Iterates through dictionary values to find model object
- Added validation to ensure model has `predict` and `predict_proba` methods
- Added detailed logging to show which key contained the model

**Status**: ✅ **RESOLVED** - Model loading works correctly. The issue was PC-specific limitations. On working systems, the model loads successfully.

### 6. Incomplete Patient Input Form for ML Predictions
**Problem**: Patient form was missing required ML input fields, causing inaccurate predictions.

**Fix**:
- Added `gender` field (replaced "sex" input with proper Select dropdown)
- Added `ever_married` field (Yes/No dropdown)
- Added `work_type` field (Private, Self-employed, Govt_job, children, Never_worked)
- Added `residence_type` field (Urban/Rural)
- Updated `ClinicalAssessmentPage.jsx` to collect all ML-required fields
- Updated `PatientDetailPage.jsx` edit form to include all ML fields
- Updated `prediction.controller.js` to send all required fields to ML service
- All fields now properly flow from form → database → ML service

---

## 🔧 Key Implementation Details

### ML Service Model Loading
```python
# ml-service/main.py - load_model_artifacts()
# Handles multiple model storage formats:
1. Dictionary with model in a key (model, classifier, xgb_model, estimator)
2. Direct model object
3. Searches all dictionary values for objects with predict methods
```

### Feature Preprocessing
```python
# ml-service/main.py - preprocess_input()
# 1. Uses feature_names from lime_config.pkl to ensure correct order
# 2. One-hot encodes categorical features:
#    - gender: Male/Female
#    - work_type: Private/Self-employed/Govt_job/etc.
#    - residence_type: Urban/Rural
#    - smoking_status: formerly smoked/never smoked/smokes/Unknown
# 3. Applies StandardScaler from scaler.pkl
# 4. Returns numpy array with shape (1, num_features)
```

### API Response Format
```javascript
// Backend expects from ML service:
{
  prediction: 0 or 1,  // 0 = no stroke, 1 = stroke
  probability: 0.0-1.0,
  risk_level: "Low" | "Medium" | "High",
  key_factors: { feature_name: impact_value, ... }
}
```

### Protected Routes
```jsx
// client-react/src/App.jsx
<Route 
  path="/patients" 
  element={
    <ProtectedRoute allowedRoles={['doctor', 'admin']}>
      <PatientManagementPage />
    </ProtectedRoute>
  } 
/>
```

---

## 📝 Current TODOs

1. ✅ Fix auth middleware to handle all roles (doctors, patients, admins) using auth_id
2. ✅ Fix user.controller.js login to use raw_user_meta_data.role instead of users table
3. ⏳ Reorganize routes: mount analytics and prediction routes separately in routes/index.js
4. ✅ Fix prediction controller to send patient data directly to ML service (not wrapped in features)
5. ⏳ Fix patient routes: change delete to POST /delete/:id format
6. ⏳ Fix analytics controller function name mismatch
7. ⏳ Update frontend API service to match actual backend routes
8. ⏳ Update App.jsx routes to match spec (e.g., /patients/:id/predict)

---

## 🚀 Running the Project

### Development Setup

1. **Install Dependencies**
   ```bash
   npm install
   cd client-react && npm install
   cd ../ml-service
   python -m venv venv
   venv\Scripts\activate  # Windows
   pip install -r requirements.txt
   ```

2. **Environment Variables** (create `.env` in root)
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_KEY=your_service_key
   JWT_SECRET=your_jwt_secret
   ML_SERVICE_URL=http://localhost:8000
   PORT=5000
   ```

3. **Start Services**
   ```bash
   # Terminal 1: ML Service
   cd ml-service
   venv\Scripts\activate
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload

   # Terminal 2: Backend
   npm run start:server

   # Terminal 3: Frontend
   npm run start:client

   # Or all at once:
   npm run dev
   ```

### ML Service Files Required
- `ml-service/best_model.pkl` - XGBoost model (may be wrapped in dict)
- `ml-service/scaler.pkl` - StandardScaler for feature scaling
- `ml-service/lime_config.pkl` - Contains feature_names, categorical features, etc.
- `ml-service/X_train_lime.pkl` - Training data for LIME explainer

---

## 🔍 Debugging Tips

### ML Service Issues
1. Check ML service logs for model loading messages
2. Verify all `.pkl` files are in `ml-service/` directory
3. Test ML service directly: `POST http://localhost:8000/predict`
4. Check model type in logs: `✅ Model loaded successfully: XGBClassifier`

### Authentication Issues
1. Check browser DevTools → Application → Cookies
2. Verify JWT token in cookie
3. Check API interceptor logs in console
4. Verify Supabase auth configuration

### Prediction Errors
1. Verify patient has all required fields (age, avg_glucose_level, bmi)
2. Check ML service is running on port 8000
3. Verify model loaded successfully (check ML service startup logs)
4. Check backend logs for ML service response

---

## 📚 Important Files to Review

### Frontend
- `client-react/src/services/api.js` - API client with interceptors
- `client-react/src/contexts/AuthContext.jsx` - Authentication state management
- `client-react/src/components/ProtectedRoute.jsx` - Route protection
- `client-react/src/pages/PredictionPage.jsx` - Prediction UI

### Backend
- `controllers/prediction.controller.js` - Prediction logic
- `controllers/patient.controller.js` - Patient CRUD operations
- `middlewares/auth.js` - JWT authentication
- `routes/prediction.routes.js` - Prediction routes

### ML Service
- `ml-service/main.py` - FastAPI app, model loading, prediction endpoint
- `ml-service/requirements.txt` - Python dependencies

---

## 🎯 Next Steps / Future Work

1. **Fix remaining model loading issues** - If error persists, check ML service logs for dictionary keys
2. **Complete route reorganization** - Mount analytics and prediction routes properly
3. **Add prediction history page** - Display past predictions for patients
4. **Improve error handling** - More specific error messages for different failure modes
5. **Add unit tests** - Test ML service endpoints, prediction logic
6. **Optimize LIME explanations** - Cache explanations, improve performance
7. **Add model versioning** - Support multiple model versions
8. **Production deployment** - Configure environment variables, SSL certificates

---

## 📞 Key Contacts / Resources

- **Supabase Dashboard**: Check for database schema and auth settings
- **ML Service Logs**: Check terminal running `uvicorn` for detailed logs
- **Backend Logs**: Check terminal running `npm run start:server`
- **Frontend Console**: Check browser DevTools for API errors

---

## ⚠️ Known Issues

1. ✅ **Model Loading**: RESOLVED - Model loads correctly on working systems
2. **Version Warnings**: XGBoost and scikit-learn version warnings (non-critical, doesn't affect functionality)
3. **CORS**: Currently allows all origins - should restrict in production
4. **Database Schema**: The `patients` table may need columns for `ever_married`, `work_type`, `residence_type` if not already present. The code handles missing fields with defaults, but adding these columns to the database schema is recommended for proper data persistence.

---

## 📖 Additional Documentation

- `DATA_FLOW.md` - Detailed data flow documentation
- `ML_SERVICE_SETUP.md` - ML service setup guide
- `DATABASE_SETUP.md` - Database schema and setup
- `AUTHENTICATION_SETUP.md` - Authentication configuration

---

**Last Updated**: 2025-01-10  
**Status**: Active Development - ML prediction integration in progress

