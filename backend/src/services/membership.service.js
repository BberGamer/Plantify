const mongoose = require("mongoose");
const User = require("../models/user.model");
const AppError = require("../utils/app-error");
const { isVip } = require("../utils/vip");
// Unique index của slot quyết định ai được thêm; transaction thử lại khi cùng chọn một slot.
const withMembership = async (userId, work) => {
  require("../validators/common").id(userId);
  for (let attempt = 0; ; attempt++) {
    try {
      let result;
      await mongoose.connection.transaction(async (session) => {
        const user = await User.findOne({ _id: userId, status: true, role: "customer" })
          .select("isproaccount vip_expires_at").session(session).lean();
        if (!user) throw new AppError("FORBIDDEN", 403, "Tài khoản không khả dụng.");
        result = await work(user, session);
      }, { readConcern: { level: "snapshot" }, writeConcern: { w: "majority" } });
      return result;
    } catch (error) {
      if (error.code !== 11000 || attempt >= 7) throw error;
    }
  }
};
async function quotaSlot(Model, userId, filter, limit, code, session) {
  const limitMessage = code === "FAVORITE_LIMIT_REACHED"
    ? "Tài khoản Free được lưu tối đa 5 cây yêu thích. Hãy bỏ yêu thích một cây hoặc mua gói VIP để lưu thêm."
    : code === "GARDEN_LIMIT_REACHED"
      ? "Tài khoản Free được thêm tối đa 3 cây trong vườn. Hãy lưu trữ một cây hoặc mua gói VIP để thêm cây mới."
      : `Tài khoản Free chỉ cho phép tối đa ${limit} cây trong mục này.`;
  const query = { ...filter, user_id: userId };
  if (await Model.countDocuments(query).session(session) >= limit)
    throw new AppError(code, 409, limitMessage);
  const rows = await Model.find(query).select("free_slot").session(session).lean();
  const occupied = new Set(rows.filter((r) => Number.isInteger(r.free_slot) && r.free_slot >= 0 && r.free_slot < limit).map((r) => r.free_slot));
  const legacyCount = rows.filter((r) => !Number.isInteger(r.free_slot) || r.free_slot < 0 || r.free_slot >= limit).length;
  // Dành các slot CHƯA bị chiếm cho dữ liệu cũ, tránh đếm chồng slot cũ với bản ghi legacy.
  const available = Array.from({ length: limit }, (_, n) => n).filter((n) => !occupied.has(n));
  const slot = available[legacyCount];
  if (slot === undefined) throw new AppError(code, 409, limitMessage);
  return slot;
}
async function requireVip(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select("isproaccount vip_expires_at status role").lean();
    if (!user) throw new AppError("SESSION_INVALID", 401, "Phiên đăng nhập không còn hợp lệ.");
    if (!user.status) throw new AppError("ACCOUNT_LOCKED", 403, "Tài khoản đã bị khóa.");
    if (user.role !== "customer") throw new AppError("FORBIDDEN", 403, "Chức năng này chỉ dành cho khách hàng.");
    if (!isVip(user))
      throw new AppError("VIP_REQUIRED", 403, "Chẩn đoán và nhận diện AI chỉ dành cho tài khoản VIP còn hạn.");
    next();
  } catch (error) { next(error); }
}
module.exports = { withMembership, quotaSlot, requireVip };
