export interface LoginInput {
  phoneNumber: string;
  otp?: string;
}

export interface RegisterInput {
  phoneNumber: string;
  role: 'FARMER' | 'BUYER' | 'LOGISTICS' | 'FPO';
  displayName: string;
}

export function validatePhoneNumber(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone.trim());
}

export function validateOtp(otp: string): boolean {
  return /^\d{6}$/.test(otp.trim());
}
