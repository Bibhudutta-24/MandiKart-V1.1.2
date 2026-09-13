/**
 * Driver Controller
 * Handles driver profile, vehicle updates, online status, and daily earnings.
 */
const { store } = require('../config/db');

const driverController = {
  /**
   * GET /api/driver/profile
   */
  async getProfile(req, res, next) {
    try {
      const driver = req.driver;
      return res.status(200).json({
        success: true,
        driver,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/driver/status
   */
  async updateStatus(req, res, next) {
    try {
      const { status } = req.body;
      const driver = req.driver;

      if (!['ONLINE', 'OFFLINE'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Status must be ONLINE or OFFLINE.' });
      }

      driver.status = status;
      store.drivers.set(driver.id, driver);

      return res.status(200).json({
        success: true,
        status: driver.status,
        message: `Driver status updated to ${status}.`,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/driver/profile
   */
  async updateProfile(req, res, next) {
    try {
      const driver = req.driver;
      const updates = req.body;

      Object.assign(driver, updates);
      store.drivers.set(driver.id, driver);

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully.',
        driver,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = driverController;
