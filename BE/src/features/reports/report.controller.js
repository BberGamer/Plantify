// report.controller.js - Xu ly request/response cho bao cao bai viet Plantify
const reportService = require('./report.service');
const apiResponse = require('../../utils/apiResponse');

function getCurrentUserId(req) {
  return req.user?.id || req.user?._id || req.user?.userId;
}

/**
 * Tạo báo cáo bài viết cho người dùng hiện tại.
 * @param {Object} req - Express request.
 * @param {Object} res - Express response.
 * @param {Function} next - Middleware xử lý lỗi.
 * @returns {Promise<Object>} HTTP response.
 */
async function createReport(req, res, next) {
  try {
    const { postId, reason } = req.body;
    const report = await reportService.createReport(postId, getCurrentUserId(req), reason);

    return apiResponse.success(res, 'Tạo báo cáo bài viết thành công', report, 201);
  } catch (error) {
    return next(error);
  }
}

/** Lấy danh sách báo cáo theo query. @param {Object} req @param {Object} res @param {Function} next @returns {Promise<Object>} HTTP response. */
async function getAllReports(req, res, next) {
  try {
    const reports = await reportService.getAllReports(req.query);
    return apiResponse.success(res, 'Lấy danh sách báo cáo thành công', reports);
  } catch (error) {
    return next(error);
  }
}

/** Xử lý báo cáo theo action trong body. @param {Object} req @param {Object} res @param {Function} next @returns {Promise<Object>} HTTP response. */
async function processReport(req, res, next) {
  try {
    const { action } = req.body;
    const report = await reportService.processReport(req.params.id, getCurrentUserId(req), action);

    return apiResponse.success(res, 'Xử lý báo cáo thành công', report);
  } catch (error) {
    return next(error);
  }
}

/** Khôi phục bài viết bị gỡ do báo cáo. @param {Object} req @param {Object} res @param {Function} next @returns {Promise<Object>} HTTP response. */
async function restorePost(req, res, next) {
  try {
    const post = await reportService.restorePost(req.params.postId);
    return apiResponse.success(res, 'Khôi phục bài viết thành công', post);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createReport,
  getAllReports,
  processReport,
  restorePost,
};
