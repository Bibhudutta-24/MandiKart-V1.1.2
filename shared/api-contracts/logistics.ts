import { Delivery } from '../types';

export interface LogisticsAssignmentsResponse {
  deliveries: Delivery[];
}

export interface AcceptDeliveryRequest {
  estimatedPickupTime: number;
}

export interface UpdateDeliveryProgressRequest {
  status: 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED';
  locationNote?: string;
  proofImageUrl?: string;
}
