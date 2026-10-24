// middlewares/error.middleware.js - Xu ly loi tap trung cua toan he thong
const { error } = require("../utils/api-response");

const errorHandler = (err, req, res, next) => {
  console.error(`[Error Handler] ${req.method} ${req.url} ->`, err);

  let statusCode = err.statusCode || 500;
  let message = "Máy chủ đang gặp sự cố. Vui lòng thử lại sau.";

  if (err.name === "CastError") {
    statusCode = 400;
    message = "Định dạng ID không hợp lệ.";
  } else if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Thông tin nhập chưa hợp lệ. Vui lòng kiểm tra lại các trường dữ liệu.";
  } else if (statusCode < 500) {
    message = typeof err.message === "string" && /[\u00C0-\u024F\u1E00-\u1EFF]/.test(err.message)
      ? err.message
      : "Yêu cầu chưa hợp lệ. Vui lòng kiểm tra lại thông tin.";
  }

  return error(res, message, statusCode);
};

module.exports = errorHandler;
