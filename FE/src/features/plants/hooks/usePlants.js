// usePlants.js - Custom hook fetch danh sách plants
import { useEffect, useState } from "react";
import { getPlants } from "../api";

/**
 * Hook lấy danh sách cây từ API.
 * @param {Object} filters - Filter truyền lên API như category, page, limit
 * @returns {{ plants: Array, loading: boolean, error: string|null, refetch: Function }}
 */
export function usePlants(filters = {}) {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const filterKey = JSON.stringify(filters);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    getPlants(filters)
      .then((response) => {
        if (!cancelled) {
          const newPlants = response.data || [];
          const limit = filters.limit || 6;
          
          setHasMore(newPlants.length >= limit);

          if (filters.page && filters.page > 1) {
            setPlants((prev) => [...prev, ...newPlants]);
          } else {
            setPlants(newPlants);
          }
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

  return { plants, loading, error, hasMore, refetch };
}

export default usePlants;
