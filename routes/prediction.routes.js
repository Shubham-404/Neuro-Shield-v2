// routes/prediction.routes.js
const express = require('express');
const { runPrediction, getPredictionHistory } = require('../controllers/prediction.controller');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

router.use(authMiddleware);

router.post('/', runPrediction);
router.get('/patient/:patient_id', getPredictionHistory);

module.exports = router;