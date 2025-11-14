// controllers/healthLogs.controller.js
const { supabase } = require('../utils/supabaseClient');

// Get health logs for a patient
exports.getPatientLogs = async (req, res) => {
  try {
    console.log('[HealthLogs] getPatientLogs - User:', req.user.role, 'ID:', req.user.id);
    const patientId = req.params.patientId || req.user.patient_id;
    const logType = req.query.type; // Optional filter by type
    const startDate = req.query.start_date;
    const endDate = req.query.end_date;
    
    if (!patientId) {
      console.error('[HealthLogs] No patient ID provided');
      return res.status(400).json({ success: false, message: 'Patient ID required' });
    }

    console.log('[HealthLogs] Fetching logs for patient:', patientId, 'type:', logType, 'date range:', startDate, 'to', endDate);

    // Verify access
    if (req.user.role === 'patient' && req.user.patient_id !== patientId) {
      console.warn('[HealthLogs] Access denied - patient ID mismatch');
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    let query = supabase
      .from('health_logs')
      .select('*')
      .eq('patient_id', patientId)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    if (logType) {
      query = query.eq('log_type', logType);
    }

    if (startDate) {
      query = query.gte('date', startDate);
    }

    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[HealthLogs] Database error:', error);
      throw error;
    }

    console.log('[HealthLogs] Found', data?.length || 0, 'logs');
    res.json({ success: true, logs: data || [] });
  } catch (err) {
    console.error('Error fetching health logs:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Add a new health log
exports.addLog = async (req, res) => {
  try {
    const patientId = req.user.patient_id || req.body.patient_id;
    
    if (!patientId) {
      return res.status(400).json({ success: false, message: 'Patient ID required' });
    }

    if (req.user.role === 'patient' && req.user.patient_id !== patientId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const logData = {
      patient_id: patientId,
      log_type: req.body.log_type,
      title: req.body.title,
      description: req.body.description,
      value: req.body.value,
      date: req.body.date || new Date().toISOString().split('T')[0],
      time: req.body.time
    };

    const { data, error } = await supabase
      .from('health_logs')
      .insert(logData)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, log: data });
  } catch (err) {
    console.error('Error adding health log:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update a health log
exports.updateLog = async (req, res) => {
  try {
    const logId = req.params.id;
    
    // Get the log first to check ownership
    const { data: log, error: fetchError } = await supabase
      .from('health_logs')
      .select('patient_id')
      .eq('id', logId)
      .single();

    if (fetchError) throw fetchError;

    // Verify ownership
    if (req.user.role === 'patient' && req.user.patient_id !== log.patient_id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const updateData = {
      log_type: req.body.log_type,
      title: req.body.title,
      description: req.body.description,
      value: req.body.value,
      date: req.body.date,
      time: req.body.time
    };

    const { data, error } = await supabase
      .from('health_logs')
      .update(updateData)
      .eq('id', logId)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, log: data });
  } catch (err) {
    console.error('Error updating health log:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete a health log
exports.deleteLog = async (req, res) => {
  try {
    const logId = req.params.id;
    
    // Get the log first to check ownership
    const { data: log, error: fetchError } = await supabase
      .from('health_logs')
      .select('patient_id')
      .eq('id', logId)
      .single();

    if (fetchError) throw fetchError;

    // Verify ownership
    if (req.user.role === 'patient' && req.user.patient_id !== log.patient_id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { error } = await supabase
      .from('health_logs')
      .delete()
      .eq('id', logId);

    if (error) throw error;

    res.json({ success: true, message: 'Log deleted successfully' });
  } catch (err) {
    console.error('Error deleting health log:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

