// controllers/healthRecommendations.controller.js
const { supabase } = require('../utils/supabaseClient');
const { generateRecommendations, generateWarnings } = require('../services/healthRecommendationsService');
const { generateGeneralAdvice, generateDoctorRecommendations } = require('../services/aiService');

// Get health recommendations for a patient
exports.getPatientRecommendations = async (req, res) => {
  try {
    console.log('[HealthRecommendations] getPatientRecommendations - User:', req.user.role, 'ID:', req.user.id);
    const patientId = req.params.patientId || req.user.patient_id;
    const recommendationType = req.query.type; // Optional filter by type
    const activeOnly = req.query.active_only !== 'false'; // Default to true

    if (!patientId) {
      console.error('[HealthRecommendations] No patient ID provided');
      return res.status(400).json({ success: false, message: 'Patient ID required' });
    }

    console.log('[HealthRecommendations] Fetching recommendations for patient:', patientId, 'type:', recommendationType, 'activeOnly:', activeOnly);

    // Verify access
    if (req.user.role === 'patient' && req.user.patient_id !== patientId) {
      console.warn('[HealthRecommendations] Access denied - patient ID mismatch');
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    let query = supabase
      .from('health_recommendations')
      .select(`
        *,
        created_by:doctors(id, full_name, specialization)
      `)
      .eq('patient_id', patientId)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    if (recommendationType) {
      query = query.eq('recommendation_type', recommendationType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[HealthRecommendations] Database error:', error);
      throw error;
    }

    console.log('[HealthRecommendations] Found', data?.length || 0, 'recommendations');
    res.json({ success: true, recommendations: data || [] });
  } catch (err) {
    console.error('Error fetching health recommendations:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Generate system recommendations for a patient
exports.generateSystemRecommendations = async (req, res) => {
  try {
    const patientId = req.params.patientId || req.user.patient_id;

    if (!patientId) {
      return res.status(400).json({ success: false, message: 'Patient ID required' });
    }

    // Verify access
    if (req.user.role === 'patient' && req.user.patient_id !== patientId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Generate recommendations and warnings
    const recommendations = await generateRecommendations(patientId);
    const warnings = await generateWarnings(patientId);

    res.json({
      success: true,
      recommendations,
      warnings,
      message: 'Recommendations generated successfully'
    });
  } catch (err) {
    console.error('Error generating recommendations:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Generate AI General Advice (Patient View)
exports.generateGeneralAdvice = async (req, res) => {
  try {
    const patientId = req.params.patientId || req.user.patient_id;

    // Verify access
    if (req.user.role === 'patient' && req.user.patient_id !== patientId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Get patient data
    const { data: patient } = await supabase
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .single();

    if (!patient) throw new Error('Patient not found');

    // Get recent metrics
    const { data: metrics } = await supabase
      .from('health_metrics')
      .select('*')
      .eq('patient_id', patientId)
      .order('recorded_at', { ascending: false })
      .limit(5);

    const advice = await generateGeneralAdvice(patient, metrics || []);

    res.json({ success: true, advice });
  } catch (err) {
    console.error('Error generating general advice:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Generate AI Recommendations for Doctor Review
exports.generateDoctorRecommendations = async (req, res) => {
  try {
    const { patientId } = req.params;

    // Only doctors/admins can generate these
    if (req.user.role === 'patient') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Get patient data
    const { data: patient } = await supabase
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .single();

    if (!patient) throw new Error('Patient not found');

    // Get recent metrics
    const { data: metrics } = await supabase
      .from('health_metrics')
      .select('*')
      .eq('patient_id', patientId)
      .order('recorded_at', { ascending: false })
      .limit(10);

    // Get latest prediction
    const { data: predictions } = await supabase
      .from('predictions')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })
      .limit(1);

    const recommendations = await generateDoctorRecommendations(patient, metrics || [], predictions?.[0]);

    res.json({ success: true, result: recommendations });
  } catch (err) {
    console.error('Error generating doctor recommendations:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Add a new health recommendation (doctors only, or system-generated)
exports.addRecommendation = async (req, res) => {
  try {
    const patientId = req.body.patient_id || req.user.patient_id;

    if (!patientId) {
      return res.status(400).json({ success: false, message: 'Patient ID required' });
    }

    // Only doctors can create recommendations, or system (created_by = null)
    const doctorId = req.user.role === 'doctor' ? req.user.doctor_id : null;

    const recommendationData = {
      patient_id: patientId,
      recommendation_type: req.body.recommendation_type,
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      priority: req.body.priority || 'medium',
      is_active: req.body.is_active !== undefined ? req.body.is_active : true,
      start_date: req.body.start_date,
      end_date: req.body.end_date,
      created_by: doctorId
    };

    const { data, error } = await supabase
      .from('health_recommendations')
      .insert(recommendationData)
      .select(`
        *,
        created_by:doctors(id, full_name, specialization)
      `)
      .single();

    if (error) throw error;

    res.json({ success: true, recommendation: data });
  } catch (err) {
    console.error('Error adding health recommendation:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update a health recommendation
exports.updateRecommendation = async (req, res) => {
  try {
    const recommendationId = req.params.id;

    // Get the recommendation first to check access
    const { data: recommendation, error: fetchError } = await supabase
      .from('health_recommendations')
      .select('patient_id, created_by')
      .eq('id', recommendationId)
      .single();

    if (fetchError) throw fetchError;

    // Verify access: patient can only update their own, doctor can update if they created it or it's for their patient
    if (req.user.role === 'patient' && req.user.patient_id !== recommendation.patient_id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (req.user.role === 'doctor' && recommendation.created_by !== req.user.doctor_id) {
      // Check if doctor has relationship with patient
      const { data: relationship } = await supabase
        .from('patient_doctor_relationships')
        .select('id')
        .eq('patient_id', recommendation.patient_id)
        .eq('doctor_id', req.user.doctor_id)
        .eq('status', 'active')
        .single();

      if (!relationship) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    }

    const updateData = {
      recommendation_type: req.body.recommendation_type,
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      priority: req.body.priority,
      is_active: req.body.is_active,
      start_date: req.body.start_date,
      end_date: req.body.end_date
    };

    const { data, error } = await supabase
      .from('health_recommendations')
      .update(updateData)
      .eq('id', recommendationId)
      .select(`
        *,
        created_by:doctors(id, full_name, specialization)
      `)
      .single();

    if (error) throw error;

    res.json({ success: true, recommendation: data });
  } catch (err) {
    console.error('Error updating health recommendation:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete a health recommendation
exports.deleteRecommendation = async (req, res) => {
  try {
    const recommendationId = req.params.id;

    // Get the recommendation first to check access
    const { data: recommendation, error: fetchError } = await supabase
      .from('health_recommendations')
      .select('patient_id, created_by')
      .eq('id', recommendationId)
      .single();

    if (fetchError) throw fetchError;

    // Verify access
    if (req.user.role === 'patient' && req.user.patient_id !== recommendation.patient_id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (req.user.role === 'doctor' && recommendation.created_by !== req.user.doctor_id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { error } = await supabase
      .from('health_recommendations')
      .delete()
      .eq('id', recommendationId);

    if (error) throw error;

    res.json({ success: true, message: 'Recommendation deleted successfully' });
  } catch (err) {
    console.error('Error deleting health recommendation:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
