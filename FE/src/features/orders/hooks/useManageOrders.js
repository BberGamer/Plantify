import { useCallback, useEffect, useState } from "react";
import { getAllOrders, updateOrder } from "@/features/orders/api";

export function useManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllOrders();
      setOrders(response.data?.data?.orders || []);
      return response;
    } catch (requestError) {
      setError(requestError);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const updateManagedOrder = useCallback(async (orderId, payload) => {
    setUpdating(true);
    try {
      return await updateOrder(orderId, payload);
    } finally {
      setUpdating(false);
    }
  }, []);

  return {
    orders,
    setOrders,
    loading,
    error,
    updating,
    refetch,
    updateManagedOrder,
  };
}
