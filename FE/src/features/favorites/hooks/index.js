// hooks/index.js - Custom hooks cho chức năng cây yêu thích
import { useState, useEffect, useCallback } from "react";
import { getMyFavorites, addFavorite, removeFavorite, checkFavorite } from "../api";
import { useAuth } from "@/features/auth/hooks";
import { toast } from "sonner";

/**
 * Hook quản lý trạng thái yêu thích của một cây cụ thể.
 * Tự động kiểm tra trạng thái từ DB khi user đã đăng nhập.
 * @param {string} plantId
 * @returns {{ isFavorited: boolean, loading: boolean, toggle: Function }}
 */
export function useFavorite(plantId) {
  const { isAuthenticated } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  // Kiểm tra trạng thái từ server khi component mount
  useEffect(() => {
    if (!isAuthenticated || !plantId) {
      setIsFavorited(false);
      return;
    }

    let cancelled = false;
    checkFavorite(plantId)
      .then((res) => {
        if (!cancelled) setIsFavorited(res?.data?.favorited ?? false);
      })
      .catch(() => {
        // Bỏ qua lỗi check (vd: chưa đăng nhập)
      });

    return () => { cancelled = true; };
  }, [plantId, isAuthenticated]);

  /**
   * Toggle trạng thái yêu thích: thêm hoặc xóa khỏi DB
   */
  const toggle = useCallback(
    async (e) => {
      // Ngăn sự kiện click lan ra ngoài (ví dụ Link)
      e?.stopPropagation?.();
      e?.preventDefault?.();

      if (!isAuthenticated) {
        toast.error("Vui lòng đăng nhập để lưu cây yêu thích!");
        return;
      }

      if (loading) return;
      setLoading(true);

      try {
        if (isFavorited) {
          await removeFavorite(plantId);
          setIsFavorited(false);
          toast.success("Đã xóa khỏi danh sách yêu thích!");
        } else {
          await addFavorite(plantId);
          setIsFavorited(true);
          toast.success("Đã thêm vào danh sách yêu thích!");
        }
      } catch {
        toast.error("Có lỗi xảy ra, vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    },
    [plantId, isFavorited, loading, isAuthenticated]
  );

  return { isFavorited, loading, toggle };
}

/**
 * Hook lấy toàn bộ danh sách cây yêu thích của user hiện tại.
 * @returns {{ favorites: Array, loading: boolean, error: string|null, refetch: Function }}
 */
export function useMyFavorites() {
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      setFavorites([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    getMyFavorites()
      .then((res) => {
        if (!cancelled) {
          setFavorites(res?.data || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.response?.data?.message || err.message);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [isAuthenticated, refreshKey]);

  const refetch = () => setRefreshKey((k) => k + 1);

  return { favorites, loading, error, refetch };
}
