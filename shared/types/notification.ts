export interface Notification {
  notificationId: string;
  userId: string;
  title: string;
  body: string;
  type: 'ORDER' | 'PRODUCT' | 'PAYMENT' | 'DELIVERY' | 'SYSTEM';
  read: boolean;
  metadata?: Record<string, any>;
  createdAt: number;
}
