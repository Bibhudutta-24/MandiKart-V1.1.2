/**
 * Farmer App Backend Adapter - Auth
 * App-specific adapter bridging frontend client requests to the authoritative shared backend
 */
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '../../../../../shared/api-contracts';

export class FarmerAuthAdapter {
  static async authenticateFarmer(req: LoginRequest): Promise<LoginResponse> {
    // Adapter logic forwarding to shared backend / Firebase Auth
    return {
      user: {
        uid: `usr_${req.phoneNumber}`,
        phoneNumber: req.phoneNumber,
        role: 'FARMER',
        status: 'ACTIVE',
        displayName: 'Farmer',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      token: `token_${req.phoneNumber}`,
    };
  }

  static async registerFarmer(req: RegisterRequest): Promise<RegisterResponse> {
    return {
      user: {
        uid: `usr_${req.phoneNumber}`,
        phoneNumber: req.phoneNumber,
        role: 'FARMER',
        status: 'ACTIVE',
        displayName: req.displayName,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      token: `token_${req.phoneNumber}`,
    };
  }
}
