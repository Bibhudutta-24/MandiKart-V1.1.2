/**
 * Advanced Logistics Controller
 * Exposes Order Batching, Exceptions & SOS, Gamification, and Financial Ledger.
 */
const orderBatchingEngine = require('../services/orderBatchingEngine');
const exceptionEngine = require('../services/exceptionEngine');
const gamificationEngine = require('../services/gamificationEngine');
const ledgerService = require('../services/ledgerService');

const advancedLogisticsController = {
  // ==================== 1. BATCHING & POOLING ====================
  async poolOrders(req, res, next) {
    try {
      const { mandiHub, pendingOrders, vehicleType } = req.body;
      const hub = mandiHub || {
        name: 'Azadpur Mandi Hub Gate #2',
        lat: 28.7158,
        lng: 77.1725,
      };

      // Sample orders if none provided
      const sampleOrders = pendingOrders || [
        {
          id: 'MK-ORD-701',
          customerName: 'Shri Ram Veggies',
          dropAddress: 'B-Block Market, Rohini Sector 8',
          dropLat: 28.7082,
          dropLng: 77.1214,
          weightKg: 18,
          volumeM3: 0.04,
          baseFare: 85,
          produceType: 'Onions & Potatoes',
        },
        {
          id: 'MK-ORD-702',
          customerName: 'Kaveri Fresh Mart',
          dropAddress: 'Pocket 3, Rohini Sector 9',
          dropLat: 28.712,
          dropLng: 77.125,
          weightKg: 14,
          volumeM3: 0.03,
          baseFare: 75,
          produceType: 'Tomatoes & Cauliflower',
        },
        {
          id: 'MK-ORD-703',
          customerName: 'Nature Basket Kitchen',
          dropAddress: 'Main Ring Road, Pitampura',
          dropLat: 28.698,
          dropLng: 77.142,
          weightKg: 22,
          volumeM3: 0.05,
          baseFare: 95,
          produceType: 'Green Chillies & Ginger',
        },
        {
          id: 'MK-ORD-704',
          customerName: 'Delhi Haat Greens',
          dropAddress: 'Netaji Subhash Place',
          dropLat: 28.691,
          dropLng: 77.151,
          weightKg: 30,
          volumeM3: 0.06,
          baseFare: 110,
          produceType: 'Apples & Pomegranates',
        },
      ];

      const result = orderBatchingEngine.createBatches(hub, sampleOrders, vehicleType || 'THREE_WHEELER');
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  // ==================== 2. EXCEPTIONS & EMERGENCY SOS ====================
  async triggerSOS(req, res, next) {
    try {
      const driverId = req.driver?.id || req.body.driverId || 'MKP-10482';
      const { orderId, location, reason } = req.body;
      const coords = location || { lat: 28.7112, lng: 77.1542 };

      const incident = exceptionEngine.triggerBreakdownSOS(driverId, orderId || 'MK-10284', coords, reason);
      return res.status(200).json({ success: true, incident });
    } catch (error) {
      next(error);
    }
  },

  async verifyCustodyTransfer(req, res, next) {
    try {
      const { incidentId, pin, rescueDriverId } = req.body;
      const result = exceptionEngine.verifyCustodyTransfer(
        incidentId,
        pin,
        rescueDriverId || req.driver?.id || 'MKP-RELIEF-01'
      );
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async initiateBuyerWait(req, res, next) {
    try {
      const driverId = req.driver?.id || 'MKP-10482';
      const { orderId, currentCoords } = req.body;
      const session = exceptionEngine.initiateBuyerUnreachable(
        orderId || 'MK-10284',
        driverId,
        currentCoords || { lat: 28.7158, lng: 77.1725 }
      );
      return res.status(200).json({ success: true, session });
    } catch (error) {
      next(error);
    }
  },

  async confirmReturnToMandi(req, res, next) {
    try {
      const { orderId, mandiCoords } = req.body;
      const result = exceptionEngine.confirmReturnToMandi(orderId || 'MK-10284', mandiCoords);
      return res.status(200).json({ success: true, result });
    } catch (error) {
      next(error);
    }
  },

  async getActiveExceptions(req, res, next) {
    try {
      const data = exceptionEngine.getActiveExceptions();
      return res.status(200).json({ success: true, ...data });
    } catch (error) {
      next(error);
    }
  },

  // ==================== 3. GAMIFICATION & MILESTONES ====================
  async getDailyMilestones(req, res, next) {
    try {
      const driverId = req.driver?.id || req.query.driverId || 'MKP-10482';
      const data = gamificationEngine.getDailyMilestones(driverId);
      return res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  },

  async recordTrip(req, res, next) {
    try {
      const driverId = req.driver?.id || req.body.driverId || 'MKP-10482';
      const result = gamificationEngine.recordTripCompletion(driverId, req.body);
      return res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  async getTierStatus(req, res, next) {
    try {
      const driverId = req.driver?.id || req.query.driverId || 'MKP-10482';
      const data = gamificationEngine.calculateTierStatus(driverId);
      return res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  },

  // ==================== 4. DOUBLE-ENTRY FINANCIAL LEDGER ====================
  async getLedgerSummary(req, res, next) {
    try {
      const driverId = req.driver?.id || req.query.driverId || 'MKP-10482';
      const summary = ledgerService.getFinancialSummary(driverId);
      return res.status(200).json(summary);
    } catch (error) {
      next(error);
    }
  },

  async requestPayout(req, res, next) {
    try {
      const driverId = req.driver?.id || req.body.driverId || 'MKP-10482';
      const { amount } = req.body;
      const result = ledgerService.requestPayout(driverId, amount);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async recordDeliverySettlement(req, res, next) {
    try {
      const result = ledgerService.recordDeliverySettlement(req.body);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = advancedLogisticsController;
