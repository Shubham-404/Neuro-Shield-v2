// routes/doctor.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const doctorCtrl = require('../controllers/doctor.controller');

router.get('/profile', auth, doctorCtrl.getProfile);
router.post('/update', auth, doctorCtrl.updateProfile);

module.exports = router;