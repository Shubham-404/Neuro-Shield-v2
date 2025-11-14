// routes/patientFeatures.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const medicalRecordsCtrl = require('../controllers/medicalRecords.controller');
const healthMetricsCtrl = require('../controllers/healthMetrics.controller');
const healthLogsCtrl = require('../controllers/healthLogs.controller');
const healthRecommendationsCtrl = require('../controllers/healthRecommendations.controller');
const doctorFinderCtrl = require('../controllers/doctorFinder.controller');

router.use(auth); // All routes require authentication

// Medical Records Routes
router.get('/records', medicalRecordsCtrl.getPatientRecords);
router.get('/records/:patientId', medicalRecordsCtrl.getPatientRecords);
router.post('/records/upload', medicalRecordsCtrl.uploadRecord);
router.put('/records/:id', medicalRecordsCtrl.updateRecord);
router.delete('/records/:id', medicalRecordsCtrl.deleteRecord);
router.post('/records/:id/verify', medicalRecordsCtrl.verifyRecord); // Doctor only

// Health Metrics Routes
router.get('/metrics', healthMetricsCtrl.getPatientMetrics);
router.get('/metrics/:patientId', healthMetricsCtrl.getPatientMetrics);
router.post('/metrics', healthMetricsCtrl.addMetric);
router.put('/metrics/:id', healthMetricsCtrl.updateMetric);
router.delete('/metrics/:id', healthMetricsCtrl.deleteMetric);

// Health Logs Routes
router.get('/logs', healthLogsCtrl.getPatientLogs);
router.get('/logs/:patientId', healthLogsCtrl.getPatientLogs);
router.post('/logs', healthLogsCtrl.addLog);
router.put('/logs/:id', healthLogsCtrl.updateLog);
router.delete('/logs/:id', healthLogsCtrl.deleteLog);

// Health Recommendations Routes
router.get('/recommendations', healthRecommendationsCtrl.getPatientRecommendations);
router.get('/recommendations/:patientId', healthRecommendationsCtrl.getPatientRecommendations);
router.post('/recommendations', healthRecommendationsCtrl.addRecommendation);
router.post('/recommendations/generate', healthRecommendationsCtrl.generateSystemRecommendations);
router.post('/recommendations/generate/:patientId', healthRecommendationsCtrl.generateSystemRecommendations);
router.put('/recommendations/:id', healthRecommendationsCtrl.updateRecommendation);
router.delete('/recommendations/:id', healthRecommendationsCtrl.deleteRecommendation);

// Doctor Finder Routes (public for authenticated users)
router.get('/doctors/find', doctorFinderCtrl.findDoctors);
router.get('/doctors/locations', doctorFinderCtrl.getAllLocations);

module.exports = router;

