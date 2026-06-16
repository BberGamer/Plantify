// useCategories.js - Custom hook để fetch danh sách danh mục sản phẩm
import { useState, useEffect, useCallback } from "react";
import { getCategories } from "../api";

/**
 * Hook lấy danh sách danh mục sản phẩm
 * @returns {{ categories: array, loading: boolean, error: string|null, refetch: function }}
 */
export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await getCategories();
      setCategories(res.data || []);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories
  };
}

export default useCategories;
