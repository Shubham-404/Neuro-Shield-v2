// controllers/patient.controller.js
const { supabase } = require('../utils/supabaseClient');
const axios = require('axios');

// POST /create-patient
exports.createPatient = async (req, res) => {
  try {
    const { name, age, gender, medical_history } = req.body;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('patients')
      .insert({ user_id: userId, name, age, gender, medical_history })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, patient: data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// GET /patients
exports.getPatients = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, patients: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /patients/:id
exports.getPatientById = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ success: false, message: 'Patient not found.' });

    res.json({ success: true, patient: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /update-patient
exports.updatePatient = async (req, res) => {
  try {
    const { id, ...updates } = req.body;
    const { data, error } = await supabase
      .from('patients')
      .update(updates)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, patient: data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// POST /delete-patient
exports.deletePatient = async (req, res) => {
  try {
    const { id } = req.body;
    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.json({ success: true, message: 'Patient deleted.' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};