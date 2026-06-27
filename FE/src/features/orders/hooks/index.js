import { useState, useEffect } from "react";
import { getMyOrders } from "../api";
import { useAuth } from "@/features/auth/hooks";

/**
 * Hook lấy toàn bộ danh sách đơn hàng của user hiện tại.
 * @returns {{ orders: Array, loading: boolean, error: string|null, refetch: Function }}
 */
export function useMyOrders() {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      setOrders([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    getMyOrders()
      .then((res) => {
        if (!cancelled) {
          // getMyOrders() returns the raw Axios response.
          // The backend sends orders wrapped in: success(res, '...', { orders })
          // So the orders array is in: res.data?.data?.orders
          setOrders(res?.data?.data?.orders || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.response?.data?.message || err.message);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, refreshKey]);

  const refetch = () => setRefreshKey((k) => k + 1);

  return { orders, loading, error, refetch };
}
