// src/hooks/usePlants.js - Hook quan ly trang thai danh sach cay & danh muc
import { useState, useEffect, useCallback } from 'react';
import plantService from '../services/plantService';

/**
 * Hook lay danh sach cay voi filter + search
 * @param {string} categoryId - ID danh muc ('' = tat ca)
 * @param {string} search     - Tu khoa tim kiem
 */
export function usePlants(categoryId = '', search = '') {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);

  const fetchPlants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await plantService.getPlants({ categoryId, search, limit: 50 });
      if (res.success) {
        setPlants(res.data.plants || []);
        setTotal(res.data.total || 0);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Không thể tải danh sách cây.');
    } finally {
      setLoading(false);
    }
  }, [categoryId, search]);

  useEffect(() => {
    fetchPlants();
  }, [fetchPlants]);

  return { plants, loading, error, total, refetch: fetchPlants };
}

/**
 * Hook lay danh sach danh muc cay
 */
export function usePlantCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await plantService.getCategories();
        if (res.success) {
          // Them "Tat ca" vao dau danh sach
          setCategories([
            { _id: '', category_name: 'Tất cả' },
            ...(res.data || []),
          ]);
        }
      } catch (err) {
        setError(err?.response?.data?.message || 'Không thể tải danh mục.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { categories, loading, error };
}

/**
 * Hook lay chi tiet mot cay
 * @param {string} id - ObjectId cua cay
 */
export function usePlantDetail(id) {
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await plantService.getPlantById(id);
        if (res.success) setPlant(res.data);
      } catch (err) {
        setError(err?.response?.data?.message || 'Không thể tải thông tin cây.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  return { plant, loading, error };
}
