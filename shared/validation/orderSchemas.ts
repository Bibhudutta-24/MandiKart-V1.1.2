export interface CreateOrderInput {
  farmerId: string;
  items: {
    productId: string;
    quantityKg: number;
  }[];
  deliveryAddress: {
    line1: string;
    district: string;
    state: string;
    pincode: string;
  };
}

export function validateOrderInput(input: CreateOrderInput): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!input.farmerId) errors.push('Farmer ID is required');
  if (!input.items || input.items.length === 0) errors.push('At least one order item is required');
  for (const item of input.items) {
    if (item.quantityKg <= 0) errors.push(`Item ${item.productId} quantity must be > 0`);
  }
  return { isValid: errors.length === 0, errors };
}
