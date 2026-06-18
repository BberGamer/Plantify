// usePlantCategories.js - Hook lấy danh sách danh mục cây
import { useState, useEffect, useCallback } from "react";
import { getPlantCategories, getPlants } from "../api";

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
      const cats = res.data || [];

      // Lấy tổng số cây để map plantCount
      const allPlantsRes = await getPlants({ limit: 1 });
      const totalPlants = allPlantsRes.data?.total || 0;

      // Nếu có nhiều trang, cần fetch hết để đếm chính xác
      const allPlantsData = totalPlants > 50
        ? await getAllPlantsForCount()
        : allPlantsRes.data?.plants || [];

      const countMap = {};
      allPlantsData.forEach(p => {
        const catId = p.categoryId?._id || p.categoryId;
        if (catId) {
          countMap[catId] = (countMap[catId] || 0) + 1;
        }
      });

      const catsWithCount = cats.map(cat => ({
        ...cat,
        plantCount: countMap[cat._id] || 0,
      }));

      setCategories(catsWithCount);
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

async function getAllPlantsForCount() {
  const all = [];
  let page = 1;
  let hasMore = true;
  while (hasMore) {
    const res = await getPlants({ page, limit: 100 });
    const plants = res.data?.plants || [];
    all.push(...plants);
    if (plants.length < 100) {
      hasMore = false;
    } else {
      page++;
    }
  }
  return all;
}
