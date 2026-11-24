const router = require("express").Router();
const { authenticate } = require("../middlewares/auth.middleware");
const authorizeActiveCustomer = require("../middlewares/garden.middleware");
const { uploadDiagnosisPhoto } = require("../middlewares/diagnosis-upload.middleware");
const { identify } = require("../controllers/diagnosis.controller");

router.post("/", authenticate, authorizeActiveCustomer, require("../middlewares/vip.middleware"), uploadDiagnosisPhoto, identify);
module.exports = router;
