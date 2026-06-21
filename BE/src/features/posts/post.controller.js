// post.controller.js - Xu ly request/response cho bai viet Plantify
const postService = require('./post.service');
const apiResponse = require('../../utils/apiResponse');

function getFileDataUrl(file) {
  return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
}

function buildPostPayload(req) {
  const uploadedThumbnail = req.files?.thumbnail?.[0];
  const uploadedImages = req.files?.images || [];
  const imageUrls = uploadedImages.map((file) => getFileDataUrl(file));
  const thumbnailUrl = uploadedThumbnail ? getFileDataUrl(uploadedThumbnail) : '';

  return {
    ...req.body,
    ...(thumbnailUrl ? { thumbnail: thumbnailUrl } : {}),
    ...(imageUrls.length ? { images: imageUrls } : {}),
  };
}

/**
 * Xu ly request POST /api/posts.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Middleware xu ly loi
 */
async function createPost(req, res, next) {
  try {
    const post = await postService.createPost(buildPostPayload(req), req.user);
    return apiResponse.success(res, 'Tao bai viet thanh cong, dang cho duyet', post, 201);
  } catch (error) {
    return next(error);
  }
}

/**
 * Xu ly request PATCH/PUT /api/posts/:id.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Middleware xu ly loi
 */
async function updatePost(req, res, next) {
  try {
    const post = await postService.updatePost(req.params.id, buildPostPayload(req), req.user);
    return apiResponse.success(res, 'Cap nhat bai viet thanh cong, dang cho duyet', post);
  } catch (error) {
    return next(error);
  }
}

/**
 * Xu ly request DELETE /api/posts/:id.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Middleware xu ly loi
 */
async function deletePost(req, res, next) {
  try {
    const post = await postService.deletePost(req.params.id, req.user);
    return apiResponse.success(res, 'Xoa bai viet thanh cong', post);
  } catch (error) {
    return next(error);
  }
}

/**
 * Xu ly request GET /api/posts/my.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Middleware xu ly loi
 */
async function getMyPosts(req, res, next) {
  try {
    const posts = await postService.getMyPosts(req.user, req.query);
    return apiResponse.success(res, 'Lay danh sach bai viet cua toi thanh cong', posts);
  } catch (error) {
    return next(error);
  }
}

/**
 * Xu ly request GET /api/posts.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Middleware xu ly loi
 */
async function getAllPosts(req, res, next) {
  try {
    const posts = await postService.getAllPosts(req.query);
    return apiResponse.success(res, 'Lay danh sach bai viet thanh cong', posts);
  } catch (error) {
    return next(error);
  }
}

/**
 * Xu ly request GET /api/posts/featured.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Middleware xu ly loi
 */
async function getFeaturedPosts(req, res, next) {
  try {
    const posts = await postService.getFeaturedPosts(req.query);
    return apiResponse.success(res, 'Lay danh sach bai viet noi bat thanh cong', posts);
  } catch (error) {
    return next(error);
  }
}

/**
 * Xu ly request GET /api/posts/:id.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Middleware xu ly loi
 */
async function getPostById(req, res, next) {
  try {
    const post = await postService.getPostById(req.params.id);
    return apiResponse.success(res, 'Lay chi tiet bai viet thanh cong', post);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createPost,
  updatePost,
  deletePost,
  getMyPosts,
  getAllPosts,
  getFeaturedPosts,
  getPostById,
};
