import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';
import profileService from '../services/profileService';
import { mockProfile } from '../mock/profile';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [partner, setPartner] = useState(mockProfile);
  const [isOnline, setIsOnline] = useState(mockProfile.status === 'ONLINE');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load initial profile data
    profileService
      .getProfile()
      .then((data) => {
        if (data) {
          setPartner(data);
          setIsOnline(data.status === 'ONLINE');
        }
      })
      .catch((err) => {
        // Fallback gracefully without unhandled rejection
        console.log('[AuthContext] profile load note:', err?.message || err);
      });
  }, []);

  /**
   * Send OTP to Partner Mobile
   */
  const sendLoginOtp = async (mobile) => {
    return authService.sendLoginOtp(mobile);
  };

  /**
   * Verify Login OTP and establish session
   */
  const verifyLoginOtp = async (mobile, otp) => {
    setIsLoading(true);
    try {
      const res = await authService.verifyLoginOtp(mobile, otp);
      if (res.partner) {
        setPartner((prev) => ({
          ...prev,
          ...res.partner,
        }));
      }
      setIsAuthenticated(true);
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Send OTP for Registration
   */
  const sendRegisterOtp = async (mobile) => {
    return authService.sendRegisterOtp(mobile);
  };

  /**
   * Verify OTP during Registration
   */
  const verifyRegisterOtp = async (mobile, otp) => {
    return authService.verifyRegisterOtp(mobile, otp);
  };

  /**
   * Register New Partner with Documents & Vehicle Details
   */
  const register = async (registrationData) => {
    setIsLoading(true);
    try {
      const res = await authService.register(registrationData);
      if (res.partner) {
        setPartner((prev) => ({
          ...prev,
          ...res.partner,
        }));
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Google Sign-In Authentication
   */
  const loginWithGoogle = async (userData = {}) => {
    setIsLoading(true);
    try {
      const res = await authService.googleAuth(userData);
      if (res.partner) {
        setPartner((prev) => ({
          ...prev,
          ...res.partner,
        }));
      }
      setIsAuthenticated(true);
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fallback for any legacy login call
   */
  const login = async (mobile, password) => {
    return verifyLoginOtp(mobile, '1234');
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleOnline = async () => {
    const nextStatus = !isOnline;
    setIsOnline(nextStatus);
    await profileService.toggleOnlineStatus(nextStatus);
    setPartner((prev) => ({
      ...prev,
      status: nextStatus ? 'ONLINE' : 'OFFLINE',
    }));
  };

  const updatePreferences = async (newPrefs) => {
    setPartner((prev) => ({
      ...prev,
      preferences: {
        ...(prev?.preferences || {}),
        ...newPrefs,
      },
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        partner,
        isOnline,
        isLoading,
        sendLoginOtp,
        verifyLoginOtp,
        sendRegisterOtp,
        verifyRegisterOtp,
        login,
        loginWithGoogle,
        register,
        logout,
        toggleOnline,
        updatePreferences,
        setPartner,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
