// controllers/analytics.controller.js
const { supabase } = require('../utils/supabaseClient');

exports.getSummary = async (req, res) => {
  try {
    const [{ count: patientCount }] = await supabase
      .from('patients')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user.id);

    const [{ count: predictionCount }] = await supabase
      .from('predictions')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user.id);

    const { data: highRisk } = await supabase
      .from('predictions')
      .select('id')
      .eq('user_id', req.user.id)
      .gt('risk_score', 0.7);

    res.json({
      success: true,
      summary: {
        total_patients: patientCount || 0,
        total_predictions: predictionCount || 0,
        high_risk_cases: highRisk.length
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};