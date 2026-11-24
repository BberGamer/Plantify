const router = require("express").Router();
const { authenticate } = require("../middlewares/auth.middleware");
const authorizeActiveCustomer = require("../middlewares/garden.middleware");
const { uploadDiagnosisPhoto } = require("../middlewares/diagnosis-upload.middleware");
const controller = require("../controllers/diagnosis.controller");

// Xem lại dữ liệu của chính tài khoản không yêu cầu VIP còn hạn.
router.get("/history", authenticate, authorizeActiveCustomer, controller.history);
router.get("/history/:diagnosisId/image", authenticate, authorizeActiveCustomer, controller.historyImage);
router.get("/history/:diagnosisId", authenticate, authorizeActiveCustomer, controller.historyDetail);

// Kiểm tra phiên/quyền trước khi đọc và giữ file upload trong bộ nhớ.
router.post("/", authenticate, authorizeActiveCustomer, require("../middlewares/vip.middleware"), uploadDiagnosisPhoto, controller.predict);

module.exports = router;
