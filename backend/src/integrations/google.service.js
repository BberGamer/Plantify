const { OAuth2Client } = require("google-auth-library");
const AppError = require("../utils/app-error");
const v = require("../validators/common");

const client = new OAuth2Client();

module.exports = {
  verify: async (idToken, nonce) => {
    const audience = process.env.GOOGLE_WEB_CLIENT_ID;
    if (!audience) throw new AppError("GOOGLE_NOT_CONFIGURED", 503, "Máy chủ chưa cấu hình Google Login.");
    let payload;
    try {
      const ticket = await client.verifyIdToken({ idToken, audience });
      payload = ticket.getPayload();
    } catch {
      throw new AppError("GOOGLE_TOKEN_INVALID", 401, "Không xác minh được tài khoản Google. Vui lòng thử lại.");
    }
    if (!payload || typeof payload.sub !== "string" || !payload.sub || payload.sub.length > 255 ||
        payload.email_verified !== true || payload.nonce !== nonce ||
        !Number.isFinite(payload.exp) || payload.exp * 1000 <= Date.now())
      throw new AppError("GOOGLE_TOKEN_INVALID", 401, "Thông tin xác thực Google không hợp lệ.");
    const email = v.email(payload.email);
    return {
      sub: payload.sub, email, fullName: typeof payload.name === "string" ? payload.name.slice(0, 100) : "",
      authoritative: email.endsWith("@gmail.com") || (typeof payload.hd === "string" && !!payload.hd),
      expires: payload.exp * 1000,
    };
  },
};
