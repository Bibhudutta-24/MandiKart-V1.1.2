import { User } from '../types';

export interface LoginRequest {
  phoneNumber: string;
  otp: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface RegisterRequest {
  phoneNumber: string;
  displayName: string;
  role: 'FARMER' | 'BUYER' | 'LOGISTICS' | 'FPO';
}

export interface RegisterResponse {
  user: User;
  token: string;
}
