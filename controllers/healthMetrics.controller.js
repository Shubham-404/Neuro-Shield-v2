// controllers/healthMetrics.controller.js
const { supabase } = require('../utils/supabaseClient');

// Get health metrics for a patient
exports.getPatientMetrics = async (req, res) => {
  try {
    console.log('[HealthMetrics] getPatientMetrics - User:', req.user.role, 'ID:', req.user.id);
    const patientId = req.params.patientId || req.user.patient_id;
    const metricType = req.query.type; // Optional filter by type
    
    if (!patientId) {
      console.error('[HealthMetrics] No patient ID provided');
      return res.status(400).json({ success: false, message: 'Patient ID required' });
    }

    console.log('[HealthMetrics] Fetching metrics for patient:', patientId, 'type:', metricType);

    // Verify access
    if (req.user.role === 'patient' && req.user.patient_id !== patientId) {
      console.warn('[HealthMetrics] Access denied - patient ID mismatch');
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    let query = supabase
      .from('health_metrics')
      .select('*')
      .eq('patient_id', patientId)
      .order('recorded_at', { ascending: false });

    if (metricType) {
      query = query.eq('metric_type', metricType);
    }

    // Optional date range filter
    if (req.query.start_date) {
      query = query.gte('recorded_at', req.query.start_date);
    }
    if (req.query.end_date) {
      query = query.lte('recorded_at', req.query.end_date);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[HealthMetrics] Database error:', error);
      throw error;
    }

    console.log('[HealthMetrics] Found', data?.length || 0, 'metrics');
    res.json({ success: true, metrics: data || [] });
  } catch (err) {
    console.error('Error fetching health metrics:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Add a new health metric
exports.addMetric = async (req, res) => {
  try {
    const patientId = req.user.patient_id || req.body.patient_id;
    
    if (!patientId) {
      return res.status(400).json({ success: false, message: 'Patient ID required' });
    }

    if (req.user.role === 'patient' && req.user.patient_id !== patientId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const metricData = {
      patient_id: patientId,
      metric_type: req.body.metric_type,
      value: req.body.value,
      unit: req.body.unit,
      notes: req.body.notes,
      recorded_at: req.body.recorded_at || new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('health_metrics')
      .insert(metricData)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, metric: data });
  } catch (err) {
    console.error('Error adding health metric:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update a health metric
exports.updateMetric = async (req, res) => {
  try {
    const metricId = req.params.id;
    
    // Get the metric first to check ownership
    const { data: metric, error: fetchError } = await supabase
      .from('health_metrics')
      .select('patient_id')
      .eq('id', metricId)
      .single();

    if (fetchError) throw fetchError;

    // Verify ownership
    if (req.user.role === 'patient' && req.user.patient_id !== metric.patient_id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const updateData = {
      metric_type: req.body.metric_type,
      value: req.body.value,
      unit: req.body.unit,
      notes: req.body.notes
    };

    if (req.body.recorded_at) {
      updateData.recorded_at = req.body.recorded_at;
    }

    const { data, error } = await supabase
      .from('health_metrics')
      .update(updateData)
      .eq('id', metricId)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, metric: data });
  } catch (err) {
    console.error('Error updating health metric:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete a health metric
exports.deleteMetric = async (req, res) => {
  try {
    const metricId = req.params.id;
    
    // Get the metric first to check ownership
    const { data: metric, error: fetchError } = await supabase
      .from('health_metrics')
      .select('patient_id')
      .eq('id', metricId)
      .single();

    if (fetchError) throw fetchError;

    // Verify ownership
    if (req.user.role === 'patient' && req.user.patient_id !== metric.patient_id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { error } = await supabase
      .from('health_metrics')
      .delete()
      .eq('id', metricId);

    if (error) throw error;

    res.json({ success: true, message: 'Metric deleted successfully' });
  } catch (err) {
    console.error('Error deleting health metric:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

