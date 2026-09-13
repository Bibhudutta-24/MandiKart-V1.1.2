/**
 * Authentication Middleware
 * Validates incoming Bearer JWT tokens and attaches driver context.
 */
const jwt = require('jsonwebtoken');
const { store } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'mandikart_jwt_super_secret_production_key_2026';

const authenticateDriver = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authorization token provided.',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const driver = store.drivers.get(decoded.driverId);
    if (!driver) {
      return res.status(401).json({
        success: false,
        message: 'Driver account not found or session invalidated.',
      });
    }

    req.driver = driver;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session token.',
    });
  }
};

module.exports = {
  authenticateDriver,
  JWT_SECRET,
};
