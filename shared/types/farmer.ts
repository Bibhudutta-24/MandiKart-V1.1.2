export interface Farmer {
  farmerId: string;
  uid: string;
  name: string;
  phoneNumber: string;
  state: string;
  district: string;
  village: string;
  pincode: string;
  farmSizeAcres: number;
  cropsGrown: string[];
  fpoId?: string;
  isKycVerified: boolean;
  bankDetails?: {
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
    bankName: string;
  };
  createdAt: number;
  updatedAt: number;
}
