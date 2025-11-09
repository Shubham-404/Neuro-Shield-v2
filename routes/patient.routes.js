// routes/patient.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const patientCtrl = require('../controllers/patient.controller');

router.use(auth); // All patient routes require authentication

router.post('/create', patientCtrl.createPatient);
router.get('/list', patientCtrl.listPatients);
router.get('/:id', patientCtrl.getPatient);
router.post('/suggest-update', patientCtrl.suggestMedication);
router.post('/update-medication', patientCtrl.updateMedication);
router.post('/delete/:id', patientCtrl.deletePatient);

module.exports = router;