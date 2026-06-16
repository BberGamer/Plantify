/**
 * usePosts.js - Custom hooks fetch danh sach va chi tiet posts.
 */
import { useEffect, useMemo, useState } from "react";
import { getPostById, getPosts } from "../api";

/**
 * Hook lấy danh sách bài viết từ API.
 * @param {Object} filters - Filter truyen len API nhu page, limit, category, title/search/searchTerm
 * @returns {{ posts: Array, loading: boolean, error: string|null, searchTerm: string, setSearchTerm: Function, category: string, setCategory: Function, refetch: Function }}
 */
export function usePosts(filters = {}) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState(filters.searchTerm || filters.search || filters.title || "");
  const [category, setCategory] = useState(filters.category || "");
  const baseFilterKey = JSON.stringify(filters);

  useEffect(() => {
    setSearchTerm(filters.searchTerm || filters.search || filters.title || "");
  }, [filters.searchTerm, filters.search, filters.title]);

  useEffect(() => {
    setCategory(filters.category || "");
  }, [filters.category]);

  const requestFilters = useMemo(() => {
    const {
      searchTerm: _searchTerm,
      search: _search,
      title: _title,
      category: _category,
      ...baseFilters
    } = filters;
    const nextFilters = { ...baseFilters };
    const trimmedSearchTerm = searchTerm.trim();

    if (category) {
      nextFilters.category = category;
    }

    if (trimmedSearchTerm) {
      nextFilters.title = trimmedSearchTerm;
    }

    return nextFilters;
  }, [baseFilterKey, searchTerm, category]);

  const filterKey = useMemo(
    () =>
      Object.entries(requestFilters)
        .filter(([, value]) => value !== undefined && value !== null && value !== "")
        .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
        .map(([key, value]) => `${key}:${value}`)
        .join("|"),
    [requestFilters]
  );

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    getPosts(requestFilters)
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

  return { posts, loading, error, searchTerm, setSearchTerm, category, setCategory, refetch };
}

/**
 * Hook lay chi tiet bai viet kem danh sach binh luan tu API.
 * @param {string} id - Id bai viet
 * @returns {{ post: object|null, comments: Array, loading: boolean, error: string|null, refetch: Function }}
 */
export function usePostDetail(id) {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchPostDetail() {
      if (!id) {
        setPost(null);
        setComments([]);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await getPostById(id);
        const postData = response.data || null;

        if (!cancelled) {
          setPost(postData);
          setComments(postData?.comments || []);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || err.message);
          setPost(null);
          setComments([]);
          setLoading(false);
        }
      }
    }

    fetchPostDetail();

    return () => {
      cancelled = true;
    };
  }, [id, refreshKey]);

  const refetch = () => {
    setRefreshKey((currentKey) => currentKey + 1);
  };

  return { post, comments, loading, error, refetch };
}

export default usePosts;
