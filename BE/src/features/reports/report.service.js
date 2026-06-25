// report.service.js - Business logic cho bao cao bai viet Plantify
const mongoose = require('mongoose');
const Report = require('./report.model');
const Post = require('../posts/post.model');

const RESTORE_WINDOW_MS = 2 * 24 * 60 * 60 * 1000;
const REPORT_POST_SELECT =
  'title content thumbnail images author category status isApproved avgRating commentsCount deletedAt processedAt createdAt userId';

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

function validateAction(action) {
  if (!Report.REPORT_ACTIONS.includes(action)) {
    const error = new Error('Hanh dong xu ly bao cao khong hop le');
    error.statusCode = 400;
    throw error;
  }
}

function validateStatus(status) {
  if (!Report.REPORT_STATUSES.includes(status)) {
    const error = new Error('Trang thai bao cao khong hop le');
    error.statusCode = 400;
    throw error;
  }
}

function parsePositiveInteger(value, fallback) {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    return fallback;
  }

  return Math.max(Math.trunc(parsedValue), 1);
}

async function ensurePostExists(postId) {
  const post = await Post.findById(postId).select('_id userId').lean();

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
  const post = await ensurePostExists(postId);

  if (post.userId?.toString() === userId.toString()) {
    const error = new Error('Ban khong the bao cao bai viet cua chinh minh');
    error.statusCode = 403;
    throw error;
  }

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

async function getAllReports(filters = {}) {
  const query = {};
  const page = parsePositiveInteger(filters.page, 1);
  const limit = parsePositiveInteger(filters.limit, 20);

  if (filters.status) {
    validateStatus(filters.status);
    query.status = filters.status;
  }

  if (filters.action) {
    validateAction(filters.action);
    query.action = filters.action;
  }

  if (filters.postId) {
    ensureObjectId(filters.postId, 'Post ID khong hop le');
    query.postId = filters.postId;
  }

  const skip = (page - 1) * limit;

  return Report.find(query)
    .populate('postId', REPORT_POST_SELECT)
    .populate('userId', 'fullName email')
    .populate('processedBy', 'fullName email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
}

async function processReport(reportId, managerId, action) {
  ensureObjectId(reportId, 'Report ID khong hop le');
  ensureObjectId(managerId, 'Manager ID khong hop le');
  validateAction(action);

  const report = await Report.findById(reportId);

  if (!report) {
    const error = new Error('Khong tim thay bao cao');
    error.statusCode = 404;
    throw error;
  }

  const post = await Post.findById(report.postId);

  if (!post) {
    const error = new Error('Khong tim thay bai viet');
    error.statusCode = 404;
    throw error;
  }

  if (action === 'approve') {
    post.status = 'approved';
    post.isApproved = true;
    post.deletedAt = null;
    post.processedAt = null;
  }

  if (action === 'reject') {
    post.status = 'rejected';
    post.isApproved = false;
  }

  if (action === 'remove') {
    post.status = 'resolved';
    post.isApproved = false;
    post.deletedAt = new Date();
    post.processedAt = new Date();
  }

  report.status = 'resolved';
  report.action = action;
  report.processedBy = managerId;
  report.processedAt = new Date();

  await post.save();
  await report.save();

  return Report.findById(report._id)
    .populate('postId', REPORT_POST_SELECT)
    .populate('userId', 'fullName email')
    .populate('processedBy', 'fullName email')
    .lean();
}

async function restorePost(postId) {
  ensureObjectId(postId, 'Post ID khong hop le');

  const post = await Post.findById(postId);

  if (!post) {
    const error = new Error('Khong tim thay bai viet');
    error.statusCode = 404;
    throw error;
  }

  if (!post.deletedAt) {
    const error = new Error('Bai viet chua bi xoa');
    error.statusCode = 400;
    throw error;
  }

  const deletedAt = new Date(post.deletedAt).getTime();
  const isRestorable = Date.now() - deletedAt <= RESTORE_WINDOW_MS;

  if (!isRestorable) {
    const error = new Error('Chi co the khoi phuc bai viet trong 2 ngay');
    error.statusCode = 400;
    throw error;
  }

  post.deletedAt = null;
  post.status = 'approved';
  post.isApproved = true;
  post.processedAt = null;

  return post.save();
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
  getAllReports,
  processReport,
  restorePost,
  getReportsByPost,
};
