// routes/analytics.routes.js
const express = require('express');
const { getDashboard } = require('../controllers/analytics.controller');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/dashboard', getDashboard);

module.exports = router;