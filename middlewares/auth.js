// middleware/auth.js
const { supabase } = require('../utils/supabaseClient');
const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
  const token = req.cookies.neuroShieldToken;
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.sub;

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user || user.id !== userId) {
      throw new Error('Invalid token');
    }

    // Fetch doctor record (auth_id = user.id)
    const { data: doctor, error: docErr } = await supabase
      .from('doctors')
      .select('id, full_name, email, role')
      .eq('auth_id', userId)
      .single();

    if (docErr || !doctor) {
      return res.status(403).json({ success: false, message: 'Doctor profile not found.' });
    }

    req.user = {
      id: doctor.id,          // doctor.id (from doctors table)
      authId: userId,         // Supabase auth.id
      email: doctor.email,
      name: doctor.full_name,
      role: 'doctor'
    };

    next();
  } catch (err) {
    res.clearCookie('neuroShieldToken');
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};