/**
 * Isolated Mock Notifications Dataset
 */

export const mockNotifications = [
  {
    id: 'NOTIF-1',
    category: 'DELIVERIES', // 'ALL' | 'DELIVERIES' | 'EARNINGS' | 'RANKING' | 'SYSTEM'
    timeGroup: 'TODAY',
    title: 'New delivery available',
    description: 'Fresh Vegetables — 80kg from Green Valley Farm to Patia Market.',
    timeAgo: '10 min ago',
    unread: true,
    distanceKm: '5.2 km',
    earningBadge: '₹75',
    targetRoute: 'Deliveries',
  },
  {
    id: 'NOTIF-2',
    category: 'RANKING',
    timeGroup: 'TODAY',
    title: "You moved up in today's ranking",
    description: 'Great job! You moved from Rank #8 to Rank #7.',
    timeAgo: '35 min ago',
    unread: true,
    highlight: "Today's earnings: ₹605",
    targetRoute: 'Ranking',
  },
  {
    id: 'NOTIF-3',
    category: 'EARNINGS',
    timeGroup: 'TODAY',
    title: '₹95 added to your earnings',
    description: 'Your delivery #MK10284 was completed successfully.',
    timeAgo: '1 hour ago',
    unread: false,
    breakdownNote: 'Base ₹75 • Incentives ₹20',
    targetRoute: 'Earnings',
  },
  {
    id: 'NOTIF-4',
    category: 'DELIVERIES',
    timeGroup: 'YESTERDAY',
    title: 'Smart Route Bonus earned',
    description: 'You earned an additional ₹10 by completing a smart route.',
    timeAgo: 'Yesterday 7:42 PM',
    unread: false,
    highlight: '₹10 Bonus',
    targetRoute: 'Earnings',
  },
  {
    id: 'NOTIF-5',
    category: 'SYSTEM',
    timeGroup: 'YESTERDAY',
    title: 'Delivery target completed',
    description: 'You completed your daily target of 20 deliveries.',
    timeAgo: 'Yesterday 6:18 PM',
    unread: false,
    targetRoute: 'Deliveries',
  },
  {
    id: 'NOTIF-6',
    category: 'EARNINGS',
    timeGroup: 'YESTERDAY',
    title: 'Payout processed',
    description: 'Your previous payout of ₹2,000 was successfully processed to your SBI bank account.',
    timeAgo: 'Yesterday 4:30 PM',
    unread: false,
    targetRoute: 'PayoutHistory',
  },
  {
    id: 'NOTIF-7',
    category: 'SYSTEM',
    timeGroup: 'EARLIER',
    title: 'Profile verification completed',
    description: 'Your partner account verification was successfully completed. You are authorized for commercial transport.',
    timeAgo: 'Oct 12',
    unread: false,
    targetRoute: 'Profile',
  },
];

export default mockNotifications;
