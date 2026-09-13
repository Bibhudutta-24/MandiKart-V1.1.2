/**
 * Logistics Routes
 */
const express = require('express');
const router = express.Router();
const logisticsController = require('../controllers/logisticsController');
const { authenticateDriver } = require('../middlewares/authMiddleware');

// 1. Dispatch & Driver Matching
router.post('/dispatch/find-drivers', logisticsController.findEligibleDrivers);
router.post('/dispatch/assign', logisticsController.assignOrder);

// 2. Dynamic Fare & Incentives
router.post('/fare/quote', logisticsController.getFareQuote);
router.get('/incentives/daily', authenticateDriver, logisticsController.getDailyIncentives);

// 3. Multi-Stop Route Optimization & Geofencing
router.post('/route/optimize', logisticsController.optimizeRoute);
router.post('/geofence/check-arrival', logisticsController.checkArrivalGeofence);

// 4. Secure POD Handover Verification
router.post('/pod/verify-handover', authenticateDriver, logisticsController.verifyHandoverPOD);

module.exports = router;
