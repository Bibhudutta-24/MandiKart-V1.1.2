/**
 * Route Optimizer & Geofencing Engine
 * Optimizes multi-stop deliveries (TSP) and provides precision geofence arrival detection.
 */
const { calculateDistanceKm } = require('./dispatchEngine');

class RouteOptimizerService {
  /**
   * Optimize sequence of multiple delivery drops from a single pickup hub
   * Uses Nearest Neighbor heuristic for real-time fast calculation
   * @param {Object} pickup - { name, latitude, longitude }
   * @param {Array} drops - Array of { id, customerName, address, latitude, longitude }
   */
  optimizeMultiDropRoute(pickup, drops = []) {
    if (drops.length <= 1) {
      return {
        optimizedStops: drops,
        totalDistanceKm: drops.length === 1 ? calculateDistanceKm(pickup.latitude, pickup.longitude, drops[0].latitude, drops[0].longitude) : 0,
        estimatedTotalMinutes: drops.length === 1 ? 14 : 0,
      };
    }

    const unvisited = [...drops];
    const sequence = [];
    let currentPoint = pickup;
    let totalDistanceKm = 0;

    while (unvisited.length > 0) {
      let nearestIndex = 0;
      let shortestDistance = Infinity;

      for (let i = 0; i < unvisited.length; i++) {
        const dist = calculateDistanceKm(
          currentPoint.latitude,
          currentPoint.longitude,
          unvisited[i].latitude,
          unvisited[i].longitude
        );
        if (dist < shortestDistance) {
          shortestDistance = dist;
          nearestIndex = i;
        }
      }

      const nextStop = unvisited.splice(nearestIndex, 1)[0];
      totalDistanceKm += shortestDistance;
      sequence.push({
        ...nextStop,
        legDistanceKm: shortestDistance,
        legEtaMinutes: Math.max(4, Math.round(shortestDistance * 2.8)),
      });
      currentPoint = nextStop;
    }

    // Benchmark time based on 14 min average with multi-stops
    const estimatedTotalMinutes = Math.max(14, Math.round(totalDistanceKm * 2.8 + sequence.length * 3));

    return {
      pickupLocation: pickup,
      totalStops: sequence.length,
      optimizedStops: sequence,
      totalDistanceKm: parseFloat(totalDistanceKm.toFixed(2)),
      estimatedTotalMinutes,
    };
  }

  /**
   * Geofence verification: Check if driver is within radius (e.g. 75 meters) of customer
   * @param {number} driverLat
   * @param {number} driverLng
   * @param {number} targetLat
   * @param {number} targetLng
   * @param {number} radiusMeters (default: 75m)
   */
  isWithinGeofence(driverLat, driverLng, targetLat, targetLng, radiusMeters = 75) {
    const distanceKm = calculateDistanceKm(driverLat, driverLng, targetLat, targetLng);
    const distanceMeters = distanceKm * 1000;
    const isInside = distanceMeters <= radiusMeters;

    return {
      isInside,
      distanceMeters: Math.round(distanceMeters),
      geofenceThresholdMeters: radiusMeters,
      status: isInside ? 'INSIDE_GEOFENCE' : 'EN_ROUTE',
      message: isInside
        ? 'Driver has reached customer doorstep geofence.'
        : `Driver is ${Math.round(distanceMeters)}m away from customer.`,
    };
  }
}

module.exports = {
  routeOptimizer: new RouteOptimizerService(),
};
