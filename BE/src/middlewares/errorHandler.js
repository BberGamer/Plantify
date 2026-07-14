// errorHandler.js - Middleware xử lý lỗi tập trung cho Express

/**
 * Bắt tất cả lỗi từ next(err) và trả về response thống nhất
 */
const errorHandler = (err, req, res, next) => {
  console.error('[ERROR]', err.message, err.stack);
  const statusCode = err.statusCode || (
    err.code === 11000 ? 409 :
      ['CastError', 'ValidationError'].includes(err.name) ? 400 : 500
  );
  const message = err.message || 'Lỗi máy chủ nội bộ';
  res.status(statusCode).json({ success: false, message, data: null });
};

module.exports = errorHandler;
