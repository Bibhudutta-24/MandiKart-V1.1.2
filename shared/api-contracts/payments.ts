import { Payment } from '../types';
import { CreatePaymentInput } from '../validation';

export interface CreatePaymentRequest extends CreatePaymentInput {}

export interface CreatePaymentResponse {
  payment: Payment;
  paymentGatewayOrderId?: string;
}

export interface VerifyPaymentRequest {
  paymentId: string;
  gatewayTransactionId: string;
  signature?: string;
}

export interface VerifyPaymentResponse {
  payment: Payment;
  verified: boolean;
}
