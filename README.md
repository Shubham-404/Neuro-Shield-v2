Here’s your **fully polished, GitHub-ready `README.md`** — clean layout, minimal emojis, professional tone, with badges, collapsible API sections, and all code blocks copy-friendly ✅

---

````markdown
# 🧠 NeuroShield: Stroke Severity & Outcome Predictor

[![Frontend](https://img.shields.io/badge/Frontend-React-blue)](https://reactjs.org/)
[![Backend](https://img.shields.io/badge/Backend-Express.js-green)](https://expressjs.com/)
[![ML Service](https://img.shields.io/badge/ML%20API-FastAPI-009688)](https://fastapi.tiangolo.com/)
[![Model](https://img.shields.io/badge/Model-Balanced%20Random%20Forest-orange)]()
[![License](https://img.shields.io/badge/License-MIT-lightgrey.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Active-success)]()

---

**NeuroShield** is an AI-powered web application that predicts the **risk of mortality or long-term disability** for stroke patients upon hospital admission.  
It assists clinicians in **triaging patients**, **allocating ICU resources**, and understanding **key risk factors** using explainable AI.

🔗 **Live Demo:** [Neuro-Shield](https://neuro-shield.netlify.app)

---

## 🎯 Project Objectives

- Provide **real-time stroke outcome predictions** (mortality/disability).  
- Deliver **interpretable risk categories** (Low / Moderate / High).  
- Assist in **resource allocation** and **clinical decision-making**.  
- Ensure **transparency** through explainable AI (LIME).

---

## ⚙️ How It Works

1. Doctors log in via a secure dashboard.  
2. Enter patient details (age, glucose, BP, comorbidities, etc.).  
3. Data is sent to an **AI model (Balanced Random Forest)**.  
4. The model returns a **risk prediction** and **key influencing features**.  
5. Results are displayed with **visual dashboards** and **risk analytics**.

---

## 🧩 Features

- 🔐 Secure JWT-based authentication  
- 🩺 Patient management (CRUD)  
- 🧠 Real-time ML predictions with LIME explanations  
- 📊 Doctor dashboard with hospital-wide analytics  
- 💊 Medication tracking & update suggestions  
- 🧾 Doctor profile management  
- 🌐 Responsive UI with React + Tailwind  
- ⚡ CORS-enabled REST API + FastAPI ML microservice

---

## 🧮 Model Overview

| Component | Description |
|------------|-------------|
| **Algorithm** | Balanced Random Forest Classifier |
| **Purpose** | Predict stroke severity / mortality |
| **Explainability** | LIME (Local Interpretable Model-Agnostic Explanations) |
| **Output** | Probability, Risk Category, Key Feature Impacts |
| **Core Libraries** | scikit-learn • LIME • NumPy • Pandas |

---

## 🛠️ Getting Started

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/neuroshield.git
cd neuroshield
````

### 2. Install Dependencies

```bash
npm install
```

### 3. Frontend Setup

```bash
cd client-react
npm install
npm run dev
```

### 4. Backend Setup

```bash
cd ../server
pip install -r requirements.txt
uvicorn main:app --reload
```

---

## ⚡ API Documentation

**Development Base URL:** `http://localhost:5000/api`
**Production Base URL:** `https://your-production-url.com/api`

All protected endpoints require an HTTP-only cookie:
**Cookie Name:** `neuroShieldToken`

---

<details>
<summary>🟢 <b>Public Endpoints</b></summary>

| Method | Endpoint         | Description                         |
| ------ | ---------------- | ----------------------------------- |
| `POST` | `/api/signup`    | Create a new user account           |
| `POST` | `/api/login`     | Login and set authentication cookie |
| `GET`  | `/api/logout`    | Logout and clear session cookie     |
| `GET`  | `/api/dashboard` | Get user dashboard data             |
| `GET`  | `/api/healthz`   | Health check endpoint               |

</details>

---

<details>
<summary>🩺 <b>Patient Endpoints</b></summary>

| Method | Endpoint                         | Description                       |
| ------ | -------------------------------- | --------------------------------- |
| `POST` | `/api/patient/create`            | Create new patient record         |
| `GET`  | `/api/patient/list`              | Retrieve all patients             |
| `GET`  | `/api/patient/:id`               | Get details of a specific patient |
| `POST` | `/api/patient/update/:id`        | Update patient information        |
| `POST` | `/api/patient/delete/:id`        | Delete patient record             |
| `POST` | `/api/patient/suggest-update`    | Suggest treatment/medication      |
| `POST` | `/api/patient/update-medication` | Update current medication         |

</details>

---

<details>
<summary>🧠 <b>Prediction Endpoints</b></summary>

| Method | Endpoint                           | Description                    |
| ------ | ---------------------------------- | ------------------------------ |
| `POST` | `/api/predict`                     | Run stroke risk prediction     |
| `GET`  | `/api/predict/patient/:patient_id` | Get patient prediction history |

</details>

---

<details>
<summary>👨‍⚕️ <b>Doctor Endpoints</b></summary>

| Method | Endpoint              | Description               |
| ------ | --------------------- | ------------------------- |
| `GET`  | `/api/doctor/profile` | Retrieve doctor profile   |
| `POST` | `/api/doctor/update`  | Update doctor information |

</details>

---

<details>
<summary>📊 <b>Analytics Endpoints</b></summary>

| Method | Endpoint                   | Description                            |
| ------ | -------------------------- | -------------------------------------- |
| `GET`  | `/api/analytics/dashboard` | Get hospital-level dashboard analytics |

</details>

---

<details>
<summary>🤖 <b>ML Service Endpoints</b></summary>

| Method | Endpoint   | Description                            |
| ------ | ---------- | -------------------------------------- |
| `GET`  | `/health`  | Check ML service health status         |
| `POST` | `/predict` | Directly run prediction (testing only) |

</details>

---

## 🧱 Tech Stack

| Layer               | Technology                                    |
| ------------------- | --------------------------------------------- |
| **Frontend**        | React • Tailwind CSS • Vite                   |
| **Backend (API)**   | Node.js • Express.js                          |
| **ML Microservice** | FastAPI • Python                              |
| **Database**        | MongoDB                                       |
| **Authentication**  | JWT (HTTP-only cookies)                       |
| **Explainability**  | LIME                                          |
| **Deployment**      | Netlify (Frontend) • Render/Railway (Backend) |

---

## 📊 Risk Classification

| Probability Range | Risk Level | Indicator |
| ----------------- | ---------- | --------- |
| 0.00 – 0.33       | Low        | 🟢        |
| 0.34 – 0.66       | Moderate   | 🟡        |
| 0.67 – 1.00       | High       | 🔴        |

---

## 🔮 Future Enhancements

* Integration with hospital EHR systems
* Real-time alerts for high-risk patients
* Continuous model retraining
* Imaging support (CT/MRI stroke scan analysis)

---

## 📄 License

This project is licensed under the **MIT License**.
© 2025 NeuroShield — All Rights Reserved.

---
