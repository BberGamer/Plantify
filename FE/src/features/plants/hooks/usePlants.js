// usePlants.js - Custom hook fetch danh sách plants
import { useEffect, useState } from "react";
import { getPlants, getTags } from "../api";

/**
 * Hook lấy danh sách cây từ API.
 * @param {Object} filters - Filter truyền lên API như search, tag, page, limit
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
