/**
 * Master Router Index
 */
const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const driverRoutes = require('./driverRoutes');
const deliveryRoutes = require('./deliveryRoutes');
const logisticsRoutes = require('./logisticsRoutes');
const earningsRoutes = require('./earningsRoutes');
const rankingRoutes = require('./rankingRoutes');
const batchRoutes = require('./batchRoutes');
const exceptionRoutes = require('./exceptionRoutes');
const gamificationRoutes = require('./gamificationRoutes');
const ledgerRoutes = require('./ledgerRoutes');

router.use('/auth', authRoutes);
router.use('/driver', driverRoutes);
router.use('/deliveries', deliveryRoutes);
router.use('/logistics', logisticsRoutes);
router.use('/earnings', earningsRoutes);
router.use('/ranking', rankingRoutes);
router.use('/logistics/batch', batchRoutes);
router.use('/logistics/exceptions', exceptionRoutes);
router.use('/logistics/gamification', gamificationRoutes);
router.use('/logistics/ledger', ledgerRoutes);

// Health Check Endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'MandiKart Logistics API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
