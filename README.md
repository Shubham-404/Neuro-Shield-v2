

# NeuroShield: Stroke Severity & Outcome Predictor

NeuroShield is an AI-powered web application that predicts the risk of mortality or long-term disability for stroke patients at the time of hospital admission. By analyzing essential clinical and demographic data, NeuroShield helps doctors triage patients more effectively and prioritize interventions, especially when ICU resources are limited.

## View live at: [Neuro-Shield](https://neuro-shield.netlify.app)

## Project Objectives

- Provide real-time risk estimates for stroke outcomes (mortality and disability) using machine learning.
- Support clinical decision-making and hospital resource allocation by delivering actionable risk categories (High/Medium/Low).
- Present clear explanations for predictions with visual feature importance, enabling transparency in AI-driven healthcare.

## How It Works

Doctors or hospital staff log in and enter patient admission details (e.g., age, blood pressure, glucose, comorbidities) into a dashboard. The backend sends this data to an integrated AI model, which computes mortality/disability risk and explains key factors driving each prediction. Visual dashboards show patient risk and hospital-wide analytics, helping staff make timely, evidence-based decisions.

## Getting Started

1. Clone the repository.
2. Install dependencies in the root project folder:
   ```
   npm install
   ```
3. Install frontend dependencies inside the `/client-react` folder:
   ```
   cd client-react
   npm install
   ```
4. Start the development server:
   ```
   npm run dev
   ```

You are now ready to develop, test, and extend NeuroShield.
