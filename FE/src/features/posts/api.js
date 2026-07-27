// api.js - Gọi API danh sách, chi tiết và thao tác bài viết
import { api } from "@/lib/api";

function withoutTags(value = {}) {
  if (value instanceof FormData) {
    value.delete("tags");
    return value;
  }

  const { tags: _tags, ...rest } = value || {};
  return rest;
}

/**
 * Lấy danh sách bài viết từ backend.
 * @param {Object} params - Query params nhu page, limit, category, title
 * @returns {Promise<object>} Response data từ API
 */
export const getPosts = async (params = {}) => {
  const response = await api.get("/posts", { params: withoutTags(params) });
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

/** Lấy bài viết của người dùng hiện tại theo query. @param {Object} [params={}] - Query API. @returns {Promise<Object>} Dữ liệu danh sách bài viết. */
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

/** Tạo bài viết mới. @param {Object|FormData} data - Payload bài viết. @returns {Promise<Object>} Bài viết vừa tạo. */
export const createPost = async (data) => {
  const response = await api.post("/posts", withoutTags(data));
  return response.data;
};

/** Cập nhật bài viết. @param {string} id - ID bài viết. @param {Object|FormData} data - Payload cập nhật. @returns {Promise<Object>} Bài viết sau cập nhật. */
export const updatePost = async (id, data) => {
  const response = await api.patch(`/posts/${id}`, withoutTags(data));
  return response.data;
};

/** Xóa bài viết. @param {string} id - ID bài viết. @returns {Promise<Object>} Kết quả xóa. */
export const deletePost = async (id) => {
  const response = await api.delete(`/posts/${id}`);
  return response.data;
};
