import { Product, Farmer, Order, AdminAction } from '../types';

export interface AdminDashboardResponse {
  pendingProductCount: number;
  pendingFarmerCount: number;
  activeOrderCount: number;
  todayRevenue: number;
}

export interface ApproveProductRequest {
  productId: string;
  notes?: string;
}

export interface RejectProductRequest {
  productId: string;
  reason: string;
}

export interface ApproveFarmerRequest {
  farmerId: string;
}

export interface RejectFarmerRequest {
  farmerId: string;
  reason: string;
}

export interface AssignLogisticsRequest {
  deliveryId: string;
  logisticsId: string;
}
