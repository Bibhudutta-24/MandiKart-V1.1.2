/**
 * Centralized API Endpoints Configuration
 * Synchronized with MandiKart backend REST API (/api/*)
 */
export const API_ENDPOINTS = {
  // Authentication & Partner Onboarding
  sendLoginOtp: '/auth/send-login-otp',
  verifyLoginOtp: '/auth/verify-login-otp',
  sendRegisterOtp: '/auth/send-register-otp',
  verifyRegisterOtp: '/auth/verify-register-otp',
  register: '/auth/register',
  googleAuth: '/auth/google',
  logout: '/auth/logout',

  // Driver Profile & Status
  profile: '/driver/profile',
  driverProfile: '/driver/profile',
  updateProfile: '/driver/profile',
  updateDriverProfile: '/driver/profile',
  updatePreferences: '/driver/preferences',
  updateDriverStatus: '/driver/status',
  toggleOnlineStatus: '/driver/status',

  // Deliveries & Active Workflow
  deliveries: '/deliveries/assigned',
  deliveryDetails: (id) => `/deliveries/${id}`,
  acceptDelivery: (id) => `/deliveries/${id}/accept`,
  rejectDelivery: (id) => `/deliveries/${id}/reject`,
  updateDeliveryStatus: (id) => `/deliveries/${id}/status`,
  submitPod: (id) => `/deliveries/${id}/pod`,
  reportException: (id) => `/deliveries/${id}/exception`,
  smartRouteMatch: '/deliveries/smart-route-match',

  // Earnings & Financial Payouts
  earnings: '/earnings/summary',
  payoutHistory: '/earnings/payouts',
  requestPayout: '/earnings/payouts/request',

  // Driver Rankings & Leaderboard
  ranking: '/ranking/leaderboard',
  leaderboard: '/ranking/leaderboard',
  dailyTarget: '/ranking/daily-target',

  // Notifications
  notifications: '/notifications',
  markNotificationRead: (id) => `/notifications/${id}/read`,
  markAllNotificationsRead: '/notifications/read-all',

  // Smart Logistics & Route Intelligence
  findEligibleDrivers: '/logistics/dispatch/find-drivers',
  assignOrder: '/logistics/dispatch/assign',
  fareQuote: '/logistics/fare/quote',
  dailyIncentives: '/logistics/incentives/daily',
  optimizeRoute: '/logistics/route/optimize',
  checkArrivalGeofence: '/logistics/geofence/check-arrival',
  verifyHandoverPod: '/logistics/pod/verify-handover',

  // Order Batching & Pooling
  poolOrders: '/logistics/batch/pool-orders',
  availablePools: '/logistics/batch/available-pools',

  // Exception Handling & Emergency SOS
  triggerBreakdownSOS: '/logistics/exceptions/sos',
  verifyCustodyTransfer: '/logistics/exceptions/custody-transfer',
  initiateBuyerWait: '/logistics/exceptions/buyer-wait',
  confirmReturnToMandi: '/logistics/exceptions/return-to-mandi',
  activeExceptions: '/logistics/exceptions/active',

  // Gamification & Milestones
  dailyMilestones: '/logistics/gamification/milestones',
  recordTripGamification: '/logistics/gamification/record-trip',
  driverTierStatus: '/logistics/gamification/tier-status',

  // Double-Entry Financial Ledger
  ledgerSummary: '/logistics/ledger/summary',
  payoutRequestLedger: '/logistics/ledger/payout-request',
  recordDeliverySettlement: '/logistics/ledger/record-delivery',

  // System Health
  health: '/health',
};

export default API_ENDPOINTS;

