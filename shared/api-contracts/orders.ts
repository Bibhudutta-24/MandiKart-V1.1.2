import { Order } from '../types';
import { CreateOrderInput } from '../validation';

export interface CreateOrderRequest extends CreateOrderInput {}

export interface CreateOrderResponse {
  order: Order;
}

export interface OrderDetailsResponse {
  order: Order;
}

export interface ConfirmOrderResponse {
  order: Order;
}

export interface CancelOrderRequest {
  reason: string;
}

export interface CancelOrderResponse {
  order: Order;
}
