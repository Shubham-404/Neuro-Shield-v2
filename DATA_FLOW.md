🧠 Stroke Prediction System – Data Flow & Architecture
📘 Overview

This document describes the complete data flow architecture for the Stroke Prediction Web Application.
The system helps doctors assess patient stroke risk based on medical parameters and diagnostic data.

It uses:

Frontend (React / Next.js) — Doctor-facing interface

Backend (Node + Express) — Authentication, database, API gateway

Model Microservice (Python + FastAPI) — Machine learning model & SHAP analysis

Database (PostgreSQL) — Patient, doctor, and prediction data storage

🧩 System Architecture Diagram (Text Representation)
[Doctor's Browser]
      │
      ▼
[Frontend (React/Vue)]
      │  (HTTP API calls)
      ▼
[Node + Express Backend]───►[Database (PostgreSQL)]
      │
      │ (REST call to Python microservice)
      ▼
[Python Model Service (FastAPI)]

⚙️ Components
1. Frontend (React / Next.js)

Provides UI for doctors to:

Log in / log out

Add or edit patient data

Upload patient medical reports

Predict stroke likelihood

View diagnosis history and analytics

Communicates with the Node API using secure HTTPS requests with JWT authentication.

2. Node + Express Backend

Serves as the main application layer.

Responsibilities:

User authentication & JWT management

CRUD operations for patients, predictions, and files

Stores and retrieves data from the PostgreSQL database

Communicates with the Python model microservice for predictions

Aggregates and returns analytics data

3. Python Model Microservice (FastAPI)

Loads the pre-trained stroke prediction model (stroke_model.pkl).

Accepts JSON input from Node → runs inference → returns:

prediction (0 = No stroke, 1 = Stroke)

probability (e.g., 0.84)

risk_level (Low / Moderate / High)

key_factors (Top influencing features via SHAP)

Keeps model loaded in memory for fast predictions.

4. Database (PostgreSQL)

Contains relational tables:

doctors — user authentication

patients — demographic and medical details

predictions — results of stroke risk assessments

files — uploaded reports and scans metadata

🔄 Data Flow by Operation
1. Authentication Flow

Step 1:
Frontend → POST /api/auth/login (Node)

Step 2:
Node checks user credentials in doctors table → returns JWT token.

Step 3:
Frontend stores token and includes it in headers for subsequent requests.

Flow Summary:

Frontend → Node (DB check) → DB → Node → Frontend (JWT)

2. Add New Patient

Step 1:
Doctor fills patient form → POST /api/patients/.

Step 2:
Node validates input and inserts record into patients table.

Step 3:
Returns confirmation and patient ID.

Flow Summary:

Frontend → Node → DB → Node → Frontend

3. Upload Files

Step 1:
Doctor uploads lab reports or scans → POST /api/files/upload.

Step 2:
Node stores file in local/cloud storage (e.g., AWS S3) and metadata in DB.

Step 3:
Returns file record to frontend.

Flow Summary:

Frontend → Node (file storage + DB insert) → Storage + DB → Node → Frontend

4. Stroke Prediction (Main Flow)

Step 1:
Doctor inputs patient parameters → POST /api/predict.

Step 2 (Node):
Node forwards request to the Python microservice:

POST http://ml-service:5000/predict


Step 3 (Python):
Python service:

Parses JSON → DataFrame

Runs model (predict_proba)

Computes SHAP explanations

Returns result JSON:

{
  "prediction": 1,
  "probability": 0.84,
  "risk_level": "Highly likely",
  "key_factors": {
    "age": "Elderly",
    "avg_glucose_level": "High",
    "hypertension": "Present"
  }
}


Step 4 (Node):
Node receives response, logs result in predictions table, and sends it back to the frontend.

Step 5 (Frontend):
Displays:

Stroke likelihood

Probability

Key influencing factors

Option to “Save Diagnosis”

Flow Summary:

Frontend → Node → Python ML Service → Node → DB → Node → Frontend

5. View Patient History

Step 1:
Frontend requests GET /api/patients/{id}.

Step 2:
Node fetches data from patients, predictions, and files tables.

Step 3:
Returns aggregated patient profile and diagnosis history.

Flow Summary:

Frontend → Node → DB → Node → Frontend

6. Analytics Dashboard

Step 1:
Frontend requests GET /api/analytics/summary.

Step 2:
Node aggregates data:

Number of patients

Risk level distribution

Average stroke probability

Step 3:
Returns chart data.

Flow Summary:

Frontend → Node → DB → Node → Frontend

🚀 Key Advantages of This Flow
Benefit	Description
Modular	ML service isolated from main app; each can evolve independently.
Fast Predictions	Python model stays loaded in memory.
Scalable	Both Node and Python can run in containers or scale horizontally.
Secure	Model service accessible only to the Node backend, not directly from the frontend.
Extensible	Easy to add new endpoints (e.g., retraining, feature importance, batch predictions).
🧱 Example API Integration Summary
Component	Example Endpoint	Method	Description
Node → Frontend	/api/predict	POST	Predict stroke likelihood
Node → Frontend	/api/patients	POST/GET	Manage patients
Node → Python	/predict	POST	Call model microservice
Node → DB	—	SQL	Insert/retrieve patient & prediction data
🧩 Example Flow Diagram (Markdown-Style)
1. Doctor inputs data in web app
      │
      ▼
2. Frontend sends request to Node (/api/predict)
      │
      ▼
3. Node forwards JSON to Python microservice (/predict)
      │
      ▼
4. Python model predicts and returns risk level
      │
      ▼
5. Node saves result to DB and sends response back
      │
      ▼
6. Frontend displays probability and key factors

✅ Summary

Frontend: UI for doctors (React/Next.js)

Node Backend: Core API layer (Express)

Python Microservice: Model inference & SHAP explanations

PostgreSQL DB: Persistent data storage

This architecture provides a clean, scalable, and maintainable structure where the ML model and web logic remain decoupled while maintaining smooth real-time communication.