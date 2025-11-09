// controllers/prediction.controller.js
const { supabase } = require('../utils/supabaseClient');
const axios = require('axios');

exports.runPrediction = async (req, res) => {
  try {
    const { patient_id } = req.body;

    if (!patient_id) {
      return res.status(400).json({ success: false, message: 'patient_id required.' });
    }

    // Fetch patient data
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('*')
      .eq('id', patient_id)
      .single();

    if (patientError || !patient) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    // Check access: patient must be in past_doctor_ids or created_by
    const hasAccess = patient.past_doctor_ids?.includes(req.user.id) || patient.created_by === req.user.id;
    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'Access denied to this patient.' });
    }

    // Prepare ML input (direct patient data, not wrapped in features)
    const mlInput = {
      age: patient.age,
      hypertension: patient.hypertension ? 1 : 0,
      heart_disease: patient.heart_disease ? 1 : 0,
      avg_glucose_level: patient.avg_glucose_level,
      bmi: patient.bmi,
      smoking_status: patient.smoking_status || 'Unknown'
    };

    // Call ML service
    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:5000';
    const mlRes = await axios.post(`${mlServiceUrl}/predict`, mlInput);
    const { prediction, probability, key_factors } = mlRes.data;

    const risk_level = probability > 0.7 ? 'High' : probability > 0.4 ? 'Moderate' : 'Low';

    // Save prediction to database
    const { data, error } = await supabase
      .from('predictions')
      .insert({
        patient_id,
        doctor_id: req.user.id,
        prediction,
        probability,
        risk_level,
        key_factors: key_factors || {}
      })
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, prediction: data });
  } catch (err) {
    console.error('Prediction error:', err);
    res.status(500).json({ success: false, message: 'Prediction failed.', error: err.message });
  }
};

exports.getPredictionHistory = async (req, res) => {
  try {
    const { patient_id } = req.params;

    // Verify patient access
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('past_doctor_ids, created_by')
      .eq('id', patient_id)
      .single();

    if (patientError || !patient) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    const hasAccess = patient.past_doctor_ids?.includes(req.user.id) || patient.created_by === req.user.id;
    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const { data, error } = await supabase
      .from('predictions')
      .select('*')
      .eq('patient_id', patient_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, predictions: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};