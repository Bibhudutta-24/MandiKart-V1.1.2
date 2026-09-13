/**
 * Notification Service Interface
 * Prepares endpoints for notifications and mark-as-read operations.
 */
import apiClient, { USE_MOCK_DATA } from '../api/apiClient';
import { API_ENDPOINTS } from '../api/endpoints';
import { mockNotifications } from '../mock/notifications';

export const notificationService = {
  async getNotifications(category = 'ALL') {
    if (USE_MOCK_DATA) {
      await new Promise((r) => setTimeout(r, 200));
      if (category === 'ALL') return mockNotifications;
      return mockNotifications.filter((n) => n.category === category);
    }

    try {
      const data = await apiClient.get(API_ENDPOINTS.notifications, { category });
      return data?.notifications || data || mockNotifications;
    } catch (err) {
      if (category === 'ALL') return mockNotifications;
      return mockNotifications.filter((n) => n.category === category);
    }
  },

  async markAsRead(id) {
    if (USE_MOCK_DATA) {
      const notif = mockNotifications.find((n) => n.id === id);
      if (notif) notif.unread = false;
      return { success: true };
    }

    try {
      return await apiClient.post(API_ENDPOINTS.markNotificationRead(id));
    } catch (err) {
      const notif = mockNotifications.find((n) => n.id === id);
      if (notif) notif.unread = false;
      return { success: true };
    }
  },

  async markAllAsRead() {
    if (USE_MOCK_DATA) {
      mockNotifications.forEach((n) => {
        n.unread = false;
      });
      return { success: true };
    }

    try {
      return await apiClient.post(API_ENDPOINTS.markAllNotificationsRead);
    } catch (err) {
      mockNotifications.forEach((n) => {
        n.unread = false;
      });
      return { success: true };
    }
  },
};

export default notificationService;
