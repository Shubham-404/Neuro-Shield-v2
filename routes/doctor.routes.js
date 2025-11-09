// routes/doctor.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const doctorCtrl = require('../controllers/doctor.controller');

router.use(auth); // All doctor routes require authentication

router.get('/profile', doctorCtrl.getProfile);
router.post('/update', doctorCtrl.updateProfile);

module.exports = router;