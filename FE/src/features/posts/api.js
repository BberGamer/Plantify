/**
 * api.js - Cac ham goi API lien quan toi posts.
 */
import { api } from "@/lib/api";

/**
 * Lấy danh sách bài viết từ backend.
 * @param {Object} params - Query params nhu page, limit, category, title
 * @returns {Promise<object>} Response data từ API
 */
export const getPosts = async (params = {}) => {
  const response = await api.get("/posts", { params });
  return response.data;
};

/**
 * Lấy danh sách bài viết nổi bật từ backend.
 * @param {Object} params - Query params như limit
 * @returns {Promise<object>} Response data từ API
 */
export const getFeaturedPosts = async (params = {}) => {
  const response = await api.get("/posts/featured", { params });
  return response.data;
};

export const getMyPosts = async (params = {}) => {
  const response = await api.get("/posts/my", { params });
  return response.data;
};

/**
 * Lấy chi tiết bài viết theo id từ backend.
 * @param {string} id - Id bài viết
 * @returns {Promise<object>} Response data từ API
 */
export const getPostById = async (id) => {
  const response = await api.get(`/posts/${id}`);
  return response.data;
};

export const createPost = async (data) => {
  const response = await api.post("/posts", data);
  return response.data;
};

export const updatePost = async (id, data) => {
  const response = await api.patch(`/posts/${id}`, data);
  return response.data;
};

export const deletePost = async (id) => {
  const response = await api.delete(`/posts/${id}`);
  return response.data;
};
