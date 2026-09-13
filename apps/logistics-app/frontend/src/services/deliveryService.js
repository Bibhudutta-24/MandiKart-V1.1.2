/**
 * Delivery Service Interface
 * Prepares endpoints for fetching deliveries, accepting, updating status, POD, and exceptions.
 */
import apiClient, { USE_MOCK_DATA } from '../api/apiClient';
import { API_ENDPOINTS } from '../api/endpoints';
import { mockDeliveries, smartRouteMatchData } from '../mock/deliveries';

export const deliveryService = {
  async getDeliveries(filter = 'ALL') {
    if (USE_MOCK_DATA) {
      await new Promise((r) => setTimeout(r, 200));
      if (filter === 'ALL') return mockDeliveries;
      return mockDeliveries.filter((d) => d.status === filter);
    }

    try {
      const data = await apiClient.get(API_ENDPOINTS.deliveries, { filter });
      const list = data?.deliveries || data;
      if (Array.isArray(list) && list.length > 0) return list;
      return mockDeliveries;
    } catch (err) {
      // Backend offline fallback
      if (filter === 'ALL') return mockDeliveries;
      return mockDeliveries.filter((d) => d.status === filter);
    }
  },

  async getDeliveryById(id) {
    if (USE_MOCK_DATA) {
      await new Promise((r) => setTimeout(r, 150));
      const delivery = mockDeliveries.find((d) => d.id === id);
      if (!delivery) throw new Error('Delivery not found.');
      return delivery;
    }

    try {
      const data = await apiClient.get(API_ENDPOINTS.deliveryDetails(id));
      return data?.delivery || data || mockDeliveries.find((d) => d.id === id);
    } catch (err) {
      return mockDeliveries.find((d) => d.id === id);
    }
  },

  async acceptDelivery(id) {
    const handleLocalAccept = () => {
      const index = mockDeliveries.findIndex((d) => d.id === id);
      if (index !== -1) {
        mockDeliveries[index].status = 'ACTIVE';
        mockDeliveries[index].statusStep = 'PICKUP';
      }
      return { success: true, message: 'Delivery accepted', orderId: id };
    };

    if (USE_MOCK_DATA) {
      await new Promise((r) => setTimeout(r, 200));
      return handleLocalAccept();
    }

    try {
      return await apiClient.post(API_ENDPOINTS.acceptDelivery(id));
    } catch (err) {
      return handleLocalAccept();
    }
  },

  async rejectDelivery(id, reason = '') {
    const handleLocalReject = () => ({ success: true, message: 'Delivery declined', orderId: id });

    if (USE_MOCK_DATA) {
      await new Promise((r) => setTimeout(r, 150));
      return handleLocalReject();
    }

    try {
      return await apiClient.post(API_ENDPOINTS.rejectDelivery(id), { reason });
    } catch (err) {
      return handleLocalReject();
    }
  },

  async updateDeliveryStatus(id, newStatus) {
    const handleLocalStatus = () => {
      const item = mockDeliveries.find((d) => d.id === id);
      if (item) {
        item.statusStep = newStatus;
      }
      return { success: true, status: newStatus };
    };

    if (USE_MOCK_DATA) {
      await new Promise((r) => setTimeout(r, 200));
      return handleLocalStatus();
    }

    try {
      return await apiClient.put(API_ENDPOINTS.updateDeliveryStatus(id), { status: newStatus });
    } catch (err) {
      return handleLocalStatus();
    }
  },

  async submitPOD(id, podData) {
    const handleLocalPod = () => {
      const item = mockDeliveries.find((d) => d.id === id);
      if (item) {
        item.status = 'COMPLETED';
        item.statusStep = 'DELIVERED';
      }
      return {
        success: true,
        message: 'Proof of Delivery accepted. Earnings credited.',
        earningsCredited: 95,
      };
    };

    if (USE_MOCK_DATA) {
      await new Promise((r) => setTimeout(r, 300));
      return handleLocalPod();
    }

    try {
      return await apiClient.post(API_ENDPOINTS.submitPod(id), podData);
    } catch (err) {
      return handleLocalPod();
    }
  },

  async reportException(id, exceptionData) {
    const handleLocalException = () => {
      const item = mockDeliveries.find((d) => d.id === id);
      if (item) {
        item.status = 'EXCEPTION';
      }
      return {
        success: true,
        message: 'Exception report logged with MandiKart dispatch team.',
        ticketId: 'EXC-' + Date.now().toString().slice(-5),
      };
    };

    if (USE_MOCK_DATA) {
      await new Promise((r) => setTimeout(r, 300));
      return handleLocalException();
    }

    try {
      return await apiClient.post(API_ENDPOINTS.reportException(id), exceptionData);
    } catch (err) {
      return handleLocalException();
    }
  },

  async getSmartRouteMatch() {
    if (USE_MOCK_DATA) {
      await new Promise((r) => setTimeout(r, 150));
      return smartRouteMatchData;
    }

    try {
      return await apiClient.get(API_ENDPOINTS.smartRouteMatch);
    } catch (err) {
      return smartRouteMatchData;
    }
  },
};

export default deliveryService;
