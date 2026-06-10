// post.service.js - Business logic cho bài viết Plantify
const mongoose = require('mongoose');
const Post = require('./post.model');

function buildPostIdQuery(id) {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return { $or: [{ _id: id }, { id }] };
  }

  return { id };
}

/**
 * Lấy danh sách bài viết, có hỗ trợ lọc theo category và phân trang.
 * @param {Object} filters - Query filter từ request
 * @returns {Promise<Array>} Danh sách bài viết
 */
async function getAllPosts(filters = {}) {
  const { category, page, limit } = filters;
  const query = { isActive: true };

  if (category) {
    query.category = category;
  }

  let postQuery = Post.find(query).sort({ createdAt: -1 });

  if (page && limit) {
    const safePage = Math.max(Number(page), 1);
    const safeLimit = Math.max(Number(limit), 1);
    postQuery = postQuery.skip((safePage - 1) * safeLimit).limit(safeLimit);
  }

  return postQuery.lean();
}

/**
 * Lấy chi tiết bài viết theo Mongo _id hoặc field id.
 * @param {string} id - Id bài viết
 * @returns {Promise<Object>} Chi tiết bài viết
 */
async function getPostById(id) {
  const post = await Post.findOne({ ...buildPostIdQuery(id), isActive: true }).lean();

  if (!post) {
    const error = new Error('Không tìm thấy bài viết');
    error.statusCode = 404;
    throw error;
  }

  return post;
}

/**
 * Lấy danh sách bài viết nổi bật.
 * @param {Object} filters - Query filter từ request
 * @returns {Promise<Array>} Danh sách bài viết nổi bật
 */
async function getFeaturedPosts(filters = {}) {
  const safeLimit = Math.max(Number(filters.limit) || 3, 1);

  return Post.find({ isActive: true, isFeatured: true })
    .sort({ createdAt: -1 })
    .limit(safeLimit)
    .lean();
}

module.exports = { getAllPosts, getPostById, getFeaturedPosts };
