/**
 * Delivery Routes
 */
const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const { authenticateDriver } = require('../middlewares/authMiddleware');

router.get('/assigned', authenticateDriver, deliveryController.getAssignedDeliveries);
router.put('/:id/status', authenticateDriver, deliveryController.updateDeliveryStatus);
router.post('/:id/pod', authenticateDriver, deliveryController.submitPOD);

module.exports = router;
