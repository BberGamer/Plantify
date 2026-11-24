const User = require("../models/user.model");
const AppError = require("../utils/app-error");
const { isVip } = require("../utils/vip");

async function requireVip(req, res, next) {
  try {
    const user = await User.findById(req.user.id)
      .select("isproaccount vip_expires_at status role")
      .lean();
    if (!user)
      throw new AppError(
        "SESSION_INVALID",
        401,
        "Phiên đăng nhập không còn hợp lệ.",
      );
    if (!user.status)
      throw new AppError("ACCOUNT_LOCKED", 403, "Tài khoản đã bị khóa.");
    if (user.role !== "customer")
      throw new AppError(
        "FORBIDDEN",
        403,
        "Chức năng này chỉ dành cho khách hàng.",
      );
    if (!isVip(user))
      throw new AppError(
        "VIP_REQUIRED",
        403,
        "Chẩn đoán và nhận diện AI chỉ dành cho tài khoản VIP còn hạn.",
      );
    next();
  } catch (error) {
    next(error);
  }
}
module.exports = requireVip;
