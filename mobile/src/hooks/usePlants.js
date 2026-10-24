import getErrorMessage from "../utils/getErrorMessage"; // usePlants.js - Tải dữ liệu cây với bảo vệ response cũ và cleanup khi rời màn hình.
import { useCallback, useEffect, useRef, useState } from "react";
import plantService from "../services/plantService";
import usePaginatedList from "./usePaginatedList";

// Ba tài nguyên dùng chung vòng đời tải, thử lại và bỏ qua request đã hết hiệu lực.
function usePlantResource(fetchResource, initialData) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const request = useRef(0);
  const mounted = useRef(false);
  const refetch = useCallback(async () => {
    const requestId = ++request.current;
    const isCurrent = () => mounted.current && requestId === request.current;
    setLoading(true);
    setError("");
    try {
      const result = await fetchResource();
      if (isCurrent()) setData(result);
    } catch (failure) {
      if (isCurrent())
        setError(getErrorMessage(failure, "Không thể tải dữ liệu cây."));
    } finally {
      if (isCurrent()) setLoading(false);
    }
  }, [fetchResource]);
  useEffect(() => {
    mounted.current = true;
    refetch();
    return () => {
      mounted.current = false;
      ++request.current;
    };
  }, [refetch]);
  return { data, loading, error, refetch };
}

export function usePlants(categoryId = "", search = "") {
  const fetchPage = useCallback(
    (params) => plantService.getPlants({ ...params, categoryId, search }),
    [categoryId, search],
  );
  const list = usePaginatedList(fetchPage, { limit: 50 });
  return {
    plants: list.items,
    total: list.pagination.total,
    pagination: list.pagination,
    loading: list.loading,
    refreshing: list.refreshing,
    error: list.error,
    refetch: list.retry,
    refresh: list.refresh,
    changePage: list.load,
    invalidate: list.invalidate,
  };
}

export function usePlantCategories() {
  const fetchResource = useCallback(async () => {
    const response = await plantService.getCategories();
    if (!response?.success || !Array.isArray(response.data)) {
      throw new Error(response?.message || "Không thể tải danh mục cây.");
    }
    return [{ _id: "", category_name: "Tất cả" }, ...response.data];
  }, []);
  const { data, ...state } = usePlantResource(fetchResource, []);
  return { ...state, categories: data };
}

export function usePlantDetail(id) {
  const fetchResource = useCallback(async () => {
    if (!id) throw new Error("Không tìm thấy mã cây.");
    const response = await plantService.getPlantById(id);
    if (!response?.success || !response.data?._id) {
      throw new Error(response?.message || "Không tìm thấy cây này.");
    }
    return response.data;
  }, [id]);
  const { data, ...state } = usePlantResource(fetchResource, null);
  return { ...state, plant: data };
}
