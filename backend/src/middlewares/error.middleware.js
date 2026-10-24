const mongoose = require("mongoose");
const AppError = require("../utils/app-error");
const { error } = require("../utils/api-response");

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);
  if (err instanceof AppError) {
    return error(res, err.message, err.statusCode, {
      code: err.code,
      errors: err.errors,
    });
  }
  if (
    err instanceof mongoose.Error.CastError ||
    err instanceof mongoose.Error.ValidationError ||
    err.type === "entity.parse.failed"
  ) {
    return error(res, "Thông tin nhập chưa hợp lệ.", 400, {
      code: "VALIDATION_ERROR",
    });
  }
  if (err.type === "entity.too.large") {
    return error(res, "Dữ liệu gửi lên quá lớn.", 413, {
      code: "PAYLOAD_TOO_LARGE",
    });
  }
  if (err.code === 11000) {
    return error(res, "Dữ liệu đã được sử dụng.", 409, {
      code: "DUPLICATE_RESOURCE",
    });
  }
  // Raw error có thể chứa dữ liệu nhạy cảm; không ghi message, stack hoặc query.
  console.error("[Error Handler] Unexpected error");
  return error(res, "Máy chủ đang gặp sự cố. Vui lòng thử lại sau.", 500, {
    code: "INTERNAL_ERROR",
  });
};
module.exports = errorHandler;
