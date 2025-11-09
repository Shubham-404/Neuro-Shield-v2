// controllers/patient.controller.js
const { supabase } = require('../utils/supabaseClient');

exports.createPatient = async (req, res) => {
  try {
    const patientData = {
      ...req.body,
      created_by: req.user.id,
      past_doctor_ids: [req.user.id]
    };

    const { data, error } = await supabase
      .from('patients')
      .insert(patientData)
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, patient: data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.listPatients = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .contains('past_doctor_ids', [req.user.id])
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, patients: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPatient = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    // Check access: patient must be in past_doctor_ids or created_by
    const hasAccess = data.past_doctor_ids?.includes(req.user.id) || data.created_by === req.user.id;
    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'Access denied to this patient.' });
    }

    res.json({ success: true, patient: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.suggestMedication = async (req, res) => {
  try {
    const { patient_id, suggestion } = req.body;

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
      .from('medication_suggestions')
      .insert({ 
        patient_id, 
        suggested_by: req.user.id, 
        suggestion,
        status: 'pending'  // Default status as per spec
      })
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, suggestion: data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateMedication = async (req, res) => {
  try {
    const { patient_id, medications } = req.body;

    const { data: patient } = await supabase
      .from('patients')
      .select('created_by, past_doctor_ids')
      .eq('id', patient_id)
      .single();

    const isOwner = patient.created_by === req.user.id;
    const isInPast = patient.past_doctor_ids.includes(req.user.id);
    if (!isOwner && !isInPast) {
      return res.status(403).json({ success: false, message: 'Not authorized to update medication.' });
    }

    const { data, error } = await supabase
      .from('patients')
      .update({ medications })
      .eq('id', patient_id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, patient: data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deletePatient = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ success: false, message: 'Patient ID required.' });
    }

    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('created_by')
      .eq('id', id)
      .single();

    if (patientError || !patient) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    if (patient.created_by !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only creator can delete.' });
    }

    const { error } = await supabase.from('patients').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true, message: 'Patient deleted.' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};