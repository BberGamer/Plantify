const crypto = require("node:crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const google = require("../integrations/google.service");
const validate = require("../validators/google-auth.validator");
const { createSession } = require("./auth.service");
const AppError = require("../utils/app-error");

// Cùng giới hạn một tiến trình như cache OTP hiện tại; chỉ giữ hash vé và định danh đã xác minh.
const flows = new Map();
const hash = (value) => crypto.createHash("sha256").update(value).digest("hex");
const expired = () => new AppError("GOOGLE_FLOW_EXPIRED", 400, "Phiên Google đã hết hạn. Vui lòng chọn tài khoản lại.");
const active = (user) => {
  if (!user.status) throw new AppError("ACCOUNT_LOCKED", 403, "Tài khoản đã bị khóa.");
  return user;
};
const issue = (kind, data, expires) => {
  for (const [key, flow] of flows) if (flow.expires <= Date.now()) flows.delete(key);
  if (flows.size >= 5000) throw new AppError("GOOGLE_BUSY", 503, "Có quá nhiều yêu cầu xác thực. Vui lòng thử lại sau.");
  const value = crypto.randomBytes(32).toString("base64url");
  flows.set(hash(value), { kind, data, expires, pending: false });
  return value;
};
const read = (value, kind) => {
  validate.ticket(value);
  const key = hash(value);
  const flow = flows.get(key);
  if (!flow || flow.kind !== kind || flow.expires <= Date.now()) {
    if (flow?.expires <= Date.now()) flows.delete(key);
    throw expired();
  }
  if (flow.pending) throw new AppError("REQUEST_IN_PROGRESS", 409, "Yêu cầu đang được xử lý.");
  return { key, flow };
};

const challenge = () => {
  if (!process.env.GOOGLE_WEB_CLIENT_ID) throw new AppError("GOOGLE_NOT_CONFIGURED", 503, "Máy chủ chưa cấu hình Google Login.");
  const nonce = crypto.randomBytes(32).toString("base64url");
  const expiresAt = Date.now() + 5 * 60 * 1000;
  return { nonce, challengeToken: issue("challenge", { nonce }, expiresAt), expiresAt };
};

const login = async (input) => {
  const { idToken, challengeToken } = validate.credentials(input);
  const { key, flow } = read(challengeToken, "challenge");
  flow.pending = true;
  try {
    const identity = await google.verify(idToken, flow.data.nonce);
    await User.init();
    let user = await User.findOne({ googleSub: identity.sub });
    if (!user) {
      user = await User.findOne({ email: identity.email });
      if (user) {
        active(user);
        if (!identity.authoritative) throw new AppError("GOOGLE_LINK_REQUIRED", 409, "Vui lòng đăng nhập bằng phương thức hiện tại để xác nhận liên kết Google.");
        if (user.googleSub && user.googleSub !== identity.sub)
          throw new AppError("GOOGLE_ACCOUNT_CONFLICT", 409, "Tài khoản đã liên kết với Google khác.");
        user = await User.findOneAndUpdate({ _id: user._id, googleSub: null, status: true },
          { $set: { googleSub: identity.sub } }, { new: true, runValidators: true });
        if (!user) throw new AppError("GOOGLE_ACCOUNT_CONFLICT", 409, "Thông tin liên kết đã thay đổi. Vui lòng đăng nhập lại.");
      }
    }
    if (user) return { nextStep: "authenticated", ...createSession(active(user)) };
    if (!identity.authoritative) throw new AppError("GOOGLE_LINK_REQUIRED", 409, "Vui lòng đăng ký bằng email và OTP để xác minh địa chỉ này.");
    const expiresAt = Math.min(Date.now() + 10 * 60 * 1000, identity.expires);
    return {
      nextStep: "complete_profile",
      registrationTicket: issue("registration", identity, expiresAt),
      expiresAt,
      profile: { email: identity.email, fullName: identity.fullName },
    };
  } catch (error) {
    if (error.code === 11000) throw new AppError("GOOGLE_ACCOUNT_CONFLICT", 409, "Tài khoản đã được liên kết. Vui lòng thử đăng nhập lại.");
    throw error;
  } finally { flows.delete(key); }
};

const complete = async (input) => {
  const { key, flow } = read(input?.registrationTicket, "registration");
  const identity = flow.data;
  const data = validate.complete(input, identity.email);
  flow.pending = true;
  try {
    await User.init();
    const existing = await User.findOne({ $or: [{ email: identity.email }, { googleSub: identity.sub }] });
    if (existing) {
      active(existing);
      throw new AppError("GOOGLE_ACCOUNT_CONFLICT", 409, "Tài khoản đã tồn tại. Vui lòng quay lại đăng nhập Google.");
    }
    if (data.phone && await User.exists({ phone: data.phone }))
      throw new AppError("PHONE_IN_USE", 409, "Số điện thoại đã được sử dụng.");
    const password = await bcrypt.hash(data.password, 10);
    const user = await User.create({
      fullName: data.fullName, email: identity.email, phone: data.phone, password,
      googleSub: identity.sub, isGoogleAccount: true, role: "customer", status: true,
    });
    flows.delete(key);
    return createSession(user);
  } catch (error) {
    if (error.code === 11000) throw new AppError("GOOGLE_ACCOUNT_CONFLICT", 409, "Tài khoản vừa được đăng ký. Vui lòng đăng nhập lại.");
    throw error;
  } finally { flow.pending = false; }
};

module.exports = { challenge, login, complete };
