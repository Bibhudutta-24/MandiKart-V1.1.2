import { OrderStatus, PaymentStatus, DeliveryStatus } from '../constants';

export interface OrderItem {
  orderItemId: string;
  orderId: string;
  productId: string;
  commodityName: string;
  variety: string;
  quantityKg: number;
  pricePerKg: number;
  totalPrice: number;
}

export interface Order {
  orderId: string;
  buyerId: string;
  farmerId: string;
  fpoId?: string;
  logisticsId?: string;
  deliveryId?: string;
  items: OrderItem[];
  subtotalAmount: number;
  deliveryFee: number;
  platformFee: number;
  totalAmount: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  deliveryStatus: DeliveryStatus;
  deliveryAddress: {
    line1: string;
    district: string;
    state: string;
    pincode: string;
  };
  timeline: {
    status: OrderStatus;
    timestamp: number;
    note?: string;
  }[];
  createdAt: number;
  updatedAt: number;
}
