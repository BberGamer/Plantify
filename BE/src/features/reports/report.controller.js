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

module.exports = {
  createReport,
};
