import React, { createContext, useState, useContext, useEffect } from 'react';
import deliveryService from '../services/deliveryService';
import { mockDeliveries } from '../mock/deliveries';

const DeliveryContext = createContext();

export const DeliveryProvider = ({ children }) => {
  const [deliveries, setDeliveries] = useState(mockDeliveries);
  const [activeDelivery, setActiveDelivery] = useState(
    mockDeliveries.find((d) => d.status === 'ACTIVE') || mockDeliveries[0]
  );
  const [deliveryStage, setDeliveryStage] = useState(
    activeDelivery?.statusStep || 'IN_TRANSIT'
  );
  const [isLoading, setIsLoading] = useState(false);

  const refreshDeliveries = async () => {
    setIsLoading(true);
    try {
      const data = await deliveryService.getDeliveries();
      if (Array.isArray(data) && data.length > 0) {
        setDeliveries([...data]);
        const currentActive = data.find((d) => d.status === 'ACTIVE');
        if (currentActive) {
          setActiveDelivery(currentActive);
          setDeliveryStage(currentActive.statusStep);
        }
      }
    } catch (err) {
      console.log('Deliveries sync handled with local cache');
    } finally {
      setIsLoading(false);
    }
  };

  const acceptDelivery = async (id) => {
    setIsLoading(true);
    try {
      await deliveryService.acceptDelivery(id);
      const target = deliveries.find((d) => d.id === id);
      if (target) {
        target.status = 'ACTIVE';
        target.statusStep = 'PICKUP';
        setActiveDelivery({ ...target });
        setDeliveryStage('PICKUP');
      }
      setDeliveries([...deliveries]);
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const updateStage = async (stage) => {
    if (!activeDelivery) return;
    setIsLoading(true);
    try {
      await deliveryService.updateDeliveryStatus(activeDelivery.id, stage);
      setDeliveryStage(stage);
      setActiveDelivery((prev) => ({
        ...prev,
        statusStep: stage,
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const completeDelivery = async (podData) => {
    if (!activeDelivery) return;
    setIsLoading(true);
    try {
      const res = await deliveryService.submitPOD(activeDelivery.id, podData);
      setDeliveryStage('DELIVERED');
      setActiveDelivery((prev) => ({
        ...prev,
        status: 'COMPLETED',
        statusStep: 'DELIVERED',
      }));
      setDeliveries((prev) =>
        prev.map((d) =>
          d.id === activeDelivery.id
            ? { ...d, status: 'COMPLETED', statusStep: 'DELIVERED' }
            : d
        )
      );
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const reportException = async (exceptionData) => {
    if (!activeDelivery) return;
    setIsLoading(true);
    try {
      const res = await deliveryService.reportException(activeDelivery.id, exceptionData);
      setActiveDelivery((prev) => ({
        ...prev,
        status: 'EXCEPTION',
      }));
      setDeliveries((prev) =>
        prev.map((d) =>
          d.id === activeDelivery.id ? { ...d, status: 'EXCEPTION' } : d
        )
      );
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DeliveryContext.Provider
      value={{
        deliveries,
        activeDelivery,
        deliveryStage,
        isLoading,
        acceptDelivery,
        updateStage,
        completeDelivery,
        reportException,
        refreshDeliveries,
        setActiveDelivery,
      }}
    >
      {children}
    </DeliveryContext.Provider>
  );
};

export const useDelivery = () => useContext(DeliveryContext);
export default DeliveryContext;
