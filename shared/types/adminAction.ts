export interface AdminAction {
  actionId: string;
  adminId: string;
  action: 'APPROVE_PRODUCT' | 'REJECT_PRODUCT' | 'APPROVE_FARMER' | 'REJECT_FARMER' | 'ASSIGN_LOGISTICS' | 'CANCEL_ORDER';
  targetType: 'PRODUCT' | 'FARMER' | 'ORDER' | 'USER';
  targetId: string;
  previousStatus?: string;
  newStatus?: string;
  reason?: string;
  timestamp: number;
}
