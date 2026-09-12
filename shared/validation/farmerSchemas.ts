export interface UpdateFarmerProfileInput {
  name: string;
  state: string;
  district: string;
  village: string;
  pincode: string;
  farmSizeAcres: number;
  cropsGrown: string[];
}

export function validatePincode(pincode: string): boolean {
  return /^\d{6}$/.test(pincode.trim());
}
