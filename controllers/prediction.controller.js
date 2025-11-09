// controllers/prediction.controller.js
const { supabase } = require('../utils/supabaseClient');
const axios = require('axios');

exports.runPrediction = async (req, res) => {
  try {
    const { patient_id, features } = req.body;

    const mlRes = await axios.post(process.env.ML_SERVICE_URL, { features });
    const { prediction, probability, key_factors } = mlRes.data;

    const risk_level = probability > 0.7 ? 'High' : probability > 0.4 ? 'Moderate' : 'Low';

    const { data, error } = await supabase
      .from('predictions')
      .insert({
        patient_id,
        doctor_id: req.user.id,
        prediction,
        probability,
        risk_level,
        key_factors
      })
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, prediction: data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Prediction failed.' });
  }
};

exports.getPredictionHistory = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('predictions')
      .select('*')
      .eq('patient_id', req.params.patient_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, predictions: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};