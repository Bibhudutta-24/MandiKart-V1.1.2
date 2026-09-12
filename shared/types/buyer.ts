export interface Buyer {
  buyerId: string;
  uid: string;
  businessName: string;
  contactPerson: string;
  phoneNumber: string;
  email: string;
  businessType: 'RETAILER' | 'WHOLESALER' | 'PROCESSOR' | 'INSTITUTION';
  gstin?: string;
  deliveryAddress: {
    line1: string;
    district: string;
    state: string;
    pincode: string;
    coordinates?: { latitude: number; longitude: number };
  };
  createdAt: number;
  updatedAt: number;
}
