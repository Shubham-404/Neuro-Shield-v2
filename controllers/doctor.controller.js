// controllers/doctor.controller.js
const { supabase } = require('../utils/supabaseClient');

exports.getProfile = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;
    res.json({ success: true, doctor: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    const { data, error } = await supabase
      .from('doctors')
      .update(updates)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, message: 'Profile updated.', doctor: data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};