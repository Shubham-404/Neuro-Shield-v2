// routes/patient.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const patientCtrl = require('../controllers/patient.controller');
const predictionCtrl = require('../controllers/prediction.controller');
const analyticsCtrl = require('../controllers/analytics.controller');

router.post('/create', auth, patientCtrl.createPatient);
router.get('/list', auth, patientCtrl.listPatients);
router.get('/:id', auth, patientCtrl.getPatient);
router.post('/suggest-update', auth, patientCtrl.suggestMedication);
router.post('/update-medication', auth, patientCtrl.updateMedication);
router.post('/delete', auth, patientCtrl.deletePatient);
router.post('/predict', auth, predictionCtrl.runPrediction);
router.get('/:id/predictions', auth, predictionCtrl.getPredictionHistory);
router.get('/analytics/dashboard', auth, analyticsCtrl.getDashboard);

module.exports = router;