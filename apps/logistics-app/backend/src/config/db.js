/**
 * Database & Persistence Configuration
 * Modular database layer supporting MongoDB, Firebase, and fast in-memory store.
 */
const fs = require('fs');
const path = require('path');

// In-memory collections
const store = {
  drivers: new Map(),
  deliveries: new Map(),
  otps: new Map(),
};

// Seed default demo driver for initial testing if needed
const seedInitialData = () => {
  const defaultDriverId = 'MKP-10482';
  store.drivers.set(defaultDriverId, {
    id: defaultDriverId,
    name: 'Rahul Singh',
    phone: '+919876543210',
    status: 'ONLINE',
    rating: 4.8,
    totalDeliveries: 342,
    todayStats: {
      deliveries: 19,
      earnings: 605,
      rating: 4.8,
      rank: 7,
    },
    vehicle: {
      type: 'Motorcycle with Cargo Rack',
      plateNumber: 'OD-02-AB-4821',
      capacityKg: '150 kg',
      status: 'ACTIVE',
    },
    bankDetails: {
      accountNumber: '918273645012',
      ifscCode: 'SBIN0001234',
      bankName: 'State Bank of India',
    },
  });

  // Seed active deliveries
  store.deliveries.set('DEL-8401', {
    id: 'DEL-8401',
    driverId: defaultDriverId,
    orderId: 'ORD-9021',
    customerName: 'Suresh Patra',
    customerPhone: '+91 94371 82910',
    deliveryAddress: 'Plot 412, Patia, Bhubaneswar',
    pickupAddress: 'Unit-1 Mandi Hub, Bhubaneswar',
    status: 'ASSIGNED', // ASSIGNED, PICKED_UP, IN_TRANSIT, DELIVERED
    itemsCount: 8,
    weightKg: 24,
    fare: 185,
    estimatedMinutes: 14,
  });
};

seedInitialData();

module.exports = {
  store,
};
