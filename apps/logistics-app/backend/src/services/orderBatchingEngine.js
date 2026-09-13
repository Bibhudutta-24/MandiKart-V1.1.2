/**
 * Smart Multi-Order Batching & Pooling Engine
 * Groups multiple pending orders from a Mandi Hub into optimal consolidated batches.
 * Enforces vehicle capacity (weight & volume constraints) and optimizes multi-stop drops.
 */

// Vehicle Capacity Constraints
const VEHICLE_SPECS = {
  TWO_WHEELER: {
    name: '2-Wheeler / Motorcycle',
    maxWeightKg: 30,
    maxVolumeM3: 0.08,
    maxStops: 3,
    maxDetourRadiusKm: 2.5,
  },
  THREE_WHEELER: {
    name: '3-Wheeler / Auto Cargo',
    maxWeightKg: 200,
    maxVolumeM3: 0.45,
    maxStops: 5,
    maxDetourRadiusKm: 4.0,
  },
  MINI_TRUCK: {
    name: 'Mini-Truck / Tata Ace',
    maxWeightKg: 600,
    maxVolumeM3: 1.5,
    maxStops: 8,
    maxDetourRadiusKm: 6.0,
  },
};

/**
 * Haversine Great-Circle Distance (km)
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
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

/**
 * Bearing from Origin to Destination (degrees 0-360)
 */
