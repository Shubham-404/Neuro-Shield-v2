// controllers/prediction.controller.js
const { supabase } = require('../utils/supabaseClient');
const axios = require('axios');

exports.predictStroke = async (req, res) => {
  try {
    const { patient_id, features } = req.body;
    if (!patient_id || !features) {
      return res.status(400).json({ success: false, message: 'Patient ID and features required.' });
    }

    // Call ML microservice
    const mlResponse = await axios.post(process.env.ML_SERVICE_URL, { features });

    const prediction = {
      patient_id,
      user_id: req.user.id,
      risk_score: mlResponse.data.risk_score,
      prediction: mlResponse.data.prediction,
      confidence: mlResponse.data.confidence,
      features: features
    };

    const { data, error } = await supabase
      .from('predictions')
      .insert(prediction)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, prediction: data });
  } catch (err) {
    console.error('ML Error:', err.response?.data || err.message);
    res.status(500).json({ success: false, message: 'Prediction failed.' });
  }
};

exports.getPredictionsByPatient = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('predictions')
      .select('*')
      .eq('patient_id', req.params.patient_id)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, predictions: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};