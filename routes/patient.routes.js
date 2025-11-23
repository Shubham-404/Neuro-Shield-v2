// routes/patient.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const patientCtrl = require('../controllers/patient.controller');

router.use(auth); // All patient routes require authentication

// Patient-Doctor Relationship (New)
router.post('/add-doctor', patientCtrl.addDoctor);
router.post('/remove-doctor', patientCtrl.removeDoctor);
router.get('/my-doctors', patientCtrl.getMyDoctors);

// AI Recommendations (Must be before /:id)
router.post('/generate-recommendations', patientCtrl.generateAIRecommendations);
router.get('/recommendations', patientCtrl.getAIRecommendations);

// Core Patient Management
router.post('/create', patientCtrl.createPatient); // Deprecated/Restricted
router.get('/list', patientCtrl.listPatients); // For doctors
router.get('/:id', patientCtrl.getPatient);
router.post('/update/:id', patientCtrl.updatePatient);
router.post('/delete/:id', patientCtrl.deletePatient);

// Medication/Suggestions
router.post('/suggest-update', patientCtrl.suggestMedication);
router.post('/update-medication', patientCtrl.updateMedication);

module.exports = router;