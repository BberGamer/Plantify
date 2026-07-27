// useManageOrders.js - Quản lý trạng thái, bộ lọc và thao tác trên danh sách đơn hàng
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { getAllOrders, updateOrder } from "@/features/orders/api";

export function useManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllOrders();
      setOrders(response.data?.data?.orders || []);
      return response;
    } catch (requestError) {
      setError(requestError);
      console.error("Lỗi fetch orders:", requestError);
      toast.error(
        requestError.response?.data?.message
        || requestError.message
        || "Không thể tải danh sách đơn hàng."
      );
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

  const updateStatus = useCallback(async (orderId, status) => {
    const response = await updateManagedOrder(orderId, { status });
    await refetch();
    return response;
  }, [refetch, updateManagedOrder]);

  const cancelOrder = useCallback(async (orderId, cancellationReason) => {
    setCancelling(true);
    try {
      const response = await updateManagedOrder(orderId, {
        status: "cancelled",
        cancellationReason,
      });
      await refetch();
      return response;
    } finally {
      setCancelling(false);
    }
  }, [refetch, updateManagedOrder]);

  return {
    orders,
    setOrders,
    loading,
    error,
    updating,
    cancelling,
    refetch,
    updateStatus,
    cancelOrder,
  };
}
