// post.service.js - Business logic cho bài viết Plantify
const mongoose = require('mongoose');
const Post = require('./post.model');
require('../comments/comment.model');

function buildPostIdQuery(id) {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return { _id: id };
  }

  return { _id: null };
}

function getCurrentUserId(currentUser = {}) {
  return currentUser.id || currentUser._id || currentUser.userId;
}

function withRatingPipeline(extraStages = []) {
  return [
    ...extraStages,
    {
      $lookup: {
        from: 'comments',
        localField: '_id',
        foreignField: 'postId',
        as: 'ratingComments',
      },
    },
    {
      $addFields: {
        commentsCount: { $size: '$ratingComments' },
        avgRating: {
          $ifNull: [{ $round: [{ $avg: '$ratingComments.rating' }, 1] }, 0],
        },
      },
    },
    {
      $project: {
        ratingComments: 0,
        id: 0,
        excerpt: 0,
        likesCount: 0,
        likeCount: 0,
        isFeatured: 0,
        isActive: 0,
        readTime: 0,
        tags: 0,
      },
    },
  ];
}

function normalizeStringArray(value) {
  if (typeof value === 'string') {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return [];
    }

    try {
      const parsedValue = JSON.parse(trimmedValue);

      if (Array.isArray(parsedValue)) {
        return normalizeStringArray(parsedValue);
      }
    } catch (error) {
      // FormData may send arrays as comma-separated text.
    }

    return trimmedValue
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item) => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildPostUpdatePayload(payload = {}) {
  const updates = {};

  if (typeof payload.title === 'string') {
    updates.title = payload.title.trim();
  }

  if (typeof payload.content === 'string') {
    updates.content = payload.content.trim();
  }

  if (typeof payload.thumbnail === 'string') {
    updates.thumbnail = payload.thumbnail.trim();
  }

  if (payload.images !== undefined) {
    updates.images = normalizeStringArray(payload.images);
  }

  if (typeof payload.category === 'string') {
    updates.category = payload.category.trim();
  }

  return updates;
}

function hasQueryValue(value) {
  return value !== undefined && value !== null && value !== '';
}

function parsePositiveInteger(value, fallback) {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    return fallback;
  }

  return Math.max(Math.trunc(parsedValue), 1);
}

function buildPagination(filters = {}, fallbackLimit) {
  const hasPage = hasQueryValue(filters.page);
  const hasLimit = hasQueryValue(filters.limit);

  if (!hasPage && !hasLimit && fallbackLimit === undefined) {
    return null;
  }

  const limit = parsePositiveInteger(filters.limit, fallbackLimit);

  if (!limit) {
    return null;
  }

  const page = parsePositiveInteger(filters.page, 1);

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}

/**
 * Tạo bài viết mới cho customer đang đăng nhập.
 * @param {Object} payload - Dữ liệu bài viết từ client
 * @param {Object} currentUser - Thông tin user từ JWT
 * @returns {Promise<Object>} Bài viết vừa tạo
 */
async function createPost(payload = {}, currentUser = {}) {
  const title = typeof payload.title === 'string' ? payload.title.trim() : '';
  const content = typeof payload.content === 'string' ? payload.content.trim() : '';
  const userId = getCurrentUserId(currentUser);

  if (!title) {
    const error = new Error('Tiêu đề bài viết là bắt buộc');
    error.statusCode = 400;
    throw error;
  }

  if (!content) {
    const error = new Error('Nội dung bài viết là bắt buộc');
    error.statusCode = 400;
    throw error;
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const error = new Error('Người dùng không hợp lệ');
    error.statusCode = 401;
    throw error;
  }

  const images = normalizeStringArray(payload.images);
  const thumbnail = typeof payload.thumbnail === 'string' ? payload.thumbnail.trim() : images[0] || '';
  const category = typeof payload.category === 'string' ? payload.category.trim() : '';

  return Post.create({
    title,
    content,
    thumbnail,
    images,
    category,
    author: currentUser.fullName || currentUser.email || '',
    userId,
    status: 'pending',
    isApproved: false,
  });
}

/**
 * Cập nhật bài viết của chính customer đang đăng nhập.
 * @param {string} id - Id bài viết
 * @param {Object} payload - Dữ liệu cập nhật từ client
 * @param {Object} currentUser - Thông tin user từ JWT
 * @returns {Promise<Object>} Bài viết sau khi cập nhật
 */
