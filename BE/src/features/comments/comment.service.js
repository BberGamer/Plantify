// comment.service.js - Business logic cho binh luan bai viet Plantify
const mongoose = require('mongoose');
const Comment = require('./comment.model');
const Post = require('../posts/post.model');

function ensureObjectId(id, message = 'ID khong hop le') {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error(message);
    error.statusCode = 400;
    throw error;
  }
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

async function createComment(payload) {
  ensureObjectId(payload.userId, 'User ID khong hop le');
  ensureObjectId(payload.postId, 'Post ID khong hop le');

  const post = await Post.findById(payload.postId);
  if (!post) {
    const error = new Error('Khong tim thay bai viet');
    error.statusCode = 404;
    throw error;
  }

  const comment = await Comment.create({
    userId: payload.userId,
    postId: payload.postId,
    content: payload.content,
    rating: payload.rating,
  });

  await syncPostRating(post._id);

  return Comment.findById(comment._id)
    .populate('userId', 'fullName email')
    .lean();
}

module.exports = {
  getAllComments,
  getCommentsByPostId,
  createComment,
};
