import { FPO, Order } from '../types';

export interface FpoDetailsResponse {
  fpo: FPO;
}

export interface FpoOrdersResponse {
  orders: Order[];
}
