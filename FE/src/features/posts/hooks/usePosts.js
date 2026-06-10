// usePosts.js - Custom hook fetch danh sách posts
import { useEffect, useState } from "react";
import { getPosts } from "../api";

/**
 * Hook lấy danh sách bài viết từ API.
 * @param {Object} filters - Filter truyền lên API như page, limit, category
 * @returns {{ posts: Array, loading: boolean, error: string|null, refetch: Function }}
 */
export function usePosts(filters = {}) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const filterKey = JSON.stringify(filters);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    getPosts(filters)
      .then((response) => {
        if (!cancelled) {
          setPosts(response.data || []);
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

  return { posts, loading, error, refetch };
}

export default usePosts;
