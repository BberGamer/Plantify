const router = require("express").Router();
const { authenticate } = require("../middlewares/auth.middleware");
const authorizeActiveCustomer = require("../middlewares/garden.middleware");
const { uploadDiagnosisPhoto } = require("../middlewares/diagnosis-upload.middleware");
const controller = require("../controllers/diagnosis.controller");

// Kiểm tra phiên/quyền trước khi đọc và giữ file upload trong bộ nhớ.
router.post("/", authenticate, authorizeActiveCustomer, uploadDiagnosisPhoto, controller.predict);

module.exports = router;
