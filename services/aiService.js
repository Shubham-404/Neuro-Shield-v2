const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Generate general lifestyle advice for a patient based on their metrics and basic info.
 * This is for the patient to see directly (lower risk, general guidance).
 */
async function generateGeneralAdvice(patientData, metrics) {
  try {
    const prompt = `
      You are a helpful medical assistant AI. Provide general lifestyle advice for a patient with the following profile.
      
      Patient Profile:
      - Age: ${patientData.age}
      - Gender: ${patientData.gender}
      - BMI: ${patientData.bmi}
      - Smoking Status: ${patientData.smoking_status}
      - Known Conditions: ${patientData.hypertension ? 'Hypertension' : ''} ${patientData.heart_disease ? 'Heart Disease' : ''}
      
      Recent Metrics:
      ${metrics.map(m => `- ${m.metric_type}: ${m.value} (${new Date(m.recorded_at).toLocaleDateString()})`).join('\n')}
      
      Please provide a JSON response with the following structure:
      {
        "lifestyle_changes": ["tip 1", "tip 2"],
        "dietary_suggestions": ["tip 1", "tip 2"],
        "risk_summary": "A brief, non-alarmist summary of their general health status based on the data.",
        "suggested_tests": ["test 1", "test 2"]
      }
      
      IMPORTANT: 
      1. This is general advice, NOT a medical diagnosis. 
      2. Be encouraging but realistic.
      3. Return ONLY valid JSON. Do not include markdown formatting like \`\`\`json.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up markdown if present
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error generating general advice:", error);
    throw new Error("Failed to generate advice.");
  }
}

/**
 * Generate targeted recommendations for a doctor to review.
 * This can be more specific as a doctor will vet it.
 */
async function generateDoctorRecommendations(patientData, metrics, prediction) {
  try {
    const prompt = `
      You are a clinical decision support AI assisting a doctor. Analyze this patient's data and suggest clinical recommendations.
      
      Patient Profile:
      - Age: ${patientData.age}
      - Gender: ${patientData.gender}
      - BMI: ${patientData.bmi}
      - Medical History: ${patientData.medical_history || 'None'}
      
      Stroke Risk Model Output:
      - Risk Level: ${prediction?.risk_level || 'Unknown'}
      - Probability: ${prediction?.probability || 'Unknown'}
      - Key Factors: ${JSON.stringify(prediction?.key_factors || {})}
      
      Recent Metrics:
      ${metrics.map(m => `- ${m.metric_type}: ${m.value} (${new Date(m.recorded_at).toLocaleDateString()})`).join('\n')}
      
      Please provide a JSON response with the following structure:
      {
        "recommendations": [
          {
            "title": "Short title",
            "description": "Detailed clinical recommendation",
            "type": "medication" | "lifestyle" | "test" | "referral",
            "priority": "high" | "medium" | "low",
            "category": "prevention" | "treatment" | "monitoring"
          }
        ],
        "clinical_analysis": "A professional summary of the patient's status for the doctor.",
        "suggested_specialists": ["Cardiologist", "Neurologist", etc.]
      }
      
      IMPORTANT:
      1. These recommendations will be reviewed by a doctor.
      2. Focus on stroke risk reduction and management of comorbidities.
      3. Return ONLY valid JSON.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up markdown if present
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error generating doctor recommendations:", error);
    throw new Error("Failed to generate recommendations.");
  }
}

module.exports = {
  generateGeneralAdvice,
  generateDoctorRecommendations
};
