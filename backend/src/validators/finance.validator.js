const AppError = require("../utils/app-error");
const common = require("./common");
const fail = (message) => { throw new AppError("FINANCE_VALIDATION", 400, message); };
function fields(input, allowed) {
  common.object(input);
  if (Object.keys(input).some((field) => !allowed.includes(field))) fail("Yêu cầu chứa trường không được phép.");
  return input;
}
function amount(value) {
  if (!Number.isSafeInteger(value) || value < 10000 || value > 10000000)
    fail("Số tiền phải là số nguyên từ 10.000 đến 10.000.000 VND.");
  return value;
}
function key(value) {
  if (typeof value !== "string" || !/^[a-zA-Z0-9_-]{16,100}$/.test(value)) fail("Mã yêu cầu không hợp lệ.");
  return value;
}
function reason(value) {
  if (typeof value !== "string" || value.trim().length < 5 || value.length > 500 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value))
    fail("Lý do phải có từ 5 đến 500 ký tự.");
  return value.trim();
}
function page(input = {}) {
  common.object(input);
  if (input.page !== undefined && (typeof input.page !== "number" &&
      (typeof input.page !== "string" || !/^[1-9]\d{0,5}$/.test(input.page)))) fail("Trang không hợp lệ.");
  const value = input.page === undefined ? 1 : Number(input.page);
  if (!Number.isSafeInteger(value) || value < 1 || value > 100000) fail("Trang không hợp lệ.");
  return { page: value, limit: 20 };
}
module.exports = { fields, amount, key, reason, page, fail };
