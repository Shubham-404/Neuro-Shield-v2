// controllers/file.controller.js
const { supabase } = require('../utils/supabaseClient');
const path = require('path');

// POST /files/upload
exports.uploadFile = async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const file = req.files.file;
    const fileExt = path.extname(file.name);
    const fileName = `${Date.now()}_${req.user.id}${fileExt}`;
    const filePath = `users/${req.user.id}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('patient-files')
      .upload(filePath, file.data, {
        contentType: file.mimetype,
        upsert: false
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('patient-files')
      .getPublicUrl(filePath);

    const metadata = {
      user_id: req.user.id,
      file_name: file.name,
      file_path: filePath,
      file_url: publicUrl,
      file_size: file.size,
      mime_type: file.mimetype
    };

    const { data: dbData, error: dbError } = await supabase
      .from('files')
      .insert(metadata)
      .select()
      .single();

    if (dbError) throw dbError;

    res.json({ success: true, file: dbData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /files/:id/download
exports.downloadFile = async (req, res) => {
  try {
    const { data: file } = await supabase
      .from('files')
      .select('file_path')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (!file) return res.status(404).json({ success: false, message: 'File not found.' });

    const { data, error } = await supabase.storage
      .from('patient-files')
      .download(file.file_path);

    if (error) throw error;

    res.setHeader('Content-Type', data.type);
    res.setHeader('Content-Disposition', `attachment; filename="${path.basename(file.file_path)}"`);
    data.stream.pipe(res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /files/metadata
exports.updateFileMetadata = async (req, res) => {
  try {
    const { id, patient_id, notes } = req.body;
    const { data, error } = await supabase
      .from('files')
      .update({ patient_id, notes })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, file: data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};