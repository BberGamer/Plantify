const multer = require("multer");
const AppError = require("../utils/app-error");

const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;
const parse = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_DOCUMENT_BYTES, files: 1, fields: 3, parts: 4 },
}).single("document");

const uploadTreatmentDocument = (req, res, next) =>
  parse(req, res, (error) => {
    if (error)
      return next(
        new AppError(
          "INVALID_TREATMENT_DOCUMENT",
          error.code === "LIMIT_FILE_SIZE" ? 413 : 400,
          "Chỉ tải một file DOCX tối đa 10 MB.",
        ),
      );
    if (!req.file) return next();
    const name = req.file.originalname || "";
    const isDocx =
      name.toLowerCase().endsWith(".docx") &&
      req.file.buffer.subarray(0, 2).toString("ascii") === "PK";
    if (!isDocx)
      return next(
        new AppError(
          "INVALID_TREATMENT_DOCUMENT",
          415,
          "Tài liệu tham chiếu phải là file DOCX hợp lệ.",
        ),
      );
    next();
  });

module.exports = { uploadTreatmentDocument, MAX_DOCUMENT_BYTES };