async function updatePost(id, payload = {}, currentUser = {}) {
  const userId = getCurrentUserId(currentUser);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('ID bài viết không hợp lệ');
    error.statusCode = 400;
    throw error;
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const error = new Error('Người dùng không hợp lệ');
    error.statusCode = 401;
    throw error;
  }

  const post = await Post.findById(id);

  if (!post) {
    const error = new Error('Không tìm thấy bài viết');
    error.statusCode = 404;
    throw error;
  }

  if (post.userId?.toString() !== userId.toString()) {
    const error = new Error('Bạn không có quyền cập nhật bài viết này');
    error.statusCode = 403;
    throw error;
  }

  const updates = buildPostUpdatePayload(payload);

  if (!Object.keys(updates).length) {
    const error = new Error('Không có dữ liệu cập nhật hợp lệ');
    error.statusCode = 400;
    throw error;
  }

  if (updates.title !== undefined && !updates.title) {
    const error = new Error('Tiêu đề bài viết là bắt buộc');
    error.statusCode = 400;
    throw error;
  }

  if (updates.content !== undefined && !updates.content) {
    const error = new Error('Nội dung bài viết là bắt buộc');
    error.statusCode = 400;
    throw error;
  }

  Object.assign(post, updates, {
    status: 'pending',
    isApproved: false,
  });

  return post.save();
}

/**
 * Xóa bài viết của chính customer đang đăng nhập.
 * @param {string} id - Id bài viết
 * @param {Object} currentUser - Thông tin user từ JWT
 * @returns {Promise<Object>} Bài viết vừa xóa
 */
async function deletePost(id, currentUser = {}) {
  const userId = getCurrentUserId(currentUser);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('ID bài viết không hợp lệ');
    error.statusCode = 400;
    throw error;
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const error = new Error('Người dùng không hợp lệ');
    error.statusCode = 401;
    throw error;
  }

  const post = await Post.findById(id);

  if (!post) {
    const error = new Error('Không tìm thấy bài viết');
    error.statusCode = 404;
    throw error;
  }

  if (post.userId?.toString() !== userId.toString()) {
    const error = new Error('Bạn không có quyền xóa bài viết này');
    error.statusCode = 403;
    throw error;
  }

  await post.deleteOne();

  return post;
}

/**
 * Lấy danh sách bài viết, có hỗ trợ lọc theo category, title và phân trang.
 * @param {Object} filters - Query filter từ request
 * @returns {Promise<Array>} Danh sách bài viết
 */
async function getMyPosts(currentUser = {}, filters = {}) {
  const userId = getCurrentUserId(currentUser);

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const error = new Error('Người dùng không hợp lệ');
    error.statusCode = 401;
    throw error;
  }

  const query = { userId };

  if (filters.status) {
    query.status = filters.status;
  }

  const postQuery = Post.find(query)
    .sort({ createdAt: -1 })
    .select('-id -excerpt -likesCount -likeCount -isFeatured -isActive -readTime -tags');

  if (filters.page && filters.limit) {
    const safePage = Math.max(Number(filters.page), 1);
    const safeLimit = Math.max(Number(filters.limit), 1);
    postQuery.skip((safePage - 1) * safeLimit).limit(safeLimit);
  }

  return postQuery.lean();
}

async function getAllPosts(filters = {}) {
  const { category, title } = filters;
  const query = {};
  const pagination = buildPagination(filters);

  if (category) {
    query.category = category;
  }

  if (title) {
    query.title = { $regex: title, $options: 'i' };
  }

  const pipeline = withRatingPipeline([
    { $match: query },
    { $sort: { createdAt: -1 } },
  ]);

  if (pagination) {
    pipeline.push({ $skip: pagination.skip }, { $limit: pagination.limit });
  }

  return Post.aggregate(pipeline);
}

/**
 * Lấy chi tiết bài viết theo Mongo _id hoặc field id.
 * @param {string} id - Id bài viết
 * @returns {Promise<Object>} Chi tiết bài viết
 */
async function getPostById(id) {
  const post = await Post.findOne(buildPostIdQuery(id))
    .select('-id -excerpt -likesCount -likeCount -isFeatured -isActive -readTime -tags')
    .populate({
      path: 'comments',
      populate: {
        path: 'userId',
        select: 'fullName email',
      },
    })
    .lean();

  if (!post) {
    const error = new Error('Không tìm thấy bài viết');
    error.statusCode = 404;
    throw error;
  }

  const ratedComments = post.comments?.filter((comment) => Number(comment.rating) > 0) || [];
  const avgRating = ratedComments.length
    ? Number(
        (
          ratedComments.reduce((total, comment) => total + Number(comment.rating || 0), 0) /
          ratedComments.length
        ).toFixed(1)
      )
    : 0;

  post.commentsCount = post.comments?.length || 0;
  post.avgRating = avgRating;

  return post;
}

/**
 * Lấy danh sách bài viết nổi bật.
 * @param {Object} filters - Query filter từ request
 * @returns {Promise<Array>} Danh sách bài viết nổi bật
 */
async function getFeaturedPosts(filters = {}) {
  const pagination = buildPagination(filters, 3);
  const pipeline = withRatingPipeline([]);

  pipeline.push(
    { $sort: { commentsCount: -1, createdAt: -1 } },
    { $skip: pagination.skip },
    { $limit: pagination.limit }
  );

  return Post.aggregate(pipeline);
}

module.exports = {
  createPost,
  updatePost,
  deletePost,
  getMyPosts,
  getAllPosts,
  getPostById,
  getFeaturedPosts,
};
