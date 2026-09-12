/**
 * MandiKart Farmer App - Auth Zustand Store
 * State management following architecture principle: Screen -> Store -> Service -> Backend
 */
import { create } from 'zustand';
import { User, Farmer } from '../../../../../shared/types';
import { AuthService } from '../services/authService';

interface AuthState {
  user: User | null;
  farmer: Farmer | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  verificationId: string | null;

  // Actions
  loginWithPassword: (phoneNumber: string, password: string) => Promise<boolean>;
  requestOtp: (phoneNumber: string) => Promise<boolean>;
  verifyOtp: (phoneNumber: string, otp: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  farmer: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  verificationId: null,

  loginWithPassword: async (phoneNumber: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const session = await AuthService.loginWithPassword(phoneNumber, password);
      set({
        user: session.user,
        farmer: session.farmer,
        token: session.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (err: any) {
      set({
        isLoading: false,
        error: err?.message || 'Login failed. Please verify your credentials.',
      });
      return false;
    }
  },

  requestOtp: async (phoneNumber: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await AuthService.requestOtp(phoneNumber);
      set({
        verificationId: res.verificationId,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (err: any) {
      set({
        isLoading: false,
        error: err?.message || 'Failed to send OTP. Please check the mobile number.',
      });
      return false;
    }
  },

  verifyOtp: async (phoneNumber: string, otp: string) => {
    const { verificationId } = get();
    set({ isLoading: true, error: null });
    try {
      const session = await AuthService.verifyOtp(phoneNumber, otp, verificationId || 'default');
      set({
        user: session.user,
        farmer: session.farmer,
        token: session.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (err: any) {
      set({
        isLoading: false,
        error: err?.message || 'Invalid verification code. Please try again.',
      });
      return false;
    }
  },

  logout: () => {
    set({
      user: null,
      farmer: null,
      token: null,
      isAuthenticated: false,
      error: null,
      verificationId: null,
    });
  },

  clearError: () => set({ error: null }),
}));
