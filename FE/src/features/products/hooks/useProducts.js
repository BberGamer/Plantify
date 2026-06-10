// useProducts.js - Custom hook để fetch danh sách sản phẩm
import { useState, useEffect, useCallback } from "react";
import { getProducts } from "../api";

/**
 * Hook lấy danh sách sản phẩm theo bộ lọc
 * @param {object} filters - Các tham số bộ lọc
 * @returns {{ products: array, total: number, pages: number, currentPage: number, loading: boolean, error: string|null, refetch: function }}
 */
export function useProducts(filters) {
  const [data, setData] = useState({
    products: [],
    total: 0,
    pages: 0,
    currentPage: 1
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Stringify filters to use as dependency in useEffect
  const filtersKey = JSON.stringify(filters);

  const fetchProducts = useCallback(async () => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    try {
      const parsedFilters = JSON.parse(filtersKey);
      const res = await getProducts(parsedFilters);
      if (!cancelled) {
        setData({
          products: res.data?.products || [],
          total: res.data?.total || 0,
          pages: res.data?.pages || 0,
          currentPage: res.data?.currentPage || 1
        });
        setLoading(false);
      }
    } catch (err) {
      if (!cancelled) {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      }
    }

    return () => {
      cancelled = true;
    };
  }, [filtersKey]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products: data.products,
    total: data.total,
    pages: data.pages,
    currentPage: data.currentPage,
    loading,
    error,
    refetch: fetchProducts
  };
}

export default useProducts;
