// useDashboardStats.js - Quản lý trạng thái tải số liệu bảng tổng quan kinh doanh
import { useEffect, useState } from "react";
import { getDashboardStats } from "@/features/orders/api";

const EMPTY_DASHBOARD_STATS = {
  totalRevenue: 0,
  monthlyRevenue: [],
};

/** Tải thống kê doanh thu và đơn hàng cho dashboard kinh doanh. @returns {Object} Dữ liệu thống kê, trạng thái và refetch. */
export function useDashboardStats() {
  const [dashboardStats, setDashboardStats] = useState(EMPTY_DASHBOARD_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getDashboardStats()
      .then((response) => {
        if (cancelled) return;
        const stats = response?.data?.data || EMPTY_DASHBOARD_STATS;
        setDashboardStats({
          totalRevenue: Number(stats.totalRevenue || 0),
          monthlyRevenue: Array.isArray(stats.monthlyRevenue)
            ? stats.monthlyRevenue.map((item) => ({
                month: item.month,
                revenue: Number(item.revenue || 0),
              }))
            : [],
          year: stats.year,
        });
        setLoading(false);
      })
      .catch((requestError) => {
        if (cancelled) return;
        setError(requestError.response?.data?.message || requestError.message);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { dashboardStats, loading, error };
}
