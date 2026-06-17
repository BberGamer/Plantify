// usePlants.js - Custom hooks cho plants CRUD
// Cung cấp: usePlants, usePlant, useCreatePlant, useUpdatePlant, useDeletePlant
import { useEffect, useState } from "react";
import { getPlants, getTags, getPlantById, createPlant, updatePlant, deletePlant } from "../api";

/**
 * Hook lấy danh sách cây từ API.
 * @param {Object} filters - Filter truyền lên API như search, category, tag, page, limit
 * @returns {{ plants: Array, loading: boolean, error: string|null, total: number, pages: number, currentPage: number, refetch: Function }}
 */
export function usePlants(filters = {}) {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const filterKey = JSON.stringify(filters);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    getPlants(filters)
      .then((response) => {
        if (!cancelled) {
          const data = response.data || {};
          setPlants(data.plants || []);
          setTotal(data.total || 0);
          setPages(data.pages || 1);
          setCurrentPage(data.currentPage || 1);
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
  }, [filterKey, refreshKey]);

  const refetch = () => {
    setRefreshKey((currentKey) => currentKey + 1);
  };

  return { plants, loading, error, total, pages, currentPage, refetch };
}

/**
 * Hook lấy chi tiết một cây.
 * @param {string|undefined} id - Plant id
 * @returns {{ plant: object|null, loading: boolean, error: string|null }}
 */
export function usePlant(id) {
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setPlant(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    getPlantById(id, true)
      .then((response) => {
        if (!cancelled) {
          setPlant(response.data || null);
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
  }, [id]);

  return { plant, loading, error };
}

/**
 * Hook tạo mới một cây.
 * @returns {{ create: Function, loading: boolean, error: string|null, success: boolean }}
 */
export function useCreatePlant() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const create = async (data) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await createPlant(data);
      setSuccess(true);
      setLoading(false);
      return response;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
      throw err;
    }
  };

  return { create, loading, error, success };
}

/**
 * Hook cập nhật một cây.
 * @returns {{ update: Function, loading: boolean, error: string|null, success: boolean }}
 */
export function useUpdatePlant() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const update = async (id, data) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await updatePlant(id, data);
      setSuccess(true);
      setLoading(false);
      return response;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
      throw err;
    }
  };

  return { update, loading, error, success };
}

/**
 * Hook xóa một cây.
 * @returns {{ remove: Function, loading: boolean, error: string|null, success: boolean }}
 */
export function useDeletePlant() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const remove = async (id) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await deletePlant(id);
      setSuccess(true);
      setLoading(false);
      return response;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
      throw err;
    }
  };

  return { remove, loading, error, success };
}

/**
 * Hook lấy danh sách tags từ API.
 * @returns {{ tags: Array, loading: boolean, error: string|null }}
 */
export function usePlantTags() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getTags()
      .then((response) => {
        setTags(response.data || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      });
  }, []);

  return { tags, loading, error };
}

export default usePlants;
