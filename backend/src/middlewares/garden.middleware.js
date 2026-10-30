const User = require("../models/user.model");
const AppError = require("../utils/app-error");

// Xác nhận lại tài khoản và vai trò; JWT cũ không giữ quyền đã bị thu hồi.
module.exports = async (req, res, next) => {
  try {
    if (typeof req.user?.id !== "string" || !/^[a-f\d]{24}$/i.test(req.user.id))
      throw new AppError("SESSION_INVALID", 401, "Phiên đăng nhập không hợp lệ.");
    const user = await User.findById(req.user.id).select("role status").lean();
    if (!user || !user.status)
      throw new AppError("ACCOUNT_INACTIVE", 403, "Tài khoản không còn hoạt động.");
    if (user.role !== "customer")
      throw new AppError("FORBIDDEN", 403, "Chỉ khách hàng được quản lý vườn cá nhân.");
    next();
  } catch (error) { next(error); }
};
