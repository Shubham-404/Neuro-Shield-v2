// controllers/patient.controller.js
const { supabase, supabaseAdmin } = require('../utils/supabaseClient');

// ... (keep existing code until AI section)

// AI Recommendations
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.generateAIRecommendations = async (req, res) => {
  try {
    console.log('[AI] Starting recommendation generation for user:', req.user.id);

    if (req.user.role !== 'patient') {
      return res.status(403).json({ success: false, message: 'Only patients can generate recommendations.' });
    }

    const patientId = req.user.patient_id || req.user.id;
    console.log('[AI] Patient ID:', patientId);

    // 1. Fetch Patient Data (Use Admin to ensure access)
    const { data: patient, error: pError } = await supabaseAdmin
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .single();

    if (pError || !patient) {
      console.error('[AI] Patient profile not found:', pError);
      throw new Error('Patient profile not found');
    }

    // 2. Fetch Latest Prediction (optional context)
    const { data: predictions } = await supabaseAdmin
      .from('predictions')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })
      .limit(1);

    const latestPrediction = predictions && predictions.length > 0 ? predictions[0] : null;

    // 3. Construct Prompt
    const prompt = `
      Analyze the following patient health data and provide personalized recommendations.
      
      Patient Profile:
      - Age: ${patient.age}
      - Gender: ${patient.gender}
      - BMI: ${patient.bmi}
      - Glucose: ${patient.avg_glucose_level}
      - Hypertension: ${patient.hypertension ? 'Yes' : 'No'}
      - Heart Disease: ${patient.heart_disease ? 'Yes' : 'No'}
      - Smoking: ${patient.smoking_status}
      - Medical History: ${patient.medical_history || 'None'}
      ${latestPrediction ? `- Stroke Risk Level: ${latestPrediction.risk_level} (${(latestPrediction.probability * 100).toFixed(1)}%)` : ''}

      Provide the response in strictly valid JSON format with the following structure:
      {
        "diet": ["tip 1", "tip 2", ...],
        "exercise": ["tip 1", "tip 2", ...],
        "precautions": ["tip 1", "tip 2", ...],
        "doctor_consultation": "advice on when/why to see a doctor"
      }
      Do not include markdown formatting (like \`\`\`json), just the raw JSON string.
    `;

    // 4. Call Gemini API
    console.log('[AI] Calling Gemini API...');
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    console.log('[AI] Gemini response received');

    // Cleanup JSON string if needed
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    let recommendations;
    try {
      recommendations = JSON.parse(text);
    } catch (parseError) {
      console.error('[AI] JSON Parse Error:', parseError);
      console.error('[AI] Raw Text:', text);
      throw new Error('Failed to parse AI response');
    }

    // 5. Save to DB (Use Admin to bypass RLS)
    console.log('[AI] Saving to database...');
    const { data: savedRec, error: saveError } = await supabaseAdmin
      .from('patient_recommendations')
      .insert({
        patient_id: patientId,
        recommendations: recommendations
      })
      .select()
      .single();

    if (saveError) {
      console.error('[AI] Database Save Error:', saveError);
      throw saveError;
    }

    console.log('[AI] Success!');
    res.json({ success: true, recommendations: savedRec.recommendations });

  } catch (err) {
    console.error('[AI] Generation Error:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to generate recommendations.' });
  }
};

exports.getAIRecommendations = async (req, res) => {
  try {
    console.log('[AI] Fetching recommendations for user:', req.user.id);

    if (req.user.role !== 'patient') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const patientId = req.user.patient_id || req.user.id;
    console.log('[AI] Patient ID:', patientId);

    // Use Admin to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('patient_recommendations')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('[AI] No recommendations found for this patient.');
        return res.json({ success: true, recommendations: null });
      }
      console.error('[AI] Fetch Error:', error);
      throw error;
    }

    console.log('[AI] Recommendations found:', data ? 'Yes' : 'No');
    res.json({ success: true, recommendations: data ? data.recommendations : null });
  } catch (err) {
    console.error('[AI] Get Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
// Deprecated for doctors. Only used for system/admin or initial signup trigger.
// Patients now create their own accounts via Auth.
exports.createPatient = async (req, res) => {
  return res.status(403).json({
    success: false,
    message: 'Patient creation is now handled via self-registration.'
  });
};

exports.listPatients = async (req, res) => {
  try {
    // Doctors see patients linked in patient_doctors table
    const { data, error } = await supabase
      .from('patient_doctors')
      .select(`
        patient:patients (*)
      `)
      .eq('doctor_id', req.user.id);

    if (error) throw error;

    // Flatten structure
    const patients = data.map(item => item.patient);
    res.json({ success: true, patients });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPatient = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Get patient data
    const { data: patient, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !patient) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    // 2. Check Access
    let hasAccess = false;

    if (req.user.role === 'patient') {
      // Patients can only see themselves
      // Assuming req.user.patient_id is set by middleware
      if (req.user.patient_id && req.user.patient_id === id) hasAccess = true;
    } else if (req.user.role === 'doctor') {
      // Check patient_doctors table
      const { data: relation } = await supabase
        .from('patient_doctors')
        .select('id')
        .eq('patient_id', id)
        .eq('doctor_id', req.user.id)
        .single();

      if (relation) hasAccess = true;
    } else if (req.user.role === 'admin') {
      hasAccess = true;
    }

    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'Access denied to this patient.' });
    }

    res.json({ success: true, patient });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) return res.status(400).json({ success: false, message: 'Patient ID required.' });

    // Verify Access (Same logic as getPatient)
    let hasAccess = false;
    if (req.user.role === 'patient') {
      // Assuming req.user.patient_id is set by middleware
      if (req.user.patient_id && req.user.patient_id === id) hasAccess = true;
    } else if (req.user.role === 'doctor') {
      const { data: relation } = await supabase
        .from('patient_doctors')
        .select('id')
        .eq('patient_id', id)
        .eq('doctor_id', req.user.id)
        .single();
      if (relation) hasAccess = true;
    } else if (req.user.role === 'admin') {
      hasAccess = true;
    }

    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    // Remove immutable fields
    const { id: pid, created_at, auth_id, ...allowedUpdates } = updateData;

    const { data, error } = await supabase
      .from('patients')
      .update(allowedUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, patient: data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};



