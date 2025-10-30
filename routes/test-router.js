const express = require("express");

const testRouter = express.Router()

const { testController } = require('../controllers/test-controller');
const { sendVerifyOtp } = require("../controllers/auth-controllers");

if (process.env.NODE_ENV === "development") {
    testRouter.post('/', testController)
    testRouter.post('/sendotp', sendVerifyOtp)
}

module.exports = testRouter