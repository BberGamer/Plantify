// comment.service.js - Business logic cho binh luan bai viet Plantify
const mongoose = require('mongoose');
const Comment = require('./comment.model');

function ensureObjectId(id, message = 'ID khong hop le') {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error(message);
    error.statusCode = 400;
    throw error;
  }
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

async function createComment(payload) {
  ensureObjectId(payload.userId, 'User ID khong hop le');
  ensureObjectId(payload.postId, 'Post ID khong hop le');

  return Comment.create({
    userId: payload.userId,
    postId: payload.postId,
    content: payload.content,
    rating: payload.rating,
  });
}

module.exports = {
  getAllComments,
  getCommentsByPostId,
  createComment,
};
