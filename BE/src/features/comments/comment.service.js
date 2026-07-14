// comment.service.js - Business logic cho binh luan bai viet va san pham Plantify
const mongoose = require('mongoose');
const Comment = require('./comment.model');
const Post = require('../posts/post.model');
const Product = require('../products/product.model');
const { createNotification } = require('../notifications/notification.service');

function ensureObjectId(id, message = 'ID khong hop le') {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error(message);
    error.statusCode = 400;
    throw error;
  }
}

function getCurrentUserId(currentUser = {}) {
  return currentUser.id || currentUser._id || currentUser.userId;
}

function ensureCurrentUserId(currentUser) {
  const userId = getCurrentUserId(currentUser);
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const error = new Error('Nguoi dung chua duoc xac thuc hop le');
    error.statusCode = 401;
    throw error;
  }

  return userId;
}

function validateCommentPayload(payload = {}) {
  const content = typeof payload.content === 'string' ? payload.content.trim() : '';
  if (!content) {
    const error = new Error('Noi dung binh luan la bat buoc');
    error.statusCode = 400;
    throw error;
  }

  if (payload.rating === undefined || payload.rating === null || payload.rating === '') {
    return { content, rating: undefined };
  }

  const rating = Number(payload.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    const error = new Error('Danh gia phai la so nguyen tu 1 den 5');
    error.statusCode = 400;
    throw error;
  }

  return { content, rating };
}

async function syncPostRating(postId) {
  const stats = await Comment.aggregate([
    { $match: { postId: new mongoose.Types.ObjectId(postId), rating: { $gte: 1, $lte: 5 } } },
    {
      $group: {
        _id: '$postId',
        commentsCount: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  const ratingStats = stats[0] || { commentsCount: 0, avgRating: 0 };

  await Post.findByIdAndUpdate(postId, {
    commentsCount: ratingStats.commentsCount,
    avgRating: Number(ratingStats.avgRating.toFixed(1)),
  });
}

async function getAllComments(filters = {}) {
  const query = {};

  if (filters.postId) {
    ensureObjectId(filters.postId, 'Post ID khong hop le');
    query.postId = filters.postId;
  }

  return Comment.find(query)
    .populate('userId', 'fullName email')
    .sort({ createdAt: -1 })
    .lean();
}

async function getCommentsByPostId(postId) {
  ensureObjectId(postId, 'Post ID khong hop le');

  return Comment.find({ postId })
    .populate('userId', 'fullName email')
    .sort({ createdAt: -1 })
    .lean();
}

async function createComment(payload = {}, currentUser = {}) {
  const userId = ensureCurrentUserId(currentUser);
  ensureObjectId(payload.postId, 'Post ID khong hop le');
  const { content, rating } = validateCommentPayload(payload);

  const post = await Post.findById(payload.postId);
  if (!post) {
    const error = new Error('Khong tim thay bai viet');
    error.statusCode = 404;
    throw error;
  }

  const comment = await Comment.create({
    userId,
    postId: payload.postId,
    content,
    rating,
  });

  await syncPostRating(post._id);

  await createNotification({
    recipientId: post.userId,
    actorId: userId,
    type: 'post_commented',
    postId: post._id,
    commentId: comment._id,
  });

  return Comment.findById(comment._id)
    .populate('userId', 'fullName email')
    .lean();
}

async function getCommentsByProductId(productId) {
  ensureObjectId(productId, 'Product ID khong hop le');

  return Comment.find({ productId })
    .populate('userId', 'fullName email')
    .sort({ createdAt: -1 })
    .lean();
}

async function syncProductRating(productId) {
  const stats = await Comment.aggregate([
    { $match: { productId: new mongoose.Types.ObjectId(productId), rating: { $gte: 1, $lte: 5 } } },
    {
      $group: {
        _id: '$productId',
        ratingCount: { $sum: 1 },
        ratingAverage: { $avg: '$rating' },
      },
    },
  ]);
  const ratingStats = stats[0] || { ratingCount: 0, ratingAverage: 0 };

  await Product.findByIdAndUpdate(productId, {
    ratingCount: ratingStats.ratingCount,
    ratingAverage: Number(ratingStats.ratingAverage.toFixed(1)),
  });
}

async function createProductComment(payload = {}, currentUser = {}) {
  const userId = ensureCurrentUserId(currentUser);
  ensureObjectId(payload.productId, 'Product ID khong hop le');
  const { content, rating } = validateCommentPayload(payload);

  const product = await Product.findById(payload.productId);
  if (!product) {
    const error = new Error('Khong tim thay san pham');
    error.statusCode = 404;
    throw error;
  }

  const comment = await Comment.create({
    userId,
    productId: payload.productId,
    content,
    rating,
  });

  await syncProductRating(product._id);

  return Comment.findById(comment._id)
    .populate('userId', 'fullName email')
    .lean();
}

module.exports = {
  getAllComments,
  getCommentsByPostId,
  createComment,
  getCommentsByProductId,
  createProductComment,
};
