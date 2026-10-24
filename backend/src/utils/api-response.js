// utils/api-response.js - Helper chuan hoa response API theo quy uoc Plantify

/**
 * Tra ve response thanh cong
 * @param {object} res - Express response
 * @param {string} message - Thong bao
 * @param {*} data - Du lieu tra ve
 * @param {number} statusCode - HTTP status code (mac dinh 200)
 */
const success = (res, message, data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const created = (res, message, data = null) => {
  return success(res, message, data, 201);
};

/**
 * Tra ve response that bai / loi
 * @param {object} res - Express response
 * @param {string} message - Thong bao loi
 * @param {number} statusCode - HTTP status code (mac dinh 500)
 * @param {object} options - code/errors tùy chọn; giữ nguyên ba tham số cũ
 */
const error = (res, message, statusCode = 500, options = {}) => {
  return res.status(statusCode).json({
    success: false,
    message,
    data: null,
    ...(options.code ? { code: options.code } : {}),
    ...(options.errors ? { errors: options.errors } : {}),
  });
};

const notFound = (res, message = "Khong tim thay tai nguyen", options = {}) => {
  return error(res, message, 404, options);
};

module.exports = { success, created, error, notFound };
