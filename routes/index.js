// routes/index.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const userCtrl = require('../controllers/user.controller');
const patientCtrl = require('../controllers/patient.controller');
const fileCtrl = require('../controllers/file.controller');
const predCtrl = require('../controllers/prediction.controller');
const analyticsCtrl = require('../controllers/analytics.controller');

// Auth
router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);
router.get('/logout', userCtrl.logout);
router.get('/dashboard', auth, userCtrl.dashboard);

// Patients
router.post('/create-patient', auth, patientCtrl.createPatient);
router.get('/patients', auth, patientCtrl.getPatients);
router.get('/patients/:id', auth, patientCtrl.getPatientById);
router.post('/update-patient', auth, patientCtrl.updatePatient);
router.post('/delete-patient', auth, patientCtrl.deletePatient);
 
// Files
router.post('/files/upload', auth, fileCtrl.uploadFile);
router.get('/files/:id/download', auth, fileCtrl.downloadFile);
router.post('/files/metadata', auth, fileCtrl.updateFileMetadata);

// Predictions
router.post('/predict', auth, predCtrl.predictStroke);
router.get('/predictions/:patient_id', auth, predCtrl.getPredictionsByPatient);

// Analytics
router.get('/analytics/summary', auth, analyticsCtrl.getSummary);

// Health
router.get('/healthz', (req, res) => res.json({ success: true, status: 'ok' }));

module.exports = router;