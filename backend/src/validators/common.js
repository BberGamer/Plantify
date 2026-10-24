const AppError = require("../utils/app-error");
const invalid = (field, message = "Thông tin nhập chưa hợp lệ.") => {
  throw new AppError("VALIDATION_ERROR", 400, message, { [field]: message });
};
const object = (value, field = "body") => {
  if (!value || typeof value !== "object" || Array.isArray(value))
    invalid(field);
  return value;
};
const text = (value, field, required = true) => {
  if (typeof value !== "string" || (required && !value.trim()))
    invalid(
      field,
      `Trường ${field} phải là chuỗi${required ? " không rỗng" : ""}.`,
    );
  return value.trim();
};
const id = (value, field = "id") => {
  if (typeof value !== "string" || !/^[a-f\d]{24}$/i.test(value)) {
    throw new AppError("INVALID_ID", 400, "Định dạng ID không hợp lệ.", {
      [field]: "ID phải gồm 24 ký tự thập lục phân.",
    });
  }
  return value;
};
const email = (value) => {
  const result = text(value, "email");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result) || result.length > 254)
    invalid("email", "Email không hợp lệ.");
  return result.toLowerCase();
};
const phone = (value) => {
  const result = text(value, "phone", false);
  if (result && !/^0[35789]\d{8}$/.test(result))
    invalid(
      "phone",
      "Số điện thoại phải có 10 số, bắt đầu bằng 03, 05, 07, 08 hoặc 09.",
    );
  return result;
};
const password = (value, field = "password", creating = true) => {
  if (
    typeof value !== "string" ||
    !value ||
    (creating && (value.length < 8 || Buffer.byteLength(value, "utf8") > 72))
  ) {
    invalid(
      field,
      creating
        ? "Mật khẩu cần ít nhất 8 ký tự và không quá 72 byte."
        : "Vui lòng nhập mật khẩu.",
    );
  }
  return value;
};
const otp = (value) => {
  // Giữ tương thích OTP dạng số; không ép object/array thành chuỗi.
  if (typeof value === "number" && Number.isInteger(value))
    value = String(value);
  if (typeof value !== "string" || !/^\d{6}$/.test(value.trim()))
    invalid("otp", "Mã xác thực phải gồm 6 chữ số.");
  return value.trim();
};
const boolean = (value, field) => {
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;
  invalid(field, `Trường ${field} phải là true hoặc false.`);
};
const positiveInteger = (value, fallback, field, maximum) => {
  if (value === undefined || value === "") return fallback;
  if (
    !["number", "string"].includes(typeof value) ||
    !/^\d+$/.test(String(value)) ||
    !Number.isSafeInteger(Number(value)) ||
    Number(value) < 1
  )
    invalid(field, `Trường ${field} phải là số nguyên dương.`);
  return maximum ? Math.min(Number(value), maximum) : Number(value);
};
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
module.exports = {
  invalid,
  object,
  text,
  id,
  email,
  phone,
  password,
  otp,
  boolean,
  positiveInteger,
  escapeRegex,
};
