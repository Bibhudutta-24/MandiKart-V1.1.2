import { ProductStatus } from '../constants';

export interface Product {
  productId: string;
  farmerId: string;
  farmerName: string;
  commodityName: string;
  variety: string;
  category: 'VEGETABLES' | 'FRUITS' | 'GRAINS' | 'PULSES' | 'SPICES' | 'OTHER';
  quantityAvailableKg: number;
  minOrderQuantityKg: number;
  pricePerKg: number;
  grade: 'A' | 'B' | 'C';
  images: string[];
  harvestDate?: number;
  storageLocation: {
    village: string;
    district: string;
    state: string;
    pincode: string;
  };
  status: ProductStatus;
  rejectionReason?: string;
  approvedBy?: string;
  approvedAt?: number;
  createdAt: number;
  updatedAt: number;
}
