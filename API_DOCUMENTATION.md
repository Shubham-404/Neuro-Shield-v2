# NeuroShield API Documentation

**Base URL**: `http://localhost:5000/api` (Development)  
**Base URL**: `https://your-production-url.com/api` (Production)

## Authentication

All protected endpoints require authentication via JWT token stored in an HTTP-only cookie named `neuroShieldToken`. The token is automatically set after login and sent with each request.

### Cookie Configuration
- **Name**: `neuroShieldToken`
- **HttpOnly**: `true`
- **Secure**: `true` (production only)
- **SameSite**: `strict`
- **MaxAge**: 24 hours

---

## Public Endpoints

### 1. Sign Up
Create a new user account.

**Endpoint**: `POST /api/signup`

**Request Body** (form-urlencoded):
```json
{
  "name": "Dr. John Smith",
  "email": "john@hospital.org",
  "password": "securepassword123",
  "role": "doctor",  // "patient" | "doctor" | "admin"
  // For doctors:
  "specialization": "Neurology",
  "license_number": "MD12345",
  "hospital": "City Hospital",
  // For patients:
  "medical_history": "Hypertension, Diabetes",
  "blood_group": "O+"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Account created. Check your email to verify."
}
```

**Error Responses**:
- `400`: Missing required fields or invalid role
- `500`: Server error

---

### 2. Login
Authenticate and receive JWT token.

**Endpoint**: `POST /api/login`

**Request Body** (JSON):
```json
{
  "email": "john@hospital.org",
  "password": "securepassword123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "john@hospital.org",
    "name": "Dr. John Smith",
    "role": "doctor"
  }
}
```

**Error Responses**:
- `400`: Email and password required
- `401`: Invalid credentials

---

### 3. Logout
Logout and clear authentication cookie.

**Endpoint**: `GET /api/logout`

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 4. Dashboard
Get user dashboard information.

**Endpoint**: `GET /api/dashboard`

**Headers**: Requires authentication cookie

**Response** (200 OK):
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "john@hospital.org",
    "name": "Dr. John Smith",
    "role": "doctor"
  }
}
```

---

### 5. Health Check
Check API health status.

**Endpoint**: `GET /api/healthz`

**Response** (200 OK):
```json
{
  "success": true,
  "status": "ok"
}
```

---

## Patient Endpoints

All patient endpoints require authentication and doctor/admin role (except patients viewing their own data).

### 1. Create Patient
Create a new patient record.

**Endpoint**: `POST /api/patient/create`

**Headers**: Requires authentication cookie

**Request Body** (JSON):
```json
{
  "name": "Jane Doe",
  "age": 54,
  "gender": "Female",  // "Male" | "Female"
  "email": "jane@example.com",  // Optional
  "medical_history": "HTN, DM2",  // Optional
  "blood_group": "A+",  // Optional
  "hypertension": true,  // Optional, default: false
  "heart_disease": false,  // Optional, default: false
  "avg_glucose_level": 95.0,  // Required for predictions
  "bmi": 28.5,  // Required for predictions
  "smoking_status": "formerly smoked",  // "never smoked" | "formerly smoked" | "smokes" | "Unknown"
  "ever_married": true,  // Optional, default: true
  "work_type": "Private",  // "Private" | "Self-employed" | "Govt_job" | "children" | "Never_worked"
  "residence_type": "Urban",  // "Urban" | "Rural"
  "medications": "Aspirin, Metformin",  // Optional
  "nihss_total": 5,  // Optional
  "notes": "Clinical notes here"  // Optional
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "patient": {
    "id": "uuid",
    "name": "Jane Doe",
    "age": 54,
    "gender": "Female",
    "created_by": "doctor-uuid",
    "created_at": "2025-01-10T10:00:00Z",
    ...
  }
}
```

**Error Responses**:
- `403`: Only doctors can create patients
- `400`: Invalid data or missing required fields
- `500`: Server error

---

### 2. List Patients
Get list of patients accessible to the current user.

**Endpoint**: `GET /api/patient/list`

**Headers**: Requires authentication cookie

**Response** (200 OK):
```json
{
  "success": true,
  "patients": [
    {
      "id": "uuid",
      "name": "Jane Doe",
      "age": 54,
      "gender": "Female",
      "latest_risk_level": "Moderate",
      "created_at": "2025-01-10T10:00:00Z",
      ...
    }
  ]
}
```

---

### 3. Get Patient Details
Get detailed information about a specific patient.

**Endpoint**: `GET /api/patient/:id`

**Headers**: Requires authentication cookie

**Parameters**:
- `id` (path): Patient UUID

**Response** (200 OK):
```json
{
  "success": true,
  "patient": {
    "id": "uuid",
    "name": "Jane Doe",
    "age": 54,
    "gender": "Female",
    "email": "jane@example.com",
    "medical_history": "HTN, DM2",
    "hypertension": true,
    "heart_disease": false,
    "avg_glucose_level": 95.0,
    "bmi": 28.5,
    "smoking_status": "formerly smoked",
    "ever_married": true,
    "work_type": "Private",
    "residence_type": "Urban",
    "latest_risk_level": "Moderate",
    "created_at": "2025-01-10T10:00:00Z",
    ...
  }
}
```

**Error Responses**:
- `404`: Patient not found
- `403`: Access denied

---

### 4. Update Patient
Update patient information.

**Endpoint**: `POST /api/patient/update/:id`

**Headers**: Requires authentication cookie

**Parameters**:
- `id` (path): Patient UUID

**Request Body** (JSON):
```json
{
  "name": "Jane Doe Updated",
  "age": 55,
  "gender": "Female",
  "avg_glucose_level": 98.0,
  "bmi": 29.0,
  "smoking_status": "never smoked",
  "ever_married": true,
  "work_type": "Private",
  "residence_type": "Urban",
  ...
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "patient": {
    "id": "uuid",
    "name": "Jane Doe Updated",
    ...
  }
}
```

**Error Responses**:
- `404`: Patient not found
- `403`: Access denied
- `400`: Invalid data

---

### 5. Delete Patient
Delete a patient record.

**Endpoint**: `POST /api/patient/delete/:id`

**Headers**: Requires authentication cookie

**Parameters**:
- `id` (path): Patient UUID

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Patient deleted."
}
```

