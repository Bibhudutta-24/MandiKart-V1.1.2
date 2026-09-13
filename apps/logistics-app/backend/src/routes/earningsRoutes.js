/**
 * Earnings & Payout Routes
 */
const express = require('express');
const router = express.Router();

// GET /api/earnings/summary
router.get('/summary', (req, res) => {
  res.status(200).json({
    success: true,
    summary: {
      currentMonth: {
        total: 4860,
        trips: 38,
        tips: 340,
        incentives: 520,
      },
      today: {
        total: 720,
        basePay: 480,
        surgeBonus: 120,
        tips: 120,
        trips: 18,
      },
      todaySummary: {
        totalEarnings: 720,
        deliveriesCompleted: 18,
        targetDeliveries: 20,
        distanceKm: 64.0,
        onlineTimeStr: '7h 20m',
        percentChange: 12,
      },
      availableBalance: 2860,
      weeklyTrend: [
        { day: 'Mon', fullDay: 'Monday', date: '04 Sep', amount: 540, trips: 6, hours: '6.5h', isToday: false },
        { day: 'Tue', fullDay: 'Tuesday', date: '05 Sep', amount: 680, trips: 8, hours: '7.2h', isToday: false },
        { day: 'Wed', fullDay: 'Wednesday', date: '06 Sep', amount: 490, trips: 5, hours: '5.5h', isToday: false },
        { day: 'Thu', fullDay: 'Thursday', date: '07 Sep', amount: 920, trips: 9, hours: '8.0h', isBest: true, isToday: true },
        { day: 'Fri', fullDay: 'Friday', date: '08 Sep', amount: 760, trips: 8, hours: '7.0h', isToday: false },
        { day: 'Sat', fullDay: 'Saturday', date: '09 Sep', amount: 650, trips: 7, hours: '6.2h', isToday: false },
        { day: 'Sun', fullDay: 'Sunday', date: '10 Sep', amount: 820, trips: 8, hours: '7.5h', isToday: false },
      ],
      recentTransactions: [
        { id: 'TXN-8902', type: 'Delivery Earning #DEL-01', amount: 95, time: '11:42 AM', status: 'credited' },
        { id: 'TXN-8891', type: 'Peak Morning Surge Bonus', amount: 40, time: '10:15 AM', status: 'credited' },
        { id: 'TXN-8840', type: 'Delivery Earning #DEL-03', amount: 85, time: '08:30 AM', status: 'credited' },
      ],
    },
  });
});

// GET /api/earnings/payouts
router.get('/payouts', (req, res) => {
  res.status(200).json({
    success: true,
    availableForWithdrawal: 2860,
    bankAccount: {
      bankName: 'State Bank of India',
      accountNumber: '•••• 4821',
      holderName: 'Rahul Singh',
      ifsc: 'SBIN0001234',
    },
    payouts: [
      { id: 'PAY-4820', amount: 2000, date: '2026-09-08T10:00:00Z', status: 'COMPLETED', method: 'Bank Transfer (SBI)', utr: 'UTR9812401824' },
      { id: 'PAY-4791', amount: 1500, date: '2026-09-01T14:30:00Z', status: 'COMPLETED', method: 'Bank Transfer (SBI)', utr: 'UTR8192049182' },
    ],
  });
});

// POST /api/earnings/payouts/request
router.post('/payouts/request', (req, res) => {
  const { amount } = req.body;
  const newRecord = {
    id: 'PAY-' + Date.now().toString().slice(-4),
    amount: amount || 500,
    date: new Date().toISOString(),
    status: 'PROCESSING',
    method: 'Bank Transfer (SBI •••• 4821)',
    utr: 'UTR' + Math.floor(1000000000 + Math.random() * 9000000000),
  };

  res.status(200).json({
    success: true,
    message: 'Payout request initiated successfully. Funds will reflect in 2-4 hours.',
    payout: newRecord,
  });
});

module.exports = router;
