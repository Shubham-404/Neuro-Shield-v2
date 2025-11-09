// routes/patient.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const patientCtrl = require('../controllers/patient.controller');

router.use(auth); // All patient routes require authentication

router.post('/create', patientCtrl.createPatient);
router.get('/list', patientCtrl.listPatients);
router.post('/suggest-update', patientCtrl.suggestMedication);
router.post('/update-medication', patientCtrl.updateMedication);
router.post('/update/:id', patientCtrl.updatePatient);
router.post('/delete/:id', patientCtrl.deletePatient);
router.get('/:id', patientCtrl.getPatient);

module.exports = router;