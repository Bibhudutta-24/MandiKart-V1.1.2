/**
 * Dispatch & Driver Matching Engine
 * Matches orders from Mandi Hubs to optimal nearby online delivery partners.
 */
const { store } = require('../config/db');

// Vehicle capacity thresholds in Kilograms
const VEHICLE_CAPACITY = {
  'Motorcycle with Cargo Rack': 30,
  'Electric Cargo 2-Wheeler': 35,
  'Three Wheeler (Auto / Piaggio)': 200,
  'Mini Truck (Tata Ace / Pickup)': 600,
};

/**
 * Calculate distance between two lat/lng points using Haversine formula (in KM)
 */
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}

class DispatchEngine {
  /**
   * Find best available drivers for an incoming order
   * @param {Object} orderDetails - pickupLocation, weightKg, orderId, maxDistanceKm
   */
  findEligibleDrivers(orderDetails) {
    const { pickupLat, pickupLng, weightKg = 10, maxDistanceKm = 10 } = orderDetails;
    const onlineDrivers = Array.from(store.drivers.values()).filter(
      (driver) => driver.status === 'ONLINE'
    );

    const scoredDrivers = [];

    for (const driver of onlineDrivers) {
      // 1. Check vehicle capacity
      const vehicleType = driver.vehicle?.type || 'Motorcycle with Cargo Rack';
      const maxWeight = VEHICLE_CAPACITY[vehicleType] || 30;
      if (weightKg > maxWeight) {
        continue; // Vehicle cannot carry this heavy produce
      }

      // 2. Check driver proximity (default driver location or Bhubaneswar hub fallback)
      const driverLat = driver.currentLocation?.latitude || 20.2961;
      const driverLng = driver.currentLocation?.longitude || 85.8245;
      const distanceToPickup = calculateDistanceKm(pickupLat, pickupLng, driverLat, driverLng);

      if (distanceToPickup > maxDistanceKm) {
        continue; // Too far from pickup point
      }

      // 3. Calculate smart suitability score (Higher is better)
      // Score factors: Proximity (50%), Rating (30%), Total Experience (20%)
      const proximityScore = Math.max(0, 10 - distanceToPickup) * 5; // 0-50
      const ratingScore = (driver.rating || 4.5) * 6; // 0-30
      const experienceScore = Math.min(20, (driver.totalDeliveries || 0) / 10); // 0-20

      const totalScore = parseFloat((proximityScore + ratingScore + experienceScore).toFixed(1));

      scoredDrivers.push({
        driverId: driver.id,
        name: driver.name,
        phone: driver.phone,
        vehicleType,
        rating: driver.rating,
        distanceKm: distanceToPickup,
        estimatedTimeToPickupMin: Math.max(3, Math.round(distanceToPickup * 2.5)),
        suitabilityScore: totalScore,
      });
    }

    // Sort by best score first
    return scoredDrivers.sort((a, b) => b.suitabilityScore - a.suitabilityScore);
  }

  /**
   * Assign order to driver with 30-second accept countdown
   */
  assignOrderToDriver(orderId, driverId) {
    const order = store.deliveries.get(orderId);
    if (!order) throw new Error('Order not found.');

    const driver = store.drivers.get(driverId);
    if (!driver) throw new Error('Driver not found.');

    order.status = 'OFFERED';
    order.assignedDriverId = driverId;
    order.offeredAt = Date.now();
    order.expiresAt = Date.now() + 30 * 1000; // 30-second window

    store.deliveries.set(orderId, order);

    return {
      success: true,
      orderId,
      driverId,
      expiresInSeconds: 30,
      message: `Order offered to ${driver.name} with 30s accept timer.`,
    };
  }

  /**
   * Batch multiple nearby orders going to the same area (Multi-Drop)
   */
  batchOrdersForArea(areaName) {
    const pendingOrders = Array.from(store.deliveries.values()).filter(
      (o) => o.status === 'ASSIGNED' || o.status === 'PENDING'
    );

    const matchedBatch = pendingOrders.filter((o) =>
      (o.deliveryAddress || '').toLowerCase().includes(areaName.toLowerCase())
    );

    const totalWeight = matchedBatch.reduce((sum, o) => sum + (o.weightKg || 0), 0);
    const totalFare = matchedBatch.reduce((sum, o) => sum + (o.fare || 0), 0);

    return {
      area: areaName,
      batchSize: matchedBatch.length,
      orders: matchedBatch,
      totalWeightKg: totalWeight,
      combinedFare: totalFare,
    };
  }
}

module.exports = {
  dispatchEngine: new DispatchEngine(),
  calculateDistanceKm,
  VEHICLE_CAPACITY,
};
