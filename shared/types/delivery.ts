import { DeliveryStatus } from '../constants';

export interface Delivery {
  deliveryId: string;
  orderId: string;
  farmerId: string;
  buyerId: string;
  logisticsId: string;
  pickupLocation: {
    contactPerson: string;
    phoneNumber: string;
    address: string;
    pincode: string;
  };
  dropLocation: {
    contactPerson: string;
    phoneNumber: string;
    address: string;
    pincode: string;
  };
  status: DeliveryStatus;
  assignedAt?: number;
  pickedUpAt?: number;
  deliveredAt?: number;
  createdAt: number;
  updatedAt: number;
}
