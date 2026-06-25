/**
 * usePosts.js - Custom hooks fetch danh sach va chi tiet posts.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { getMyPosts, getPostById, getPosts } from "../api";

function normalizePostsPayload(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.posts)) {
    return payload.posts;
  }

  if (Array.isArray(payload?.items)) {
    return payload.items;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
}

function toPositiveInteger(value, fallback = 1) {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    return fallback;
  }

  return Math.max(Math.trunc(parsedValue), 1);
}

function getPostIdentity(post) {
  return post?._id || post?.id;
}

function mergeUniquePosts(currentPosts, nextPosts) {
  const seenIds = new Set(currentPosts.map(getPostIdentity).filter(Boolean));
  const uniqueNextPosts = nextPosts.filter((post) => {
    const postId = getPostIdentity(post);

    if (!postId) {
      return true;
    }

    if (seenIds.has(postId)) {
      return false;
    }

    seenIds.add(postId);
    return true;
  });

  return [...currentPosts, ...uniqueNextPosts];
}

function getHasMoreFromPayload(payload, items, limit) {
  if (typeof payload?.hasMore === "boolean") {
    return payload.hasMore;
  }

  if (typeof payload?.pagination?.hasMore === "boolean") {
    return payload.pagination.hasMore;
  }

  if (!limit) {
    return false;
  }

  return items.length >= limit;
}

function serializeFilters(filters) {
  return Object.entries(filters)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => `${key}:${value}`)
    .join("|");
}

/**
 * Hook lấy danh sách bài viết từ API.
 * @param {Object} filters - Filter truyen len API nhu page, limit, category, title/search/searchTerm
 * @returns {{ posts: Array, loading: boolean, error: string|null, searchTerm: string, setSearchTerm: Function, category: string, setCategory: Function, refetch: Function }}
 */
export function usePosts(filters = {}) {
  const initialPage = useMemo(() => toPositiveInteger(filters.page, 1), [filters.page]);
  const [allPosts, setAllPosts] = useState([]);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState(filters.searchTerm || filters.search || filters.title || "");
  const [category, setCategory] = useState(filters.category || "");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [debouncedCategory, setDebouncedCategory] = useState(category);
  const baseFilterKey = JSON.stringify(filters);

  useEffect(() => {
    setSearchTerm(filters.searchTerm || filters.search || filters.title || "");
  }, [filters.searchTerm, filters.search, filters.title]);

  useEffect(() => {
    setCategory(filters.category || "");
  }, [filters.category]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setDebouncedCategory(category);
    }, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [searchTerm, category]);

  const baseRequestFilters = useMemo(() => {
    const {
      page: _page,
      searchTerm: _searchTerm,
      search: _search,
      title: _title,
      category: _category,
      ...baseFilters
    } = filters;
    const nextFilters = { ...baseFilters };
    const trimmedSearchTerm = debouncedSearchTerm.trim();

    if (debouncedCategory) {
      nextFilters.category = debouncedCategory;
    }

    if (trimmedSearchTerm) {
      nextFilters.title = trimmedSearchTerm;
    }

    return nextFilters;
  }, [baseFilterKey, debouncedSearchTerm, debouncedCategory]);

  const listKey = useMemo(() => serializeFilters(baseRequestFilters), [baseRequestFilters]);
  const [activeListKey, setActiveListKey] = useState(listKey);

  useEffect(() => {
    setActiveListKey(listKey);
    setPage(initialPage);
    setAllPosts([]);
    setHasMore(true);
  }, [listKey, initialPage]);

  const requestFilters = useMemo(
    () => ({
      ...baseRequestFilters,
      page,
    }),
    [baseRequestFilters, page]
  );

  const filterKey = useMemo(() => serializeFilters(requestFilters), [requestFilters]);

  useEffect(() => {
    if (activeListKey !== listKey) {
      return undefined;
    }

    let cancelled = false;
    const requestLimit = toPositiveInteger(requestFilters.limit, 0);
    const isLoadingMore = page > initialPage;

    setLoading(!isLoadingMore);
    setLoadingMore(isLoadingMore);
    setError(null);

    getPosts(requestFilters)
      .then((response) => {
        if (!cancelled) {
          const nextPosts = normalizePostsPayload(response.data);

          setAllPosts((currentPosts) =>
            isLoadingMore ? mergeUniquePosts(currentPosts, nextPosts) : nextPosts
          );
          setHasMore(getHasMoreFromPayload(response.data, nextPosts, requestLimit));
          setLoading(false);
          setLoadingMore(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.response?.data?.message || err.message);
          setLoading(false);
          setLoadingMore(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeListKey, filterKey, initialPage, listKey, page, refreshKey, requestFilters]);

  const loadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore) {
      return;
    }

    setPage((currentPage) => currentPage + 1);
  }, [hasMore, loading, loadingMore]);

  const refetch = () => {
    setAllPosts([]);
    setHasMore(true);
    setPage(initialPage);
    setRefreshKey((currentKey) => currentKey + 1);
  };

  return {
    posts: allPosts,
    allPosts,
    page,
    hasMore,
    loading,
    loadingMore,
    error,
    searchTerm,
    setSearchTerm,
    category,
    setCategory,
    loadMore,
    refetch,
  };
}

/**
 * Hook lay danh sach bai viet cua customer dang dang nhap.
 * @param {Object} filters - Filter truyen len API nhu page, limit, status
 * @returns {{ posts: Array, loading: boolean, error: string|null, refetch: Function }}
 */
export function useMyPosts(filters = {}) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const filterKey = JSON.stringify(filters);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    getMyPosts(filters)
      .then((response) => {
        if (!cancelled) {
          setPosts(normalizePostsPayload(response.data));
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
