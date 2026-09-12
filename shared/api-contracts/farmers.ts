import { Farmer, Product, Order, Payment, Notification } from '../types';

export interface GetFarmerProfileResponse {
  farmer: Farmer;
}

export interface UpdateFarmerProfileRequest {
  name: string;
  village: string;
  district: string;
  state: string;
  pincode: string;
  farmSizeAcres: number;
  cropsGrown: string[];
}

export interface GetFarmerProduceResponse {
  products: Product[];
}

export interface GetFarmerOrdersResponse {
  orders: Order[];
}

export interface GetFarmerPaymentsResponse {
  payments: Payment[];
}

export interface GetFarmerNotificationsResponse {
  notifications: Notification[];
}
