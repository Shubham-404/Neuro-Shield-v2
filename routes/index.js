// routes/index.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const userCtrl = require('../controllers/user.controller');
const doctorRoutes = require('./doctor.routes');
const patientRoutes = require('./patient.routes');
const predictionRoutes = require('./prediction.routes');
const analyticsRoutes = require('./analytics.routes');
const patientFeaturesRoutes = require('./patientFeatures.routes');

// Public routes
router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);
router.get('/logout', userCtrl.logout);
router.get('/dashboard', auth, userCtrl.dashboard);

// Protected routes
router.use('/doctor', doctorRoutes);
router.use('/patient', patientRoutes);
router.use('/predict', predictionRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/patient-features', patientFeaturesRoutes);

router.get('/healthz', (req, res) => res.json({ success: true, status: 'ok' }));

module.exports = router;