// New: Add Doctor (Patient Only)
exports.addDoctor = async (req, res) => {
  try {
    const { doctorEmail } = req.body;
    if (req.user.role !== 'patient') {
      return res.status(403).json({ success: false, message: 'Only patients can add doctors.' });
    }

    // 1. Find Doctor
    const { data: doctor, error: docError } = await supabase
      .from('doctors')
      .select('id, full_name, email')
      .eq('email', doctorEmail)
      .single();

    if (docError || !doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found with that email.' });
    }

    // 2. Get Patient ID
    // Middleware ensures profile exists and sets req.user.patient_id
    const patientId = req.user.patient_id || req.user.id;

    // 3. Create Relationship
    const { error: linkError } = await supabase
      .from('patient_doctors')
      .insert({
        patient_id: patientId,
        doctor_id: doctor.id
      });

    if (linkError) {
      if (linkError.code === '23505') { // Unique violation
        return res.status(400).json({ success: false, message: 'Doctor already added.' });
      }
      throw linkError;
    }

    res.json({ success: true, message: 'Doctor added successfully.', doctor });
  } catch (err) {
    console.error('Add doctor error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// New: Remove Doctor (Patient Only)
exports.removeDoctor = async (req, res) => {
  try {
    const { doctorId } = req.body;
    if (req.user.role !== 'patient') {
      return res.status(403).json({ success: false, message: 'Only patients can remove doctors.' });
    }

    const patientId = req.user.patient_id || req.user.id;

    const { error } = await supabase
      .from('patient_doctors')
      .delete()
      .eq('patient_id', patientId)
      .eq('doctor_id', doctorId);

    if (error) throw error;
    res.json({ success: true, message: 'Doctor removed successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// New: Get My Doctors (Patient Only)
exports.getMyDoctors = async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({ success: false, message: 'Only patients can view their doctors.' });
    }

    const patientId = req.user.patient_id || req.user.id;

    const { data, error } = await supabase
      .from('patient_doctors')
      .select(`
        doctor:doctors (id, full_name, email, specialization, hospital)
      `)
      .eq('patient_id', patientId);

    if (error) throw error;

    const doctors = data.map(item => item.doctor);
    res.json({ success: true, doctors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.suggestMedication = async (req, res) => {
  // ... (Keep existing logic but update access check if needed, 
  // currently suggestMedication uses past_doctor_ids which we are deprecating.
  // We should update it to use patient_doctors table)
  try {
    const { patient_id, suggestion } = req.body;

    // Check relationship
    const { data: relation } = await supabase
      .from('patient_doctors')
      .select('id')
      .eq('patient_id', patient_id)
      .eq('doctor_id', req.user.id)
      .single();

    if (!relation) {
      return res.status(403).json({ success: false, message: 'Access denied. You are not linked to this patient.' });
    }

    const { data, error } = await supabase
      .from('medication_suggestions')
      .insert({
        patient_id,
        suggested_by: req.user.id,
        suggestion,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, suggestion: data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateMedication = async (req, res) => {
  // ... (Similar update for updateMedication)
  try {
    const { patient_id, medications } = req.body;

    const { data: relation } = await supabase
      .from('patient_doctors')
      .select('id')
      .eq('patient_id', patient_id)
      .eq('doctor_id', req.user.id)
      .single();

    if (!relation) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const { data, error } = await supabase
      .from('patients')
      .update({ medications })
      .eq('id', patient_id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, patient: data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deletePatient = async (req, res) => {
  // Only admins or the patient themselves (via auth deletion usually)
  // Doctors cannot delete patients anymore
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Only admins can delete patients.' });
  }
  // ... implementation for admin delete ...
  try {
    const { id } = req.params;
    const { error } = await supabase.from('patients').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true, message: 'Patient deleted.' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// AI Recommendations



