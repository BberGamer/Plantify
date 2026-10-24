class AppError extends Error {
  constructor(code, statusCode, message, errors) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    if (errors) this.errors = errors;
  }
}
module.exports = AppError;
