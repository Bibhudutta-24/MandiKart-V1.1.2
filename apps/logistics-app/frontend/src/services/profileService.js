/**
 * Profile & Settings Service Interface
 * Prepares endpoints for profile management, vehicle status, and preferences.
 */
import apiClient, { USE_MOCK_DATA } from '../api/apiClient';
import { API_ENDPOINTS } from '../api/endpoints';
import { mockProfile } from '../mock/profile';

export const profileService = {
  async getProfile() {
    if (USE_MOCK_DATA) {
      await new Promise((r) => setTimeout(r, 200));
      return mockProfile;
    }

    try {
      const data = await apiClient.get(API_ENDPOINTS.profile);
      return data?.profile || data || mockProfile;
    } catch (err) {
      return mockProfile;
    }
  },

  async updateProfile(updates) {
    if (USE_MOCK_DATA) {
      await new Promise((r) => setTimeout(r, 300));
      Object.assign(mockProfile, updates);
      return { success: true, profile: mockProfile };
    }

    try {
      const data = await apiClient.put(API_ENDPOINTS.updateProfile, updates);
      return data || { success: true, profile: { ...mockProfile, ...updates } };
    } catch (err) {
      Object.assign(mockProfile, updates);
      return { success: true, profile: mockProfile };
    }
  },

  async updatePreferences(newPreferences) {
    if (USE_MOCK_DATA) {
      await new Promise((r) => setTimeout(r, 150));
      mockProfile.preferences = { ...mockProfile.preferences, ...newPreferences };
      return { success: true, preferences: mockProfile.preferences };
    }

    try {
      const data = await apiClient.put(API_ENDPOINTS.updatePreferences, newPreferences);
      return (
        data || {
          success: true,
          preferences: { ...mockProfile.preferences, ...newPreferences },
        }
      );
    } catch (err) {
      mockProfile.preferences = { ...mockProfile.preferences, ...newPreferences };
      return { success: true, preferences: mockProfile.preferences };
    }
  },

  async toggleOnlineStatus(isOnline) {
    if (USE_MOCK_DATA) {
      mockProfile.status = isOnline ? 'ONLINE' : 'OFFLINE';
      return { success: true, status: mockProfile.status };
    }

    try {
      const data = await apiClient.put(API_ENDPOINTS.updateDriverStatus, {
        status: isOnline ? 'ONLINE' : 'OFFLINE',
      });
      return data || { success: true, status: isOnline ? 'ONLINE' : 'OFFLINE' };
    } catch (err) {
      mockProfile.status = isOnline ? 'ONLINE' : 'OFFLINE';
      return { success: true, status: mockProfile.status };
    }
  },
};

export default profileService;
