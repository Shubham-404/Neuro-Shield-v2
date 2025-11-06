# NeuroShield Frontend Integration Guide

This document explains how to connect the NeuroShield React frontend to a backend implemented in either Node.js/Express or Python/FastAPI. It also covers environment configuration, auth, CORS, and API contract suggestions.

## Overview
- Frontend stack: Vite + React + Tailwind v4.1, React Router v6, react-hook-form, recharts, shadcn-like components.
- API client: Axios instance at `src/services/api.js` (baseURL configurable).
- Pages: Login, Register, Dashboards (doctor/staff/admin), Patient Management, Patient Detail, Clinical Assessment (Add Patient), Prediction/Explainability, Analytics, Alerts, Profile.

## Configure environment
Create a `.env` file in the project root to point to your backend:

VITE_API_BASE_URL=http://localhost:8000/api

Update axios baseURL to use this value. In `src/services/api.js`:

```js path=null start=null
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
})
```

Restart the dev server after changing env vars.

## CORS
Enable CORS on the backend to accept the frontend origin (e.g., http://localhost:5173).

### Express (Node.js)
```js path=null start=null
import express from 'express'
import cors from 'cors'
const app = express()
app.use(cors({ origin: ['http://localhost:5173'], credentials: true }))
app.use(express.json())
```

### FastAPI (Python)
```python path=null start=null
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Auth
- Minimal endpoints:
  - POST /auth/register { org, role, name, email, password }
  - POST /auth/login { email, password } → returns { accessToken, user { id, role } }
  - GET /me → returns current user profile
- Store tokens securely in httpOnly cookies when possible; for demo, a bearer token in memory/localStorage is fine. The axios instance can attach headers via interceptors.

```js path=null start=null
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
```

## Patients API (suggested)
- GET /patients?search=&page=&risk=
- POST /patients { name, age, sex, comorbidities }
- GET /patients/:id
- GET /patients/:id/history
- POST /patients/:id/assessments { ...nihss fields, notes }
- POST /patients/:id/predict { assessmentId? } → { score, label, shap: [{feature, impact}] }

Frontend areas to wire:
- PatientManagementPage → list/search/filter, export actions
- ClinicalAssessmentPage → POST /patients and /assessments
- PatientDetailPage → GET details + tabs
- PredictionPage → POST predict, render risk + SHAP

## Analytics & Alerts
- GET /analytics/metrics → { auc, sensitivity, specificity, calibration }
- GET /alerts → list with { id, level, title, meta }

## Roles and dashboards
- user.role ∈ { 'doctor', 'staff', 'admin' }
- Route users to:
  - /dashboard (doctor)
  - /staff (staff)
  - /admin (admin) → admin analytics panel

## File uploads/documents (optional)
- POST /patients/:id/documents (multipart/form-data)
- GET /patients/:id/documents

## Export (CSV/PDF)
- CSV can be generated client-side; PDF usually server-side using a headless renderer.
- Endpoints:
  - GET /export/patients.csv
  - POST /export/report.pdf { patientId }

## Error handling & toasts
- The app uses a simple toast provider (src/components/ui/toast.jsx). Replace alerts with toasts and propagate backend error messages when available.

## Development commands
- Install deps: npm install
- Start dev: npm run dev
- Build: npm run build

## Testing integration checklist
- Set VITE_API_BASE_URL
- Verify CORS
- Create a test user via /auth/register
- Login via /auth/login and navigate to /dashboard
- Create a patient and assessment, run prediction, and view SHAP
- Check analytics and alerts pages
