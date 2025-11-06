const express = require('express');

const aiRouter = express.Router();

aiRouter.post('/create', createHisab)

module.exports = aiRouter;