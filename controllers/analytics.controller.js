// controllers/analytics.controller.js
const { supabase } = require('../utils/supabaseClient');

exports.getDashboard = async (req, res) => {
  try {
    const role = req.user.role;
    let patients, patientIds;

    // Get patients based on role
    if (role === 'patient') {
      // Patient sees only their own data
      const { data: patientData } = await supabase
        .from('patients')
        .select('id')
        .eq('auth_id', req.user.authId)
        .single();
      
      patients = patientData ? [patientData] : [];
      patientIds = patientData ? [patientData.id] : [];
    } else {
      // Doctor/Admin sees their managed patients
      // First get patients created by this doctor
      const { data: createdPatients } = await supabase
        .from('patients')
        .select('id, age, gender, created_at, latest_risk_level')
        .eq('created_by', req.user.id);
      
      // Then get patients in past_doctor_ids
      const { data: assignedPatients } = await supabase
        .from('patients')
        .select('id, age, gender, created_at, latest_risk_level')
        .contains('past_doctor_ids', [req.user.id]);
      
      // Combine and deduplicate
      const allPatients = [...(createdPatients || []), ...(assignedPatients || [])];
      const uniquePatients = Array.from(new Map(allPatients.map(p => [p.id, p])).values());
      
      patients = uniquePatients;
      patientIds = patients.map(p => p.id);
    }

    if (patientIds.length === 0) {
      return res.json({
        success: true,
        summary: {
          total_patients: 0,
          high_risk: 0,
          moderate_risk: 0,
          low_risk: 0
        },
        charts: {
          riskDistribution: [],
          patientTrends: [],
          ageDistribution: [],
          genderDistribution: []
        }
      });
    }

    // Get predictions with dates for time series
    const { data: predictions } = await supabase
      .from('predictions')
      .select('risk_level, created_at, probability')
      .in('patient_id', patientIds)
      .order('created_at', { ascending: true });

    const high = predictions?.filter(p => p.risk_level === 'High').length || 0;
    const moderate = predictions?.filter(p => p.risk_level === 'Moderate').length || 0;
    const low = predictions?.filter(p => p.risk_level === 'Low').length || 0;

    // Risk distribution for pie chart
    const riskDistribution = [
      { name: 'Low Risk', value: low, color: '#22c55e' },
      { name: 'Moderate Risk', value: moderate, color: '#eab308' },
      { name: 'High Risk', value: high, color: '#ef4444' }
    ].filter(item => item.value > 0);

    // Patient trends over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentPredictions = predictions?.filter(p => {
      const predDate = new Date(p.created_at);
      return predDate >= thirtyDaysAgo;
    }) || [];

    // Group by date
    const trendsByDate = {};
    recentPredictions.forEach(pred => {
      const date = new Date(pred.created_at).toISOString().split('T')[0];
      if (!trendsByDate[date]) {
        trendsByDate[date] = { date, high: 0, moderate: 0, low: 0, total: 0 };
      }
      const riskLevel = pred.risk_level?.toLowerCase() || '';
      if (riskLevel.includes('high')) {
        trendsByDate[date].high++;
      } else if (riskLevel.includes('moderate')) {
        trendsByDate[date].moderate++;
      } else if (riskLevel.includes('low')) {
        trendsByDate[date].low++;
      }
      trendsByDate[date].total++;
    });

    const patientTrends = Object.values(trendsByDate).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );

    // Age distribution
    const ageGroups = { '0-30': 0, '31-50': 0, '51-70': 0, '71+': 0 };
    patients.forEach(p => {
      if (p.age) {
        if (p.age <= 30) ageGroups['0-30']++;
        else if (p.age <= 50) ageGroups['31-50']++;
        else if (p.age <= 70) ageGroups['51-70']++;
        else ageGroups['71+']++;
      }
    });

    const ageDistribution = Object.entries(ageGroups)
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0);

    // Gender distribution
    const genderCounts = {};
    patients.forEach(p => {
      if (p.gender) {
        genderCounts[p.gender] = (genderCounts[p.gender] || 0) + 1;
      }
    });

    const genderDistribution = Object.entries(genderCounts)
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0);

    res.json({
      success: true,
      summary: {
        total_patients: patients.length,
        high_risk: high,
        moderate_risk: moderate,
        low_risk: low
      },
      charts: {
        riskDistribution,
        patientTrends,
        ageDistribution,
        genderDistribution
      }
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};