/**
 * Delivery Exception & Emergency SOS Routes
 */
const express = require('express');
const router = express.Router();
const controller = require('../controllers/advancedLogisticsController');

// 1. Trigger Breakdown SOS
router.post('/sos', controller.triggerSOS);

// 2. Verify Custody Transfer PIN
router.post('/custody-transfer', controller.verifyCustodyTransfer);

// 3. Initiate Buyer Unreachable 5-minute wait
router.post('/buyer-wait', controller.initiateBuyerWait);

// 4. Confirm Return to Mandi
router.post('/return-to-mandi', controller.confirmReturnToMandi);

// 5. List Active Exceptions
router.get('/active', controller.getActiveExceptions);

module.exports = router;
