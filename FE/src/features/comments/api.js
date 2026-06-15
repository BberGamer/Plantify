/**
 * api.js - Cac ham goi API lien quan toi comments.
 */
import { api } from "@/lib/api";

/**
 * Lay danh sach binh luan cua mot bai viet.
 * @param {string} postId - Id bai viet
 * @returns {Promise<object>} Response data tu API
 */
export const getCommentsByPostId = async (postId) => {
  const response = await api.get(`/comments/post/${postId}`);
  return response.data;
};

/**
 * Tao binh luan moi cho bai viet.
 * @param {Object} payload - Du lieu comment gom userId, postId, content, rating
 * @returns {Promise<object>} Response data tu API
 */
export const createComment = async (payload) => {
  const response = await api.post("/comments", payload);
  return response.data;
};

/**
 * Lay danh sach danh gia cua mot san pham.
 * @param {string} productId - Id san pham
 * @returns {Promise<object>} Response data tu API
 */
export const getCommentsByProductId = async (productId) => {
  const response = await api.get(`/comments/product/${productId}`);
  return response.data;
};

/**
 * Tao danh gia moi cho san pham.
 * @param {Object} payload - Du lieu danh gia gom userId, productId, content, rating
 * @returns {Promise<object>} Response data tu API
 */
export const createProductComment = async (payload) => {
  const response = await api.post("/comments/product", payload);
  return response.data;
};
