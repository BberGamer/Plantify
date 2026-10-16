// middlewares/errorHandler.js - Xu ly loi tap trung cua toan he thong
const { error } = require("../utils/apiResponse");

const errorHandler = (err, req, res, next) => {
  console.error(`[Error Handler] ${req.method} ${req.url} ->`, err);

  const statusCode = err.statusCode || (err.name === "ValidationError" ? 400 : 500);
  const message = err.message || "Lỗi máy chủ nội bộ. Vui lòng thử lại sau";

  return error(res, message, statusCode);
};

module.exports = errorHandler;