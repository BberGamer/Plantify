/**
 * useComments.js - Custom hook fetch va tao binh luan bai viet.
 */
import { useEffect, useState } from "react";
import { createComment, getCommentsByPostId } from "../api";

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

export default useComments;