**Error Responses**:
- `404`: Patient not found
- `403`: Only creator can delete

---

### 6. Suggest Medication Update
Suggest a medication update for a patient.

**Endpoint**: `POST /api/patient/suggest-update`

**Headers**: Requires authentication cookie

**Request Body** (JSON):
```json
{
  "patient_id": "uuid",
  "suggestion": "Consider adding Aspirin 81mg daily for stroke prevention"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "suggestion": {
    "id": "uuid",
    "patient_id": "uuid",
    "suggested_by": "doctor-uuid",
    "suggestion": "Consider adding Aspirin 81mg daily...",
    "status": "pending",
    "created_at": "2025-01-10T10:00:00Z"
  }
}
```

---

### 7. Update Medication
Update patient medications.

**Endpoint**: `POST /api/patient/update-medication`

**Headers**: Requires authentication cookie

**Request Body** (JSON):
```json
{
  "patient_id": "uuid",
  "medications": "Aspirin 81mg, Metformin 500mg BID"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "patient": {
    "id": "uuid",
    "medications": "Aspirin 81mg, Metformin 500mg BID",
    ...
  }
}
```

---

## Prediction Endpoints

All prediction endpoints require authentication.

### 1. Run Prediction
Run stroke risk prediction for a patient.

**Endpoint**: `POST /api/predict`

**Headers**: Requires authentication cookie

**Request Body** (JSON):
```json
{
  "patient_id": "uuid"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "prediction": {
    "id": "uuid",
    "patient_id": "uuid",
    "doctor_id": "uuid",
    "prediction": 1,  // 0 = no stroke, 1 = stroke
    "probability": 0.7523,  // 0.0 to 1.0
    "risk_level": "High",  // "Low" | "Moderate" | "High"
    "key_factors": {
      "age": 0.25,
      "avg_glucose_level": 0.20,
      "bmi": 0.15,
      ...
    },
    "created_at": "2025-01-10T10:00:00Z"
  }
}
```

**Error Responses**:
- `400`: Missing patient_id or required patient data (age, avg_glucose_level, bmi)
- `404`: Patient not found
- `403`: Access denied
- `503`: ML service unavailable
- `500`: Prediction failed

**Required Patient Fields for Prediction**:
- `age` (number)
- `avg_glucose_level` (number)
- `bmi` (number)
- `gender` (string) - defaults to "Male"
- `ever_married` (boolean) - defaults to true
- `work_type` (string) - defaults to "Private"
- `residence_type` (string) - defaults to "Urban"
- `smoking_status` (string) - defaults to "Unknown"

---

### 2. Get Prediction History
Get prediction history for a patient.

**Endpoint**: `GET /api/predict/patient/:patient_id`

**Headers**: Requires authentication cookie

**Parameters**:
- `patient_id` (path): Patient UUID

**Response** (200 OK):
```json
{
  "success": true,
  "predictions": [
    {
      "id": "uuid",
      "patient_id": "uuid",
      "doctor_id": "uuid",
      "prediction": 1,
      "probability": 0.7523,
      "risk_level": "High",
      "key_factors": {...},
      "created_at": "2025-01-10T10:00:00Z"
    },
    ...
  ]
}
```

---

## Doctor Endpoints

All doctor endpoints require authentication and doctor role.

### 1. Get Doctor Profile
Get current doctor's profile information.

