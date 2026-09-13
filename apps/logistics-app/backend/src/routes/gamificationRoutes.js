/**
 * Gamification, Milestone Bonuses & Tier Progression Routes
 */
const express = require('express');
const router = express.Router();
const controller = require('../controllers/advancedLogisticsController');

// 1. Get Daily Milestone Progress
router.get('/milestones', controller.getDailyMilestones);

// 2. Record Completed Trip
router.post('/record-trip', controller.recordTrip);

// 3. Get Driver Tier & Perks Progression
router.get('/tier-status', controller.getTierStatus);

module.exports = router;
