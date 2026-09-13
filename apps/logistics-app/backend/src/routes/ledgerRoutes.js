/**
 * Double-Entry Financial Ledger & Payout Routes
 */
const express = require('express');
const router = express.Router();
const controller = require('../controllers/advancedLogisticsController');

// 1. Get Financial Ledger Summary & Recent Transactions
router.get('/summary', controller.getLedgerSummary);

// 2. Request Payout Withdrawal
router.post('/payout-request', controller.requestPayout);

// 3. Record Delivery Financial Settlement (Double-Entry)
router.post('/record-delivery', controller.recordDeliverySettlement);

module.exports = router;
