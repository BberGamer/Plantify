// utils/apiResponse.js - Helper chuan hoa response API theo quy uoc Plantify

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
 */
const error = (res, message, statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
    data: null,
  });
};

const notFound = (res, message = "Khong tim thay tai nguyen") => {
  return res.status(404).json({
    success: false,
    message,
    data: null,
  });
};

module.exports = { success, created, error, notFound };