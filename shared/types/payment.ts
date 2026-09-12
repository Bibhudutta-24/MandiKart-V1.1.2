import { PaymentStatus } from '../constants';

export interface Payment {
  paymentId: string;
  orderId: string;
  buyerId: string;
  farmerId: string;
  amount: number;
  currency: 'INR';
  method: 'UPI' | 'NET_BANKING' | 'CARD' | 'ESCROW' | 'CASH_ON_DELIVERY';
  status: PaymentStatus;
  gatewayTransactionId?: string;
  paidAt?: number;
  createdAt: number;
  updatedAt: number;
}
