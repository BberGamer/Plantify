// report.service.js - Business logic cho bao cao bai viet Plantify
const mongoose = require('mongoose');
const Report = require('./report.model');
const Post = require('../posts/post.model');

function ensureObjectId(id, message = 'ID khong hop le') {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error(message);
    error.statusCode = 400;
    throw error;
  }
}

function validateReason(reason) {
  if (!Report.REPORT_REASONS.includes(reason)) {
    const error = new Error('Ly do bao cao khong hop le');
    error.statusCode = 400;
    throw error;
  }
}

async function ensurePostExists(postId) {
  const post = await Post.findById(postId).select('_id').lean();

  if (!post) {
    const error = new Error('Khong tim thay bai viet');
    error.statusCode = 404;
    throw error;
  }

  return post;
}

async function createReport(postId, userId, reason) {
  ensureObjectId(postId, 'Post ID khong hop le');
  ensureObjectId(userId, 'User ID khong hop le');
  validateReason(reason);
  await ensurePostExists(postId);

  const existingReport = await Report.findOne({ postId, userId }).lean();

  if (existingReport) {
    const error = new Error('Ban da bao cao bai viet nay');
    error.statusCode = 409;
    throw error;
  }

  return Report.create({
    postId,
    userId,
    reason,
  });
}

async function getReportsByPost(postId) {
  ensureObjectId(postId, 'Post ID khong hop le');
  await ensurePostExists(postId);

  return Report.find({ postId })
    .populate('userId', 'fullName email')
    .sort({ createdAt: -1 })
    .lean();
}

module.exports = {
  createReport,
  getReportsByPost,
};
