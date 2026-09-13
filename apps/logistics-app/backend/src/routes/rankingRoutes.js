/**
 * Ranking & Leaderboard Routes
 */
const express = require('express');
const router = express.Router();

// GET /api/ranking/leaderboard
router.get('/leaderboard', (req, res) => {
  res.status(200).json({
    success: true,
    currentUser: {
      rank: 7,
      name: 'Rahul Singh',
      partnerId: 'MKP-10482',
      deliveries: 42,
      score: 94.8,
      earnings: 4860,
      tier: 'Gold Partner',
      tierProgress: 84,
    },
    leaderboard: [
      { id: 'MKP-1001', rank: 1, name: 'Vikram Mehta', deliveries: 78, earnings: 8420, score: 99.2, avatarInitials: 'VM', isTop: true },
      { id: 'MKP-1002', rank: 2, name: 'Ananya Roy', deliveries: 72, earnings: 7890, score: 98.4, avatarInitials: 'AR', isTop: true },
      { id: 'MKP-1003', rank: 3, name: 'Suresh Patel', deliveries: 68, earnings: 7450, score: 97.9, avatarInitials: 'SP', isTop: true },
      { id: 'MKP-1004', rank: 4, name: 'Manoj Tiwari', deliveries: 61, earnings: 6840, score: 96.5 },
      { id: 'MKP-1005', rank: 5, name: 'Priya Sharma', deliveries: 58, earnings: 6420, score: 96.1 },
      { id: 'MKP-1006', rank: 6, name: 'Deepak Verma', deliveries: 51, earnings: 5790, score: 95.3 },
      { id: 'MKP-10482', rank: 7, name: 'Rahul Singh', deliveries: 42, earnings: 4860, score: 94.8, isCurrentUser: true },
    ],
  });
});

// GET /api/ranking/daily-target
router.get('/daily-target', (req, res) => {
  res.status(200).json({
    success: true,
    completed: 18,
    target: 20,
    reward: 100,
    remaining: 2,
  });
});

module.exports = router;
