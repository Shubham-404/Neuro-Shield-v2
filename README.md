# NeuroShield FastAPI Backend

## Setup

1. Create and activate a virtual environment
```bash
python -m venv .venv
. .venv/Scripts/activate
```

2. Install dependencies
```bash
pip install -r requirements.txt
```

3. Create a `.env` file at the project root (D:\Neuro-Shield) with variables like:
```bash
APP_NAME=NeuroShield API
APP_ENV=development
APP_DEBUG=true
APP_HOST=0.0.0.0
APP_PORT=8000

JWT_SECRET=change_this_secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
COOKIE_SECURE=false
COOKIE_DOMAIN=localhost

DATABASE_URL=sqlite:///./data.db

MAIL_USERNAME=your_email@example.com
MAIL_PASSWORD=your_app_password
MAIL_FROM=your_email@example.com
MAIL_FROM_NAME=NeuroShield
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_TLS=true
MAIL_SSL=false

ML_MODEL_PATH=app/ml/stroke_model.pkl
ML_SCALER_PATH=app/ml/scaler.pkl
```

> If `.env.example` is missing, copy the values above into your `.env` file.

## Database Migrations (Alembic)

Initialize the database and create tables (first run uses SQLAlchemy create_all). For migrations:

1. Generate a migration after model changes
```bash
alembic revision --autogenerate -m "init tables"
```

2. Apply migrations
```bash
alembic upgrade head
```

## Running the server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Health check:
```bash
curl http://localhost:8000/health
```

## Endpoints Summary

- /auth
  - POST /register
  - POST /login
  - POST /verify-email
  - POST /send-verify-otp
  - GET /profile

- /patients
  - POST /
  - GET /
  - GET /{id}
  - PUT /{id}
  - DELETE /{id}

- /predict
  - POST /

- /files
  - POST /upload
  - GET /{patient_id}
  - DELETE /{file_id}

- /analytics
  - GET /summary
  - GET /factors

## Notes

- JWT is set as an `access_token` HttpOnly cookie on login/register. You can also pass `Authorization: Bearer <token>`.
- Email verification uses a placeholder OTP. Wire your real OTP generator and verification storage.
- Place your trained model at `app/ml/stroke_model.pkl` and optional scaler at `app/ml/scaler.pkl`.
