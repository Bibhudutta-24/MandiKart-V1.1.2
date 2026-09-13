/**
 * Authentication Controller
 * Manages Mobile OTP dispatch, verification, JWT creation, and partner onboarding.
 */
const jwt = require('jsonwebtoken');
const otpService = require('../services/otpService');
const { store } = require('../config/db');
const { JWT_SECRET } = require('../middlewares/authMiddleware');

const authController = {
  /**
   * POST /api/auth/send-login-otp
   */
  async sendLoginOtp(req, res, next) {
    try {
      const { mobile } = req.body;
      if (!mobile) {
        return res.status(400).json({ success: false, message: 'Mobile number is required.' });
      }

      const result = otpService.createOtp(mobile, 'login');
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/auth/verify-login-otp
   */
  async verifyLoginOtp(req, res, next) {
    try {
      const { mobile, otp } = req.body;
      if (!mobile || !otp) {
        return res.status(400).json({ success: false, message: 'Mobile and OTP are required.' });
      }

      // Verify OTP
      otpService.verifyOtp(mobile, otp, 'login');

      const cleanMobile = mobile.replace(/\D/g, '').slice(-10);

      // Look up driver or create driver profile for this mobile
      let driver = null;
      for (const d of store.drivers.values()) {
        if (d.phone && d.phone.endsWith(cleanMobile)) {
          driver = d;
          break;
        }
      }

      if (!driver) {
        const driverId = `MKP-${Math.floor(10000 + Math.random() * 90000)}`;
        driver = {
          id: driverId,
          name: 'Delivery Partner',
          phone: `+91 ${cleanMobile}`,
          status: 'ONLINE',
          rating: 5.0,
          totalDeliveries: 0,
          todayStats: { deliveries: 0, earnings: 0, rating: 5.0, rank: 1 },
          vehicle: { type: 'Motorcycle with Cargo Rack', plateNumber: 'OD-02-AB-1234', status: 'ACTIVE' },
        };
        store.drivers.set(driverId, driver);
      }

      // Generate JWT Token
      const token = jwt.sign({ driverId: driver.id, mobile: driver.phone }, JWT_SECRET, {
        expiresIn: '30d',
      });

      return res.status(200).json({
        success: true,
        message: 'Login successful.',
        token,
        partner: driver,
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  /**
   * POST /api/auth/send-register-otp
   */
  async sendRegisterOtp(req, res, next) {
    try {
      const { mobile } = req.body;
      if (!mobile) {
        return res.status(400).json({ success: false, message: 'Mobile number is required.' });
      }

      const result = otpService.createOtp(mobile, 'register');
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/auth/verify-register-otp
   */
  async verifyRegisterOtp(req, res, next) {
    try {
      const { mobile, otp } = req.body;
      if (!mobile || !otp) {
        return res.status(400).json({ success: false, message: 'Mobile and OTP are required.' });
      }

      otpService.verifyOtp(mobile, otp, 'register');

      return res.status(200).json({
        success: true,
        verified: true,
        message: 'Mobile number verified successfully.',
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  /**
   * POST /api/auth/register
   * Registers complete partner credentials:
   * Aadhaar, PAN, Vehicle clear photo, Plate photo, Driving License, Bank details, Mobile number.
   */
  async register(req, res, next) {
    try {
      const data = req.body;
      if (!data.mobile) {
        return res.status(400).json({ success: false, message: 'Mobile number is required.' });
      }

      const driverId = `MKP-${Math.floor(10000 + Math.random() * 90000)}`;
      const cleanMobile = data.mobile.replace(/\D/g, '').slice(-10);

      const newDriver = {
        id: driverId,
        name: data.fullName || 'Partner Driver',
        phone: `+91 ${cleanMobile}`,
        status: 'ONLINE',
        rating: 5.0,
        totalDeliveries: 0,
        todayStats: {
          deliveries: 0,
          earnings: 0,
          rating: 5.0,
          rank: 1,
        },
        documents: {
          aadhaarNumber: data.aadhaarNumber,
          aadhaarPhotoUri: data.aadhaarPhotoUri,
          panNumber: data.panNumber,
          panPhotoUri: data.panPhotoUri,
          drivingLicenseNumber: data.drivingLicenseNumber,
          drivingLicensePhotoUri: data.drivingLicensePhotoUri,
          status: 'VERIFIED',
        },
        vehicle: {
          type: data.vehicleType || 'Motorcycle with Cargo Rack',
          plateNumber: data.vehiclePlateNumber || 'OD-02-NEW-01',
          vehiclePhotoUri: data.vehiclePhotoUri,
          platePhotoUri: data.platePhotoUri,
          status: 'ACTIVE',
        },
        bankDetails: {
          accountNumber: data.bankAccountNumber,
          ifscCode: data.bankIfsc,
          passbookPhotoUri: data.passbookPhotoUri,
          bankName: data.bankName || 'Verified Bank',
          status: 'CONFIGURED',
        },
        createdAt: new Date().toISOString(),
      };

      store.drivers.set(driverId, newDriver);

      const token = jwt.sign({ driverId, mobile: newDriver.phone }, JWT_SECRET, {
        expiresIn: '30d',
      });

      return res.status(201).json({
        success: true,
        message: 'Driver partner onboarding completed successfully!',
        partnerId: driverId,
        partner: newDriver,
        token,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/auth/google
   * Universal Google Sign In endpoint
   */
  async googleAuth(req, res, next) {
    try {
      const { email, name, photoUrl, idToken } = req.body || {};

      // Match or create driver with Google email
      const driverEmail = email || 'partner.google@mandikart.com';
      let driver = null;
      for (const d of store.drivers.values()) {
        if (d.email === driverEmail) {
          driver = d;
          break;
        }
      }

      if (!driver) {
        const driverId = `MKP-${Math.floor(10000 + Math.random() * 90000)}`;
        driver = {
          id: driverId,
          name: name || 'Google Verified Partner',
          email: driverEmail,
          phone: '+91 9876543210',
          avatarUri: photoUrl || null,
          status: 'ONLINE',
          authProvider: 'GOOGLE',
          rating: 5.0,
          totalDeliveries: 0,
          todayStats: { deliveries: 0, earnings: 0, rating: 5.0, rank: 1 },
          vehicle: { type: 'Motorcycle with Cargo Rack', plateNumber: 'OD-02-AB-4821', status: 'ACTIVE' },
        };
        store.drivers.set(driverId, driver);
      }

      const token = jwt.sign({ driverId: driver.id, email: driver.email }, JWT_SECRET, {
        expiresIn: '30d',
      });

      return res.status(200).json({
        success: true,
        message: 'Google authentication successful.',
        token,
        partner: driver,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/auth/logout
   */
  async logout(req, res, next) {
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  },
};

module.exports = authController;
