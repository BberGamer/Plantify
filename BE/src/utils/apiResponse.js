// apiResponse.js - Helper chuẩn hóa response API (success/error)

/**
 * Trả về response thành công
 * @param {object} res - Express response object
 * @param {string} message - Thông báo
 * @param {*} data - Dữ liệu trả về
 * @param {number} statusCode - HTTP status code
 */
const success = (res, message, data = null, statusCode = 200) => {
  return res.status(statusCode).json({ success: true, message, data });
};

/**
 * Trả về response lỗi
 * @param {object} res - Express response object
 * @param {string} message - Thông báo lỗi
 * @param {number} statusCode - HTTP status code
 */
const error = (res, message, statusCode = 500) => {
  return res.status(statusCode).json({ success: false, message, data: null });
};

/**
 * Trả về response 404 Not Found
 * @param {object} res - Express response object
 * @param {string} message - Thông báo lỗi
 */
const notFound = (res, message = 'Không tìm thấy') => {
  return res.status(404).json({ success: false, message, data: null });
};

module.exports = { success, error, notFound };
