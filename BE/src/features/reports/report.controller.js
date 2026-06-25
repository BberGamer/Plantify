// report.controller.js - Xu ly request/response cho bao cao bai viet Plantify
const reportService = require('./report.service');
const apiResponse = require('../../utils/apiResponse');

function getCurrentUserId(req) {
  return req.user?.id || req.user?._id || req.user?.userId;
}

async function createReport(req, res, next) {
  try {
    const { postId, reason } = req.body;
    const report = await reportService.createReport(postId, getCurrentUserId(req), reason);

    return apiResponse.success(res, 'Tao bao cao bai viet thanh cong', report, 201);
  } catch (error) {
    return next(error);
  }
}

async function getAllReports(req, res, next) {
  try {
    const reports = await reportService.getAllReports(req.query);
    return apiResponse.success(res, 'Lay danh sach bao cao thanh cong', reports);
  } catch (error) {
    return next(error);
  }
}

async function processReport(req, res, next) {
  try {
    const { action } = req.body;
    const report = await reportService.processReport(req.params.id, getCurrentUserId(req), action);

    return apiResponse.success(res, 'Xu ly bao cao thanh cong', report);
  } catch (error) {
    return next(error);
  }
}

async function restorePost(req, res, next) {
  try {
    const post = await reportService.restorePost(req.params.postId);
    return apiResponse.success(res, 'Khoi phuc bai viet thanh cong', post);
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
