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
  const [refreshKey, setRefreshKey] = useState(0);

  const filterKey = JSON.stringify(filters);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    getPlants(filters)
      .then((response) => {
        if (!cancelled) {
          setPlants(response.data || []);
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

  return { plants, loading, error, refetch };
}

export default usePlants;
