// controllers/medicalRecords.controller.js
const { supabase } = require('../utils/supabaseClient');

// Get all medical records for a patient
exports.getPatientRecords = async (req, res) => {
  try {
    console.log('[MedicalRecords] getPatientRecords - User:', req.user.role, 'ID:', req.user.id);
    const patientId = req.params.patientId || req.user.patient_id;
    
    if (!patientId) {
      console.error('[MedicalRecords] No patient ID provided');
      return res.status(400).json({ success: false, message: 'Patient ID required' });
    }

    console.log('[MedicalRecords] Fetching records for patient:', patientId);

    // Verify patient owns the records or is a doctor viewing their patient
    if (req.user.role === 'patient' && req.user.patient_id !== patientId) {
      console.warn('[MedicalRecords] Access denied - patient ID mismatch');
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { data, error } = await supabase
      .from('medical_records')
      .select(`
        *,
        verified_by:doctors(id, full_name, specialization),
        verifications:doctor_verifications(
          id,
          doctor_id,
          status,
          notes,
          requested_info,
          verified_at,
          doctor:doctors(id, full_name, specialization)
        )
      `)
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[MedicalRecords] Database error:', error);
      throw error;
    }

    console.log('[MedicalRecords] Found', data?.length || 0, 'records');
    res.json({ success: true, records: data || [] });
  } catch (err) {
    console.error('Error fetching medical records:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Upload a new medical record
exports.uploadRecord = async (req, res) => {
  try {
    const patientId = req.user.patient_id || req.body.patient_id;
    
    if (!patientId) {
      return res.status(400).json({ success: false, message: 'Patient ID required' });
    }

    if (req.user.role === 'patient' && req.user.patient_id !== patientId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const recordData = {
      patient_id: patientId,
      record_type: req.body.record_type || 'other',
      title: req.body.title,
      description: req.body.description,
      file_url: req.body.file_url, // Should be set by file upload middleware
      file_type: req.body.file_type,
      file_size: req.body.file_size,
      record_date: req.body.record_date || new Date().toISOString().split('T')[0]
    };

    const { data, error } = await supabase
      .from('medical_records')
      .insert(recordData)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, record: data });
  } catch (err) {
    console.error('Error uploading medical record:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update a medical record
exports.updateRecord = async (req, res) => {
  try {
    const recordId = req.params.id;
    
    // Get the record first to check ownership
    const { data: record, error: fetchError } = await supabase
      .from('medical_records')
      .select('patient_id')
      .eq('id', recordId)
      .single();

    if (fetchError) throw fetchError;

    // Verify ownership
    if (req.user.role === 'patient' && req.user.patient_id !== record.patient_id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const updateData = {
      title: req.body.title,
      description: req.body.description,
      record_type: req.body.record_type,
      record_date: req.body.record_date
    };

    // Only update file if new file provided
    if (req.body.file_url) {
      updateData.file_url = req.body.file_url;
      updateData.file_type = req.body.file_type;
      updateData.file_size = req.body.file_size;
    }

    const { data, error } = await supabase
      .from('medical_records')
      .update(updateData)
      .eq('id', recordId)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, record: data });
  } catch (err) {
    console.error('Error updating medical record:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete a medical record
exports.deleteRecord = async (req, res) => {
  try {
    const recordId = req.params.id;
    
    // Get the record first to check ownership
    const { data: record, error: fetchError } = await supabase
      .from('medical_records')
      .select('patient_id, file_url')
      .eq('id', recordId)
      .single();

    if (fetchError) throw fetchError;

    // Verify ownership
    if (req.user.role === 'patient' && req.user.patient_id !== record.patient_id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Delete file from storage if file_url exists
    if (record.file_url) {
      try {
        // Extract file path from URL
        const urlParts = record.file_url.split('/storage/v1/object/public/medical-records/')
        if (urlParts.length > 1) {
          const filePath = urlParts[1]
          const { error: storageError } = await supabaseAdmin.storage
            .from('medical-records')
            .remove([filePath]);
          
          if (storageError) {
            console.warn('Failed to delete file from storage:', storageError);
            // Continue with record deletion even if file deletion fails
          }
        }
      } catch (storageErr) {
        console.warn('Error deleting file from storage:', storageErr);
        // Continue with record deletion
      }
    }

    const { error } = await supabase
      .from('medical_records')
      .delete()
      .eq('id', recordId);

    if (error) throw error;

    res.json({ success: true, message: 'Record deleted successfully' });
  } catch (err) {
    console.error('Error deleting medical record:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Doctor: Verify a medical record
exports.verifyRecord = async (req, res) => {
  try {
    if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only doctors can verify records' });
    }

    const recordId = req.params.id;
    const doctorId = req.user.doctor_id;

    // Check if record exists
    const { data: record, error: fetchError } = await supabase
      .from('medical_records')
      .select('patient_id, verification_status')
      .eq('id', recordId)
      .single();

    if (fetchError) throw fetchError;

    const verificationData = {
      medical_record_id: recordId,
      doctor_id: doctorId,
      status: req.body.status, // 'verified', 'rejected', 'needs_more_info'
      notes: req.body.notes,
      requested_info: req.body.requested_info
    };

    // Upsert verification (update if exists, insert if not)
    const { data: verification, error: verifyError } = await supabase
      .from('doctor_verifications')
      .upsert(verificationData, { onConflict: 'medical_record_id,doctor_id' })
      .select()
      .single();

    if (verifyError) throw verifyError;

    // Update record verification status
    const { error: updateError } = await supabase
      .from('medical_records')
      .update({
        verification_status: req.body.status,
        verified_by: doctorId,
        doctor_notes: req.body.notes
      })
      .eq('id', recordId);

    if (updateError) throw updateError;

    res.json({ success: true, verification });
  } catch (err) {
    console.error('Error verifying medical record:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

