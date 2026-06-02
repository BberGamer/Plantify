// auth.js - Middleware xác thực JWT / session
const jwt = require('jsonwebtoken');
const { error } = require('../utils/apiResponse');

/**
 * Xác thực JWT token từ header Authorization
 * Gắn thông tin user vào req.user nếu hợp lệ
 */
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return error(res, 'Không có token xác thực', 401);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return error(res, 'Token không hợp lệ hoặc đã hết hạn', 401);
  }
};

module.exports = { authenticate };
