// middlewares/error.middleware.js - Xu ly loi tap trung cua toan he thong
const { error } = require("../utils/api-response");

const errorHandler = (err, req, res, next) => {
  console.error(`[Error Handler] ${req.method} ${req.url} ->`, err);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Lỗi máy chủ nội bộ. Vui lòng thử lại sau";

  if (err.name === "CastError") {
    statusCode = 400;
    message = "Định dạng ID không hợp lệ.";
  } else if (err.name === "ValidationError") {
    statusCode = 400;
  }

  return error(res, message, statusCode);
};

module.exports = errorHandler;
