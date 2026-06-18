// usePlantCategories.js - Hook lấy danh sách danh mục cây
import { useState, useEffect, useCallback } from "react";
import { getPlantCategories } from "../api";

/**
 * Hook lấy danh sách danh mục cây
 * @returns {{ categories: array, loading: boolean, error: string|null, refetch: function }}
 */
export function usePlantCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPlantCategories();
      setCategories(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, error, refetch: fetchCategories };
}
