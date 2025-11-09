// controllers/analytics.controller.js
const { supabase } = require('../utils/supabaseClient');

exports.getDashboard = async (req, res) => {
  try {
    const { data: patients } = await supabase
      .from('patients')
      .select('id')
      .contains('past_doctor_ids', [req.user.id]);

    const patientIds = patients.map(p => p.id);

    const { data: predictions } = await supabase
      .from('predictions')
      .select('risk_level')
      .in('patient_id', patientIds);

    const high = predictions.filter(p => p.risk_level === 'High').length;
    const moderate = predictions.filter(p => p.risk_level === 'Moderate').length;
    const low = predictions.filter(p => p.risk_level === 'Low').length;

    res.json({
      success: true,
      summary: {
        total_patients: patients.length,
        high_risk: high,
        moderate_risk: moderate,
        low_risk: low
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};