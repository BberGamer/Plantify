const crypto = require("crypto");
const AppError = require("../utils/app-error");
function verify(raw, headers, now = Date.now()) {
  const secret = process.env.SEPAY_WEBHOOK_SECRET;
  if (!secret) throw new AppError("PAYMENT_NOT_CONFIGURED", 503, "Chưa cấu hình SePay.");
  const stamp = headers["x-sepay-timestamp"];
  const signature = headers["x-sepay-signature"];
  if (typeof stamp !== "string" || !/^\d{10}$/.test(stamp) ||
      Math.abs(now / 1000 - Number(stamp)) > 300 ||
      typeof signature !== "string" || !/^sha256=[a-f0-9]{64}$/i.test(signature) || !Buffer.isBuffer(raw))
    throw new AppError("PAYMENT_SIGNATURE_INVALID", 401, "Chữ ký không hợp lệ.");
  const expected = crypto.createHmac("sha256", secret).update(stamp + ".").update(raw).digest();
  if (!crypto.timingSafeEqual(expected, Buffer.from(signature.slice(7), "hex")))
    throw new AppError("PAYMENT_SIGNATURE_INVALID", 401, "Chữ ký không hợp lệ.");
  try { return JSON.parse(raw.toString("utf8")); }
  catch { throw new AppError("FINANCE_VALIDATION", 400, "JSON không hợp lệ."); }
}
module.exports = { verify };
