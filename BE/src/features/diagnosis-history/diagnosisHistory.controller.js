const diagnosisHistoryService = require('./diagnosisHistory.service');
const apiResponse = require('../../utils/apiResponse');

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