function calculateBearing(lat1, lon1, lat2, lon2) {
  const y = Math.sin(((lon2 - lon1) * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.cos(((lon2 - lon1) * Math.PI) / 180);
  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360;
}

class OrderBatchingEngine {
  /**
   * Group pending orders into optimal batches for a specific vehicle type
   */
  createBatches(mandiHub, pendingOrders = [], vehicleType = 'THREE_WHEELER') {
    const specs = VEHICLE_SPECS[vehicleType] || VEHICLE_SPECS.THREE_WHEELER;
    if (!pendingOrders.length) {
      return { success: true, batchesCount: 0, batches: [] };
    }

    // Step 1: Calculate distance and bearing from Mandi Hub for each order
    const enrichedOrders = pendingOrders.map((order) => {
      const distFromHub = haversineDistance(
        mandiHub.lat,
        mandiHub.lng,
        order.dropLat,
        order.dropLng
      );
      const bearing = calculateBearing(
        mandiHub.lat,
        mandiHub.lng,
        order.dropLat,
        order.dropLng
      );
      return {
        ...order,
        distFromHub,
        bearing,
        weightKg: order.weightKg || 10,
        volumeM3: order.volumeM3 || 0.02,
        baseFare: order.baseFare || 65,
      };
    });

    // Step 2: Sort orders by bearing to cluster radially
    enrichedOrders.sort((a, b) => a.bearing - b.bearing);

    const batches = [];
    const usedOrderIds = new Set();

    for (let i = 0; i < enrichedOrders.length; i++) {
      const seedOrder = enrichedOrders[i];
      if (usedOrderIds.has(seedOrder.id)) continue;

      const currentBatch = [seedOrder];
      usedOrderIds.add(seedOrder.id);
      let currentWeight = seedOrder.weightKg;
      let currentVolume = seedOrder.volumeM3;

      // Find compatible nearby orders
      for (let j = 0; j < enrichedOrders.length; j++) {
        if (i === j) continue;
        const candidate = enrichedOrders[j];
        if (usedOrderIds.has(candidate.id)) continue;

        // Check if candidate exceeds vehicle constraints
        if (currentBatch.length >= specs.maxStops) break;
        if (currentWeight + candidate.weightKg > specs.maxWeightKg) continue;
        if (currentVolume + candidate.volumeM3 > specs.maxVolumeM3) continue;

        // Check proximity to existing batch items
        const isNearby = currentBatch.some(
          (item) =>
            haversineDistance(item.dropLat, item.dropLng, candidate.dropLat, candidate.dropLng) <=
            specs.maxDetourRadiusKm
        );

        if (isNearby) {
          currentBatch.push(candidate);
          usedOrderIds.add(candidate.id);
          currentWeight += candidate.weightKg;
          currentVolume += candidate.volumeM3;
        }
      }

      // Step 3: Optimize delivery sequence (TSP nearest-neighbor)
      const sequencedStops = this._optimizeSequence(mandiHub, currentBatch);

      // Step 4: Calculate pooled economics
      const totalDistanceKm = this._calculateRouteDistance(mandiHub, sequencedStops);
      const totalIndividualFares = currentBatch.reduce((sum, o) => sum + o.baseFare, 0);

      // Pooled driver earnings = Base Fare + distance fare + 25% pooling incentive bonus
      const poolingBonus = Math.round(totalIndividualFares * 0.25);
      const driverEarnings = totalIndividualFares + poolingBonus;

      batches.push({
        batchId: `BATCH-${Date.now().toString().slice(-4)}-${batches.length + 1}`,
        vehicleType,
        vehicleName: specs.name,
        ordersCount: currentBatch.length,
        totalWeightKg: parseFloat(currentWeight.toFixed(1)),
        totalVolumeM3: parseFloat(currentVolume.toFixed(3)),
        capacityUtilizationPct: Math.round((currentWeight / specs.maxWeightKg) * 100),
        mandiOrigin: {
          name: mandiHub.name || 'Mandi Central Hub',
          lat: mandiHub.lat,
          lng: mandiHub.lng,
        },
        stopsSequence: sequencedStops,
        totalDistanceKm,
        estDurationMinutes: Math.round((totalDistanceKm / 28) * 60 + currentBatch.length * 6),
        financials: {
          totalIndividualFares,
          poolingIncentiveBonus: poolingBonus,
          totalDriverPayout: driverEarnings,
          driverExtraEarningsPct: 25,
        },
        status: 'READY_FOR_DISPATCH',
      });
    }

    return {
      success: true,
      batchesCount: batches.length,
      unbatchedCount: pendingOrders.length - usedOrderIds.size,
      batches,
    };
  }

  /**
   * Nearest-Neighbor TSP sequence starting from Mandi Hub
   */
  _optimizeSequence(origin, orders) {
    const remaining = [...orders];
    const sequence = [];
    let currentPos = { lat: origin.lat, lng: origin.lng };

    while (remaining.length > 0) {
      let nearestIdx = 0;
      let minDistance = Infinity;

      for (let i = 0; i < remaining.length; i++) {
        const dist = haversineDistance(
          currentPos.lat,
          currentPos.lng,
          remaining[i].dropLat,
          remaining[i].dropLng
        );
        if (dist < minDistance) {
          minDistance = dist;
          nearestIdx = i;
        }
      }

      const nextStop = remaining.splice(nearestIdx, 1)[0];
      sequence.push({
        stopNumber: sequence.length + 1,
        orderId: nextStop.id,
        customerName: nextStop.customerName,
        dropAddress: nextStop.dropAddress,
        lat: nextStop.dropLat,
        lng: nextStop.dropLng,
        weightKg: nextStop.weightKg,
        produceType: nextStop.produceType,
        distanceFromPrevKm: minDistance,
      });

      currentPos = { lat: nextStop.dropLat, lng: nextStop.dropLng };
    }

    return sequence;
  }

  /**
   * Calculate total chain distance for multi-stop batch
   */
  _calculateRouteDistance(origin, sequence) {
    if (!sequence.length) return 0;
    let dist = haversineDistance(origin.lat, origin.lng, sequence[0].lat, sequence[0].lng);
    for (let i = 0; i < sequence.length - 1; i++) {
      dist += haversineDistance(
        sequence[i].lat,
        sequence[i].lng,
        sequence[i + 1].lat,
        sequence[i + 1].lng
      );
    }
    return parseFloat(dist.toFixed(2));
  }
}

module.exports = new OrderBatchingEngine();
