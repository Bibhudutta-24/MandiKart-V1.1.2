import { Notification } from '../types';

export interface NotificationsListResponse {
  notifications: Notification[];
  unreadCount: number;
}
