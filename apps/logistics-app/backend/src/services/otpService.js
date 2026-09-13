/**
 * OTP Service
 * Secure crypto OTP generation, storage, expiry, and SMS Gateway dispatcher.
 */
const crypto = require('crypto');
const { store } = require('../config/db');

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

class OtpService {
  /**
   * Generate 4-digit secure OTP
   */
  generateOtp(length = 4) {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
      const index = crypto.randomInt(0, digits.length);
      otp += digits[index];
    }
    return otp;
  }

  /**
   * Create and store OTP for mobile number
   */
  createOtp(mobile, purpose = 'login') {
    const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
    const otp = this.generateOtp(4);
    const key = `${purpose}_${cleanMobile}`;

    store.otps.set(key, {
      otp,
      expiresAt: Date.now() + OTP_EXPIRY_MS,
      attempts: 0,
    });

    console.log(`\n========================================`);
    console.log(`📲 [SMS GATEWAY DISPATCH]`);
    console.log(`To: +91 ${cleanMobile}`);
    console.log(`Purpose: ${purpose.toUpperCase()}`);
    console.log(`OTP Code: >>> ${otp} <<<`);
    console.log(`Valid for 5 minutes.`);
    console.log(`========================================\n`);

    return {
      success: true,
      mobile: cleanMobile,
      message: `OTP dispatched to +91 ${cleanMobile}`,
    };
  }

  /**
   * Verify OTP
   */
  verifyOtp(mobile, otp, purpose = 'login') {
    const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
    const key = `${purpose}_${cleanMobile}`;
    const record = store.otps.get(key);

    if (!record) {
      throw new Error('OTP expired or not requested. Please request a new OTP.');
    }

    if (Date.now() > record.expiresAt) {
      store.otps.delete(key);
      throw new Error('OTP has expired. Please request a new OTP.');
    }

    if (record.attempts >= 5) {
      store.otps.delete(key);
      throw new Error('Too many invalid attempts. Please request a fresh OTP.');
    }

    if (record.otp !== otp.trim()) {
      record.attempts += 1;
      throw new Error('Invalid verification code. Please check your SMS.');
    }

    // OTP matched successfully -> remove to prevent replay attacks
    store.otps.delete(key);
    return true;
  }
}

module.exports = new OtpService();
