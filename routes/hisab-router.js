const express = require('express');
const { createHisab, deleteHisab, editHisab } = require('../controllers/hisab-controller');

const hisabRouter = express.Router();

hisabRouter.post('/create', createHisab)
hisabRouter.post('/edit', editHisab)
hisabRouter.post('/delete', deleteHisab)

module.exports = hisabRouter