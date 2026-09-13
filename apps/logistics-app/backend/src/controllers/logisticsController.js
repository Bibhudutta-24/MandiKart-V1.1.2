/**
 * Logistics Controller
 * Orchestrates driver dispatching, dynamic fare calculation, route optimization,
 * geofence auto-arrival, and POD handover verification.
 */
const { dispatchEngine } = require('../services/dispatchEngine');
const { fareCalculator } = require('../services/fareCalculatorService');
const { routeOptimizer } = require('../services/routeOptimizerService');
const { podVerification } = require('../services/podVerificationService');
const { store } = require('../config/db');

const logisticsController = {
  /**
   * POST /api/logistics/dispatch/find-drivers
   * Match available nearby online drivers for an order
   */
  async findEligibleDrivers(req, res, next) {
    try {
      const { pickupLat, pickupLng, weightKg, maxDistanceKm } = req.body;
      if (!pickupLat || !pickupLng) {
        return res.status(400).json({
          success: false,
          message: 'Pickup latitude and longitude are required.',
        });
      }

      const drivers = dispatchEngine.findEligibleDrivers({
        pickupLat: parseFloat(pickupLat),
        pickupLng: parseFloat(pickupLng),
        weightKg: parseFloat(weightKg) || 10,
        maxDistanceKm: parseFloat(maxDistanceKm) || 12,
      });

      return res.status(200).json({
        success: true,
        count: drivers.length,
        eligibleDrivers: drivers,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/logistics/dispatch/assign
   * Assign an order to a driver with 30s countdown
   */
  async assignOrder(req, res, next) {
    try {
      const { orderId, driverId } = req.body;
      if (!orderId || !driverId) {
        return res.status(400).json({ success: false, message: 'orderId and driverId are required.' });
      }

      const result = dispatchEngine.assignOrderToDriver(orderId, driverId);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/logistics/fare/quote
   * Calculate precise delivery fare and driver payout breakdown
   */
  async getFareQuote(req, res, next) {
    try {
      const { distanceKm, weightKg, vehicleType, isPeakHour, isRainSurge } = req.body;

      const quote = fareCalculator.calculateDeliveryFare({
        distanceKm: parseFloat(distanceKm) || 4.2,
        weightKg: parseFloat(weightKg) || 10,
        vehicleType: vehicleType || 'Motorcycle with Cargo Rack',
        isPeakHour: Boolean(isPeakHour),
        isRainSurge: Boolean(isRainSurge),
      });

      return res.status(200).json({
        success: true,
        fareQuote: quote,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/logistics/incentives/daily
   * Fetch daily milestone bonuses for the authenticated driver
   */
  async getDailyIncentives(req, res, next) {
    try {
      const driver = req.driver || store.drivers.get('MKP-10482');
      const completedCount = driver?.todayStats?.deliveries || 0;

      const incentives = fareCalculator.calculateDailyBonus(completedCount);
      return res.status(200).json({
        success: true,
        driverId: driver?.id,
        incentives,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/logistics/route/optimize
   * Optimize sequence of multi-stop deliveries with 14-min ETA calculation
   */
  async optimizeRoute(req, res, next) {
    try {
      const { pickupLocation, dropLocations } = req.body;
      if (!pickupLocation || !Array.isArray(dropLocations)) {
        return res.status(400).json({
          success: false,
          message: 'pickupLocation and dropLocations array are required.',
        });
      }

      const routePlan = routeOptimizer.optimizeMultiDropRoute(pickupLocation, dropLocations);
      return res.status(200).json({
        success: true,
        routePlan,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/logistics/geofence/check-arrival
   * Check if driver is within customer arrival geofence (e.g. 75m)
   */
  async checkArrivalGeofence(req, res, next) {
    try {
      const { driverLat, driverLng, targetLat, targetLng, radiusMeters } = req.body;
      if (!driverLat || !driverLng || !targetLat || !targetLng) {
        return res.status(400).json({
          success: false,
          message: 'driverLat, driverLng, targetLat and targetLng are required.',
        });
      }

      const result = routeOptimizer.isWithinGeofence(
        parseFloat(driverLat),
        parseFloat(driverLng),
        parseFloat(targetLat),
        parseFloat(targetLng),
        parseFloat(radiusMeters) || 75
      );

      return res.status(200).json({
        success: true,
        geofenceCheck: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/logistics/pod/verify-handover
   * Complete delivery with customer handover OTP, signature & GPS stamping
   */
  async verifyHandoverPOD(req, res, next) {
    try {
      const { orderId, handoverOtp, recipientName, signatureData, photoUri, driverLocation } = req.body;
      if (!orderId) {
        return res.status(400).json({ success: false, message: 'orderId is required.' });
      }

      const completion = podVerification.verifyAndCompleteDelivery(orderId, {
        handoverOtp,
        recipientName,
        signatureData,
        photoUri,
        driverLocation,
      });

      return res.status(200).json(completion);
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  },
};

module.exports = logisticsController;
