/**
 * Input Validation Utilities
 */

export const isValidIndianMobile = (mobile) => {
  if (!mobile) return false;
  const clean = mobile.replace(/\D/g, '');
  return clean.length === 10 && /^[6-9]\d{9}$/.test(clean);
};

export const isValidOTP = (otp) => {
  if (!otp) return false;
  const clean = otp.replace(/\D/g, '');
  return clean.length === 4;
};

export const isValidPassword = (password) => {
  return typeof password === 'string' && password.length >= 6;
};
