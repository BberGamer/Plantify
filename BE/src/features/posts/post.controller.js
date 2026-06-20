// post.controller.js - Xử lý request/response cho bài viết Plantify
const postService = require('./post.service');
const apiResponse = require('../../utils/apiResponse');

/**
 * Xử lý request POST /api/posts.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Middleware xử lý lỗi
 */
async function createPost(req, res, next) {
  try {
    const post = await postService.createPost(req.body, req.user);
    return apiResponse.success(res, 'Tạo bài viết thành công, đang chờ duyệt', post, 201);
  } catch (error) {
    return next(error);
  }
}

/**
 * Xử lý request GET /api/posts.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Middleware xử lý lỗi
 */
async function getAllPosts(req, res, next) {
  try {
    const posts = await postService.getAllPosts(req.query);
    return apiResponse.success(res, 'Lấy danh sách bài viết thành công', posts);
  } catch (error) {
    return next(error);
  }
}

/**
 * Xử lý request GET /api/posts/featured.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Middleware xử lý lỗi
 */
async function getFeaturedPosts(req, res, next) {
  try {
    const posts = await postService.getFeaturedPosts(req.query);
    return apiResponse.success(res, 'Lấy danh sách bài viết nổi bật thành công', posts);
  } catch (error) {
    return next(error);
  }
}

/**
 * Xử lý request GET /api/posts/:id.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Middleware xử lý lỗi
 */
async function getPostById(req, res, next) {
  try {
    const post = await postService.getPostById(req.params.id);
    return apiResponse.success(res, 'Lấy chi tiết bài viết thành công', post);
  } catch (error) {
    return next(error);
  }
}

module.exports = { createPost, getAllPosts, getFeaturedPosts, getPostById };
