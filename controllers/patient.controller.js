// controllers/patient.controller.js
const { supabase } = require('../utils/supabaseClient');

exports.createPatient = async (req, res) => {
  try {
    console.log('Patient creation request received:', {
      userRole: req.user?.role,
      userId: req.user?.id,
      body: req.body
    });

    // Only doctors and admins can create patients
    if (!req.user || (req.user.role !== 'doctor' && req.user.role !== 'admin')) {
      console.log('Access denied - user role:', req.user?.role);
      return res.status(403).json({ 
        success: false, 
        message: 'Only doctors and admins can create patients.' 
      });
    }

    // If user is a doctor, use their doctor ID; if admin, we need to handle differently
    // For now, admins can't create patients directly (they would need to be associated with a doctor)
    if (req.user.role === 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Admins cannot directly create patients. Please use a doctor account.' 
      });
    }

    // Check for duplicate patients (same name, age, and email if provided)
    if (req.body.name && req.body.age) {
      const { data: existingPatients } = await supabase
        .from('patients')
        .select('id, name, age, email')
        .eq('name', req.body.name)
        .eq('age', parseInt(req.body.age))
      
      if (existingPatients && existingPatients.length > 0) {
        // If email is provided, also check email match
        if (req.body.email) {
          const emailMatch = existingPatients.find(p => p.email === req.body.email)
          if (emailMatch) {
            return res.status(400).json({
              success: false,
              message: 'A patient with this name, age, and email already exists. Please check for duplicates.'
            })
          }
        } else {
          // If no email provided but name+age match, warn but allow (might be different person)
          // Could be enhanced with more validation
        }
      }
    }

    // Ensure required ML fields have defaults if not provided
    const patientData = {
      name: req.body.name,
      age: req.body.age ? parseInt(req.body.age) : null,
      gender: req.body.gender || 'Male',
      email: req.body.email || null,
      medical_history: req.body.medical_history || null,
      blood_group: req.body.blood_group || null,
      hypertension: req.body.hypertension === true || req.body.hypertension === 'true' || req.body.hypertension === 1,
      heart_disease: req.body.heart_disease === true || req.body.heart_disease === 'true' || req.body.heart_disease === 1,
      avg_glucose_level: req.body.avg_glucose_level ? parseFloat(req.body.avg_glucose_level) : null,
      bmi: req.body.bmi ? parseFloat(req.body.bmi) : null,
      smoking_status: req.body.smoking_status || 'Unknown',
      medications: req.body.medications || null,
      nihss_total: req.body.nihss_total ? parseInt(req.body.nihss_total) : null,
      notes: req.body.notes || null,
      // ML prediction required fields
      ever_married: req.body.ever_married !== undefined ? (req.body.ever_married === true || req.body.ever_married === 'true' || req.body.ever_married === 1) : true,
      work_type: req.body.work_type || 'Private',
      residence_type: req.body.residence_type || 'Urban',
      // Doctor association
      created_by: req.user.id, // This is the doctor's ID from doctors table
      past_doctor_ids: [req.user.id]
    };

    console.log('Patient data to insert:', patientData);

    const { data, error } = await supabase
      .from('patients')
      .insert(patientData)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      // Provide more specific error messages
      if (error.code === '23503') {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid doctor ID. Please ensure you are logged in as a doctor.' 
        });
      }
      if (error.code === '23505') {
        return res.status(400).json({ 
          success: false, 
          message: 'A patient with this information already exists.' 
        });
      }
      return res.status(400).json({ 
        success: false, 
        message: error.message || 'Failed to create patient. Please check all required fields are provided.' 
      });
    }
    
    console.log('Patient created successfully:', data.id);
    res.status(201).json({ success: true, patient: data });
  } catch (err) {
    console.error('Patient creation exception:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message || 'Failed to create patient. Please check all required fields are provided.' 
    });
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

exports.updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: 'Patient ID required.' });
    }

    // Verify patient access
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('created_by, past_doctor_ids')
      .eq('id', id)
      .single();

    if (patientError || !patient) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    const hasAccess = patient.past_doctor_ids?.includes(req.user.id) || patient.created_by === req.user.id;
    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'Access denied to this patient.' });
    }

    // Remove fields that shouldn't be updated
    const { created_by, past_doctor_ids, id: patientId, created_at, ...allowedUpdates } = updateData;

    // Update patient
    const { data, error } = await supabase
      .from('patients')
      .update(allowedUpdates)
      .eq('id', id)
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