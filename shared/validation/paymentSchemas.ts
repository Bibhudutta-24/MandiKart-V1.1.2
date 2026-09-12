export interface CreatePaymentInput {
  orderId: string;
  amount: number;
  method: 'UPI' | 'NET_BANKING' | 'CARD' | 'ESCROW' | 'CASH_ON_DELIVERY';
}

export function validatePaymentInput(input: CreatePaymentInput): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!input.orderId) errors.push('Order ID is required');
  if (input.amount <= 0) errors.push('Payment amount must be greater than 0');
  return { isValid: errors.length === 0, errors };
}
