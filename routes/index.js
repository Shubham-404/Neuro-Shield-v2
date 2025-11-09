// routes/index.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const userCtrl = require('../controllers/user.controller');
const doctorRoutes = require('./doctor.routes');
const patientRoutes = require('./patient.routes');

router.post('/signup833', userCtrl.signup);
router.post('/login', userCtrl.login);
router.get('/logout', userCtrl.logout);
router.get('/dashboard', auth, userCtrl.dashboard);

router.use('/doctor', doctorRoutes);
router.use('/patient', patientRoutes);

router.get('/healthz', (req, res) => res.json({ success: true, status: 'ok' }));

module.exports = router;