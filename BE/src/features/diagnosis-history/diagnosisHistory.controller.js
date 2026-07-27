// diagnosisHistory.controller.js
// Tiếp nhận request lịch sử chẩn đoán, gọi service và trả response thống nhất.

const diagnosisHistoryService = require('./diagnosisHistory.service');
const apiResponse = require('../../utils/apiResponse');

/** Lấy lịch sử chẩn đoán của người dùng theo query. @param {Object} req @param {Object} res @param {Function} next @returns {Promise<Object>} HTTP response. */
async function getMyDiagnosisHistories(req, res, next) {
  try {
    const result = await diagnosisHistoryService.getMyDiagnosisHistories(
      req.user.id,
      req.query
    );
    return apiResponse.success(
      res,
      'Lấy lịch sử chẩn đoán thành công',
      result
    );
  } catch (error) {
    return next(error);
  }
}

/** Lấy chi tiết lịch sử chẩn đoán thuộc người dùng. @param {Object} req @param {Object} res @param {Function} next @returns {Promise<Object>} HTTP response. */
async function getMyDiagnosisHistoryById(req, res, next) {
  try {
    const history = await diagnosisHistoryService.getMyDiagnosisHistoryById(
      req.user.id,
      req.params.id
    );
    if (!history) {
      return apiResponse.notFound(res, 'Không tìm thấy lịch sử chẩn đoán');
    }
    return apiResponse.success(
      res,
      'Lấy chi tiết lịch sử chẩn đoán thành công',
      history
    );
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getMyDiagnosisHistories,
  getMyDiagnosisHistoryById,
};
