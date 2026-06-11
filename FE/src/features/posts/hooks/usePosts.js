/**
 * usePosts.js - Custom hooks fetch danh sach va chi tiet posts.
 */
import { useEffect, useState } from "react";
import { getPostById, getPosts } from "../api";

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
