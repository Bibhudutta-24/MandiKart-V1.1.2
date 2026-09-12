export interface CreateProduceInput {
  commodityName: string;
  variety: string;
  category: 'VEGETABLES' | 'FRUITS' | 'GRAINS' | 'PULSES' | 'SPICES' | 'OTHER';
  quantityAvailableKg: number;
  minOrderQuantityKg: number;
  pricePerKg: number;
  grade: 'A' | 'B' | 'C';
  images: string[];
  village: string;
  district: string;
  state: string;
  pincode: string;
}

export function validateProduceInput(input: CreateProduceInput): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!input.commodityName || input.commodityName.trim().length === 0) errors.push('Commodity name is required');
  if (input.quantityAvailableKg <= 0) errors.push('Quantity must be greater than 0');
  if (input.minOrderQuantityKg <= 0) errors.push('Min order quantity must be greater than 0');
  if (input.minOrderQuantityKg > input.quantityAvailableKg) errors.push('Min order quantity cannot exceed total quantity');
  if (input.pricePerKg <= 0) errors.push('Price per kg must be greater than 0');
  if (!input.images || input.images.length === 0) errors.push('At least one produce image is required');
  return { isValid: errors.length === 0, errors };
}
