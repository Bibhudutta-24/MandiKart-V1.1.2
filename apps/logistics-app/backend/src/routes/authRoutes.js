/**
 * Auth Routes
 */
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/send-login-otp', authController.sendLoginOtp);
router.post('/verify-login-otp', authController.verifyLoginOtp);
router.post('/send-register-otp', authController.sendRegisterOtp);
router.post('/verify-register-otp', authController.verifyRegisterOtp);
router.post('/register', authController.register);
router.post('/google', authController.googleAuth);
router.post('/logout', authController.logout);

module.exports = router;
