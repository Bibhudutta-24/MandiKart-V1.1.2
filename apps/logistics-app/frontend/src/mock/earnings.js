/**
 * Isolated Mock Earnings & Payouts Dataset
 * Aligned with Stitch UI/UX screens
 */

export const mockEarnings = {
  monthSummary: {
    totalEarnings: 4860,
    monthName: 'This Month',
    percentChange: 14.5,
    deliveriesCompleted: 87,
  },
  todaySummary: {
    totalEarnings: 720,
    deliveriesCompleted: 18,
    targetDeliveries: 20,
    distanceKm: 64.0,
    onlineTimeStr: '7h 20m',
    onTimeRate: '96%',
    rating: '4.8',
    percentChange: 12,
  },
  availableBalance: 2860,
  minPayoutAmount: 500,
  isPayoutEligible: true,
  autoPayoutEnabled: true,
  verifiedBankAccount: {
    bankName: 'State Bank of India',
    accountMasked: '•••• 4821',
    holderName: 'Rahul Singh',
    ifsc: 'SBIN0001234',
    isVerified: true,
  },
  breakdown: {
    baseFare: 480,
    distanceFare: 65,
    smartRouteBonus: 55,
    performanceBonus: 120,
    total: 720,
  },
  weeklyTrend: [
    { day: 'Mon', fullDay: 'Monday', date: '04 Sep', heightPercent: 55, amount: 540, trips: 6, hours: '6.5h', isToday: false },
    { day: 'Tue', fullDay: 'Tuesday', date: '05 Sep', heightPercent: 70, amount: 680, trips: 8, hours: '7.2h', isToday: false },
    { day: 'Wed', fullDay: 'Wednesday', date: '06 Sep', heightPercent: 50, amount: 490, trips: 5, hours: '5.5h', isToday: false },
    { day: 'Thu', fullDay: 'Thursday', date: '07 Sep', heightPercent: 95, amount: 920, trips: 9, hours: '8.0h', isBest: true, isToday: true },
    { day: 'Fri', fullDay: 'Friday', date: '08 Sep', heightPercent: 78, amount: 760, trips: 8, hours: '7.0h', isToday: false },
    { day: 'Sat', fullDay: 'Saturday', date: '09 Sep', heightPercent: 65, amount: 650, trips: 7, hours: '6.2h', isToday: false },
    { day: 'Sun', fullDay: 'Sunday', date: '10 Sep', heightPercent: 82, amount: 820, trips: 8, hours: '7.5h', isToday: false },
  ],
  dailyBonus: {
    current: 19,
    target: 20,
    percent: 95,
    bonusAmount: 100,
    message: 'Complete 1 more delivery to unlock ₹100 bonus',
  },
  paymentStats: {
    thisMonth: 4860,
    thisWeek: 3245,
    totalEarned: 28450,
    totalPaidOut: 25590,
  },
  recentTransactions: [
    {
      id: 'TXN-10284',
      orderId: 'MK10284',
      title: '#MK10284',
      time: 'Today, 2:15 PM',
      amount: 95,
      type: 'DELIVERY_EARNING',
      status: 'COMPLETED',
    },
    {
      id: 'TXN-10271',
      orderId: 'MK10271',
      title: '#MK10271',
      time: 'Today, 1:30 PM',
      amount: 110,
      type: 'DELIVERY_EARNING',
      status: 'COMPLETED',
    },
    {
      id: 'TXN-10265',
      orderId: 'MK10265',
      title: '#MK10265',
      time: 'Today, 12:45 PM',
      amount: 75,
      type: 'DELIVERY_EARNING',
      status: 'COMPLETED',
    },
  ],
  payoutHistory: [
    {
      id: 'MKP-PAY-030926',
      amount: 2860,
      date: 'Today',
      status: 'PROCESSING', // PROCESSING | COMPLETED | FAILED
      method: 'Bank Transfer (SBI •••• 4821)',
    },
    {
      id: 'MKP-PAY-280826',
      amount: 2000,
      date: '28 Aug 2026',
      status: 'COMPLETED',
      method: 'Bank Transfer (SBI •••• 4821)',
    },
    {
      id: 'MKP-PAY-200826',
      amount: 3500,
      date: '20 Aug 2026',
      status: 'COMPLETED',
      method: 'Bank Transfer (SBI •••• 4821)',
    },
    {
      id: 'MKP-PAY-120826',
      amount: 1800,
      date: '12 Aug 2026',
      status: 'COMPLETED',
      method: 'Bank Transfer (SBI •••• 4821)',
    },
    {
      id: 'MKP-PAY-050826',
      amount: 2200,
      date: '05 Aug 2026',
      status: 'COMPLETED',
      method: 'Bank Transfer (SBI •••• 4821)',
    },
  ],
};

export default mockEarnings;
