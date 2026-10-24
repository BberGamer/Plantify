import { useCallback, useMemo, useRef, useState } from "react";
import { createEmptyPagination } from "../services/listAdapters";
import getErrorMessage from "../utils/getErrorMessage";
import useScreenScope from "./useScreenScope";

// Chỉ sở hữu vòng đời danh sách; form, bộ lọc và mutation vẫn ở hook domain.
export default function usePaginatedList(
  fetchPage,
  { limit, autoLoad = true, enabled = true } = {},
) {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(() =>
    createEmptyPagination(limit),
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const request = useRef(0);
  const pageRef = useRef(1);
  const fetchRef = useRef(fetchPage);
  fetchRef.current = fetchPage;
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;
  const context = useMemo(
    () => ({ fetchPage, enabled, autoLoad, limit }),
    [fetchPage, enabled, autoLoad, limit],
  );
  const { capture, isActive } = useScreenScope(
    () => {
      if (autoLoad) {
        setItems([]);
        load(1);
      }
    },
    undefined,
    context,
  );

  const invalidate = useCallback(() => {
    ++request.current;
    setLoading(true);
    setRefreshing(false);
    setError("");
  }, []);

  const load = useCallback(
    async (page = pageRef.current, refresh = false) => {
      if (!enabledRef.current || !isActive() || !Number.isSafeInteger(page) || page < 1) return;
      const requestId = ++request.current;
      const fetch = fetchRef.current;
      const inScope = capture();
      const isCurrent = () =>
        inScope() && enabledRef.current &&
        fetch === fetchRef.current && requestId === request.current;
      pageRef.current = page;
      setLoading(!refresh);
      setRefreshing(refresh);
      setError("");
      try {
        let requestedPage = page;
        for (;;) {
          const response = await fetch({ page: requestedPage, limit });
          if (!isCurrent()) return;
          if (response?.success !== true || !Array.isArray(response.data?.items) ||
              !Number.isSafeInteger(response.data?.pagination?.totalPages) ||
              response.data.pagination.totalPages < 0) {
            throw Object.assign(new Error("Dữ liệu danh sách không hợp lệ."), { code: "INVALID_RESPONSE" });
          }
          const { items: nextItems, pagination: nextPagination } =
            response.data;
          if (nextPagination.page !== requestedPage) {
            throw Object.assign(new Error("Dữ liệu phân trang không hợp lệ."), {
              code: "INVALID_RESPONSE",
            });
          }
          const lastPage = Math.max(1, nextPagination.totalPages);
          if (requestedPage > lastPage) {
            // Không công bố trang trống ngoài phạm vi; tải lại trang cuối cùng còn tồn tại.
            requestedPage = lastPage;
            continue;
          }
          pageRef.current = requestedPage;
          setItems(nextItems);
          setPagination(nextPagination);
          return;
        }
      } catch (failure) {
        if (isCurrent())
          setError(
            getErrorMessage(
              failure,
              "Không thể tải danh sách. Vui lòng thử lại.",
            ),
          );
      } finally {
        if (isCurrent()) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [limit, capture, isActive],
  );

  const refresh = useCallback(() => load(undefined, true), [load]);
  const retry = useCallback(() => load(), [load]);
  return {
    items,
    setItems,
    pagination,
    loading,
    refreshing,
    error,
    load,
    refresh,
    retry,
    invalidate,
  };
}