**Endpoint**: `GET /api/doctor/profile`

**Headers**: Requires authentication cookie

**Response** (200 OK):
```json
{
  "success": true,
  "doctor": {
    "id": "uuid",
    "auth_id": "uuid",
    "full_name": "Dr. John Smith",
    "email": "john@hospital.org",
    "specialization": "Neurology",
    "license_number": "MD12345",
    "hospital": "City Hospital",
    "created_at": "2025-01-10T10:00:00Z"
  }
}
```

---

### 2. Update Doctor Profile
Update doctor profile information.

**Endpoint**: `POST /api/doctor/update`

**Headers**: Requires authentication cookie

**Request Body** (JSON):
```json
{
  "full_name": "Dr. John Smith Updated",
  "specialization": "Cardiology",
  "license_number": "MD12345",
  "hospital": "New Hospital"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "doctor": {
    "id": "uuid",
    "full_name": "Dr. John Smith Updated",
    "specialization": "Cardiology",
    ...
  }
}
```

---

## Analytics Endpoints

All analytics endpoints require authentication.

### 1. Get Dashboard Analytics
Get analytics dashboard data (role-based).

**Endpoint**: `GET /api/analytics/dashboard`

**Headers**: Requires authentication cookie

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
    "patientTrends": [
      {
        "date": "2025-01-10",
        "high": 2,
        "moderate": 5,
        "low": 8,
        "total": 15
      },
      ...
    ],
    "ageDistribution": [
      { "name": "0-30", "value": 20 },
      { "name": "31-50", "value": 45 },
      { "name": "51-70", "value": 60 },
      { "name": "71+", "value": 25 }
    ],
    "genderDistribution": [
      { "name": "Male", "value": 80 },
      { "name": "Female", "value": 70 }
    ]
  }
}
```

**Role-Based Access**:
- **Patient**: Sees only their own data
- **Doctor/Admin**: Sees all patients they created or are assigned to

---

## ML Service Endpoints

The ML service runs separately on port 8000 (default).

### 1. Health Check
Check ML service health.

**Endpoint**: `GET http://localhost:8000/health`

**Response** (200 OK):
```json
{
  "status": "healthy",
  "model_loaded": true,
  "scaler_loaded": true,
  "explainer_loaded": true
}
```

---

### 2. Predict (Direct)
Run prediction directly on ML service (for testing).

**Endpoint**: `POST http://localhost:8000/predict`

**Request Body** (JSON):
```json
{
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
}
```

**Response** (200 OK):
```json
{
  "prediction": 1,
  "probability": 0.7523,
  "risk_level": "High",
  "key_factors": {
    "age": 0.25,
    "avg_glucose_level": 0.20,
    ...
  },
  "prediction_label": "Stroke",
  "risk_color": "red",
  "top_features": [
    {
      "name": "age",
      "rule": "age > 65.0",
      "impact": 0.25,
      "direction": "increases"
    },
    ...
  ],
  "explanation_available": true
}
```

---

## Error Responses

All endpoints follow a consistent error response format:

```json
{
  "success": false,
  "message": "Error description here"
}
```

### Common HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required or invalid
- `403 Forbidden`: Access denied (insufficient permissions)
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error
- `503 Service Unavailable`: ML service unavailable

---

## Rate Limiting

Currently, there are no rate limits implemented. Consider implementing rate limiting in production.

---

## CORS Configuration

The API allows requests from:
- `http://localhost:5173` (Development)
- `http://localhost:5174` (Development)
- `https://neuro-shield.netlify.app` (Production)
- Custom frontend origin (via `FRONTEND_ORIGIN` env variable)

---

## Notes

1. **Authentication**: All protected endpoints require the `neuroShieldToken` cookie to be present and valid.

2. **Role-Based Access**: 
   - Patients can only access their own data
   - Doctors can access patients they created or are assigned to
   - Admins have full access

3. **Patient Creation**: Only doctors can create patients. The `created_by` field is automatically set to the current doctor's ID.

4. **ML Predictions**: Require patient to have `age`, `avg_glucose_level`, and `bmi` fields populated. Other fields have defaults but should be provided for accurate predictions.

5. **Data Types**:
   - UUIDs are used for all IDs
   - Dates are in ISO 8601 format
   - Booleans are true/false
   - Numbers are floats/integers as appropriate

---

## Example Requests

### Using cURL

**Login**:
```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"doctor@hospital.org","password":"password123"}' \
  -c cookies.txt
```

**Create Patient** (with cookie):
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
    "smoking_status": "formerly smoked"
  }'
```

**Run Prediction**:
```bash
curl -X POST http://localhost:5000/api/predict \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"patient_id":"patient-uuid-here"}'
```

---

**Last Updated**: 2025-01-10  
**API Version**: 1.0.0

