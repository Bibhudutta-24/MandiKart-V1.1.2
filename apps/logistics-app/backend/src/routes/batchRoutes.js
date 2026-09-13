/**
 * Multi-Order Batching & Pooling Routes
 */
const express = require('express');
const router = express.Router();
const controller = require('../controllers/advancedLogisticsController');

// 1. Group pending orders into optimal multi-drop batches
router.post('/pool-orders', controller.poolOrders);

// 2. Fetch sample pools
router.get('/available-pools', controller.poolOrders);

module.exports = router;
