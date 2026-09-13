/**
 * Isolated Mock Partner Profile Dataset
 */

export const mockProfile = {
  id: 'MKP-10482',
  name: 'Rahul Singh',
  avatarInitials: 'RS',
  role: 'Delivery Partner',
  status: 'ONLINE',
  phone: '+91 98765 43210',
  email: 'rahul.partner@mandikart.com',
  city: 'Bhubaneswar',
  preferredAreas: ['Patia', 'Rasulgarh', 'Chandrasekharpur'],
  rating: 4.8,
  totalDeliveries: 342,
  todayStats: {
    deliveries: 19,
    earnings: 605,
    rating: 4.8,
    rank: 7,
    rankDelta: 1,
  },
  verificationChecklist: [
    { id: 'v1', label: 'Identity Verification (Aadhaar/PAN)', status: 'VERIFIED', icon: 'badge' },
    { id: 'v2', label: 'Mobile Number Verification', status: 'VERIFIED', icon: 'smartphone' },
    { id: 'v3', label: 'Vehicle Commercial Verification', status: 'VERIFIED', icon: 'two-wheeler' },
    { id: 'v4', label: 'Bank / Direct Payout Setup', status: 'COMPLETED', icon: 'account-balance' },
  ],
  vehicle: {
    type: 'Motorcycle with Cargo Rack',
    plateNumber: 'OD-02-AB-4821',
    capacityKg: '150 kg',
    status: 'ACTIVE',
    insuranceValidUntil: '31 Dec 2026',
  },
  preferences: {
    acceptNearbyDeliveries: true,
    smartRouteSuggestions: true,
    deliveryNotifications: true,
    soundAlerts: true,
  },
};

export default mockProfile;
