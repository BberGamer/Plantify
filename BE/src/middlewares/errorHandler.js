// errorHandler.js - Middleware xử lý lỗi tập trung cho Express

/**
 * Bắt tất cả lỗi từ next(err) và trả về response thống nhất
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Lỗi máy chủ nội bộ';
  res.status(statusCode).json({ success: false, message, data: null });
};

module.exports = errorHandler;
