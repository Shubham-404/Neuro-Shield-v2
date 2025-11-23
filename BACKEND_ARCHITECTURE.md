# Backend Architecture & Memory File

## 🧠 Core Concepts

**NeuroShield Backend** is a Node.js/Express application that serves as the API Gateway and Business Logic layer. It delegates authentication and database storage to **Supabase** and machine learning inference to a separate **FastAPI service**.

### 1. Authentication Flow (Supabase + JWT)

The app uses a hybrid approach: Supabase handles the identity, but the backend issues its own JWTs for session management via HTTP-only cookies.

*   **Signup (`POST /signup`)**:
    1.  User submits data to `user.controller.js`.
    2.  Backend calls `supabase.auth.signUp()`.
    3.  Supabase creates user in `auth.users`.
    4.  **Trigger (`handle_new_user`)** automatically creates a profile in `doctors`, `patients`, or `admins` table.
    5.  Backend issues a JWT (`neuroShieldToken`) in an HTTP-only cookie.
    6.  Welcome email is sent.

*   **Login (`POST /login`)**:
    1.  User submits credentials.
    2.  Backend calls `supabase.auth.signInWithPassword()`.
    3.  On success, Backend issues a JWT (`neuroShieldToken`) in an HTTP-only cookie.
    4.  Cookie settings: `httpOnly: true`, `secure: true` (prod), `sameSite: 'lax'` (or 'none' for cross-origin).

*   **Verification (`middlewares/auth.js`)**:
    1.  Reads `neuroShieldToken` from cookies.
    2.  Verifies JWT signature.
    3.  Fetches user profile from `doctors`, `patients`, or `admins` table using the `auth_id`.
    4.  Attaches `req.user` with role-specific IDs (e.g., `req.user.doctor_id`).

### 2. Data Flow

**Request** → **App.js** → **Routes** → **Middleware** → **Controller** → **Supabase/ML Service**

*   **Routes (`routes/index.js`)**: Central hub. Mounts specific routers (`doctor`, `patient`, `predict`, etc.).
*   **Controllers**: Contains business logic.
    *   **`user.controller.js`**: Auth & Dashboard.
    *   **`patient.controller.js`**: Patient CRUD. Enforces RBAC (doctors can only see their patients).
    *   **`prediction.controller.js`**: Orchestrates ML predictions.
*   **Database**: All data persistence happens via `utils/supabaseClient.js`.

### 3. Machine Learning Integration

*   **Controller**: `prediction.controller.js`
*   **Flow**:
    1.  Receives `patient_id`.
    2.  Fetches patient data from Supabase.
    3.  Validates required fields (Age, BMI, Glucose).
    4.  Sends raw data to **ML Service** (`POST /predict`).
    5.  Receives prediction, probability, and LIME factors.
    6.  Saves result to `predictions` table in Supabase.
    7.  Updates patient's `latest_risk_level`.

---

## 📂 Directory Structure (Simplified)

```
backend/
├── app.js                  # Entry point, CORS, Middleware setup
├── routes/                 # API Route Definitions
│   ├── index.js            # Main Router
│   ├── patient.routes.js   # Patient endpoints
│   ├── prediction.routes.js# Prediction endpoints
│   └── ...
├── controllers/            # Business Logic
│   ├── user.controller.js  # Auth & User logic
│   ├── patient.controller.js
│   └── prediction.controller.js
├── middlewares/
│   └── auth.js             # JWT Verification & Profile Fetching
├── utils/
│   ├── supabaseClient.js   # Supabase Admin & Client instances
│   └── sendEmail.js        # Email utility
└── services/
    └── healthRecommendationsService.js # Logic for health tips
```

## 🛑 Redundant/Legacy Files (To Be Removed)

The following files were identified as unused or legacy code from a previous architecture (likely MongoDB-based):

*   `controllers/auth-controllers.js` (Legacy auth)
*   `routes/user-router.js` (Legacy routes)
*   `routes/ai-router.js` (Empty)
*   `routes/test-router.js` (Unused)
*   `controllers/test-controller.js` (Unused)
*   `utils/models/` (MongoDB models - unused)
*   `utils/services/` (Legacy services - unused)
*   `config/connect-to-db.js` (Legacy DB connection)
*   `config/nodemailer.js` (Redundant)

---

## 💡 Key Logic Notes

*   **RBAC**: Access control is handled manually in controllers (e.g., checking `past_doctor_ids` array).
*   **Error Handling**: Centralized error handling in `app.js` (last middleware).
*   **CORS**: Dynamic origin checking in `app.js` to support production & dev environments.
