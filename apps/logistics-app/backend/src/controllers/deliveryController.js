/**
 * Delivery Controller
 * Handles active routes, deliveries, Dijkstra ETA, and POD submission.
 */
const { store } = require('../config/db');

const deliveryController = {
  /**
   * GET /api/deliveries/assigned
   */
  async getAssignedDeliveries(req, res, next) {
    try {
      const driverId = req.driver ? req.driver.id : 'MKP-10482';
      const deliveries = Array.from(store.deliveries.values()).filter(
        (d) => d.driverId === driverId
      );

      return res.status(200).json({
        success: true,
        count: deliveries.length,
        deliveries,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/deliveries/:id/status
   */
  async updateDeliveryStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const delivery = store.deliveries.get(id);
      if (!delivery) {
        return res.status(404).json({ success: false, message: 'Delivery not found.' });
      }

      delivery.status = status;
      store.deliveries.set(id, delivery);

      return res.status(200).json({
        success: true,
        message: `Delivery status updated to ${status}.`,
        delivery,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/deliveries/:id/pod
   */
  async submitPOD(req, res, next) {
    try {
      const { id } = req.params;
      const { customerSignature, recipientName, podPhotoUri } = req.body;

      const delivery = store.deliveries.get(id);
      if (!delivery) {
        return res.status(404).json({ success: false, message: 'Delivery not found.' });
      }

      delivery.status = 'DELIVERED';
      delivery.pod = {
        recipientName: recipientName || delivery.customerName,
        customerSignature,
        podPhotoUri,
        deliveredAt: new Date().toISOString(),
      };
      store.deliveries.set(id, delivery);

      return res.status(200).json({
        success: true,
        message: 'Proof of Delivery accepted. Delivery completed successfully!',
        delivery,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = deliveryController;
