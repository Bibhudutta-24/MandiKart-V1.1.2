import { Product } from '../types';
import { CreateProduceInput } from '../validation';

export interface CreateProductRequest extends CreateProduceInput {}

export interface CreateProductResponse {
  product: Product;
}

export interface UpdateProductRequest {
  quantityAvailableKg?: number;
  pricePerKg?: number;
  grade?: 'A' | 'B' | 'C';
  images?: string[];
}

export interface ProductListResponse {
  products: Product[];
  total: number;
}
