/**
 * Driver Routes
 */
const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');
const { authenticateDriver } = require('../middlewares/authMiddleware');

router.get('/profile', authenticateDriver, driverController.getProfile);
router.put('/profile', authenticateDriver, driverController.updateProfile);
router.put('/status', authenticateDriver, driverController.updateStatus);

module.exports = router;
