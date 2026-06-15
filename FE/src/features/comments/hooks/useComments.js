/**
 * useComments.js - Custom hook fetch va tao binh luan bai viet va san pham.
 */
import { useEffect, useState } from "react";
import { createComment, getCommentsByPostId, createProductComment, getCommentsByProductId } from "../api";

/**
 * Hook quan ly danh sach comments cua mot bai viet.
 * @param {string} postId - Id bai viet
 * @param {Array} initialComments - Comments ban dau tu post detail
 * @returns {{ comments: Array, loading: boolean, error: string|null, createPostComment: Function, refetch: Function }}
 */
export function useComments(postId, initialComments = []) {
  const [comments, setComments] = useState(initialComments);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setComments(initialComments || []);
  }, [initialComments]);

  useEffect(() => {
    let cancelled = false;

    async function fetchComments() {
      if (!postId) {
        setComments(initialComments || []);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await getCommentsByPostId(postId);

        if (!cancelled) {
          setComments(response.data || []);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || err.message);
          setLoading(false);
        }
      }
    }

    fetchComments();

    return () => {
      cancelled = true;
    };
  }, [postId, refreshKey]);

  /**
   * Tao comment moi roi refetch de dong bo voi backend.
   * @param {Object} payload - Du lieu comment gui len API
   * @returns {Promise<object>} Comment vua tao
   */
  async function createPostComment(payload) {
    const response = await createComment(payload);
    setRefreshKey((currentKey) => currentKey + 1);
    return response.data;
  }

  const refetch = () => {
    setRefreshKey((currentKey) => currentKey + 1);
  };

  return { comments, loading, error, createPostComment, refetch };
}

/**
 * Hook quan ly danh sach danh gia cua mot san pham.
 * @param {string} productId - Id san pham
 * @param {Array} initialComments - Danh gia ban dau
 * @returns {{ comments: Array, loading: boolean, error: string|null, submitReview: Function, refetch: Function }}
 */
export function useProductComments(productId, initialComments = []) {
  const [comments, setComments] = useState(initialComments);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchComments() {
      if (!productId) {
        setComments([]);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await getCommentsByProductId(productId);

        if (!cancelled) {
          setComments(response.data || []);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || err.message);
          setLoading(false);
        }
      }
    }

    fetchComments();

    return () => {
      cancelled = true;
    };
  }, [productId, refreshKey]);

  /**
   * Gui danh gia san pham moi roi refetch.
   * @param {Object} payload - Du lieu danh gia gui len API
   * @returns {Promise<object>} Danh gia vua tao
   */
  async function submitReview(payload) {
    const response = await createProductComment(payload);
    setRefreshKey((currentKey) => currentKey + 1);
    return response.data;
  }

  const refetch = () => {
    setRefreshKey((currentKey) => currentKey + 1);
  };

  return { comments, loading, error, submitReview, refetch };
}

export default useComments;
