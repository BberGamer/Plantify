// middlewares/auth.middleware.js - Middleware xac thuc JWT va phan quyen
const jwt = require("jsonwebtoken");
const { error } = require("../utils/api-response");

/**
 * Xac thuc JWT Token tu Header Authorization (Bearer <token>)
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return error(res, "Vui lòng đăng nhập để tiếp tục", 401);
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "plantify_secret_key");
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return error(res, "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại", 401);
    }
    return error(res, "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.", 401);
  }
};

/**
 * Kiem tra quyen Admin
 */
const authorizeAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return error(res, "Bạn không có quyền truy cập chức năng này (yêu cầu quyền quản trị viên)", 403);
  }
  next();
};

/**
 * Kiem tra quyen Manager
 */
const authorizeManager = (req, res, next) => {
  const allowed = ["admin", "manager"];
  if (!allowed.includes(req.user?.role)) {
    return error(res, "Bạn không có quyền quản lý", 403);
  }
  next();
};

/**
 * Kiem tra quyen Customer
 */
const authorizeCustomer = (req, res, next) => {
  if (req.user?.role !== "customer") {
    return error(res, "Chỉ tài khoản khách hàng mới có thể thực hiện", 403);
  }
  next();
};

module.exports = {
  authenticate,
  authorizeAdmin,
  authorizeManager,
  authorizeCustomer,
};
