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

    // Validate required patient data
    const requiredFields = ['age', 'avg_glucose_level', 'bmi'];
    const missingFields = requiredFields.filter(field => patient[field] === null || patient[field] === undefined);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        success: false,  
        message: `Missing required patient data: ${missingFields.join(', ')}. Please update patient information.` 
      });
    }

    // Prepare ML input (direct patient data, not wrapped in features)
    // Include all fields required by ML model for accurate predictions
    const mlInput = {
      age: parseFloat(patient.age) || 0,
      hypertension: patient.hypertension ? 1 : 0,
      heart_disease: patient.heart_disease ? 1 : 0,
      avg_glucose_level: parseFloat(patient.avg_glucose_level) || 0,
      bmi: parseFloat(patient.bmi) || 0,
      smoking_status: patient.smoking_status || 'Unknown',
      // Additional ML required fields
      gender: patient.gender || 'Male',
      ever_married: patient.ever_married !== undefined ? (patient.ever_married ? 1 : 0) : 1,
      work_type: patient.work_type || 'Private',
      residence_type: patient.residence_type || 'Urban'
    };

    // Log ML input for debugging
    console.log('ML Input:', JSON.stringify(mlInput, null, 2));

    // Call ML service
    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    console.log(`Calling ML service at: ${mlServiceUrl}/predict`);
    
    let mlRes;
    try {
      mlRes = await axios.post(`${mlServiceUrl}/predict`, mlInput, {
        timeout: 60000, // 60 second timeout for ML predictions
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('ML Service response received:', {
        prediction: mlRes.data?.prediction,
        probability: mlRes.data?.probability,
        risk_level: mlRes.data?.risk_level
      });
    } catch (mlError) {
      console.error('ML Service error:', mlError.message);
      
      if (mlError.code === 'ECONNREFUSED' || mlError.code === 'ETIMEDOUT') {
        return res.status(503).json({ 
          success: false, 
          message: 'ML service is not available. Please ensure the ML service is running on port 8000.',
          error: 'ML_SERVICE_UNAVAILABLE'
        });
      }
      
      if (mlError.response) {
        // ML service returned an error
        return res.status(mlError.response.status || 500).json({ 
          success: false, 
          message: mlError.response.data?.detail || mlError.response.data?.message || 'ML prediction failed',
          error: mlError.response.data
        });
      }
      
      throw mlError; // Re-throw if it's an unexpected error
    }

    // Validate ML service response
    if (!mlRes.data) {
      return res.status(500).json({ 
        success: false, 
        message: 'Invalid response from ML service' 
      });
    }

    const { prediction, probability, key_factors, risk_level: mlRiskLevel } = mlRes.data;
    
    // Validate response data
    if (prediction === undefined || probability === undefined) {
      return res.status(500).json({ 
        success: false, 
        message: 'ML service returned incomplete data' 
      });
    }

    // Use risk_level from ML service if provided, otherwise calculate
    const risk_level = mlRiskLevel || (probability >= 0.7 ? 'High' : probability >= 0.4 ? 'Moderate' : 'Low');

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
    
    // Provide more specific error messages
    let errorMessage = 'Prediction failed.';
    if (err.message) {
      errorMessage = err.message;
    } else if (typeof err === 'string') {
      errorMessage = err;
    }
    
    res.status(500).json({ 
      success: false, 
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
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