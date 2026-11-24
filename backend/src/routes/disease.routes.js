// routes/disease.routes.js - Các endpoint đọc danh mục bệnh cây
const express = require("express");
const diseaseController = require("../controllers/disease.controller");
const catalogUpload = require("../middlewares/catalog-upload.middleware");
const {
  authenticate,
  authorizeManager,
} = require("../middlewares/auth.middleware");

const router = express.Router();

router.use("/manager", authenticate, authorizeManager);
router.get("/manager/ai-labels", require("../controllers/catalog-ai.controller").diseaseLabels);
router.get("/manager", diseaseController.getManagerDiseases);
router.post("/manager", catalogUpload, diseaseController.createDisease);
router.get("/manager/:id", diseaseController.getManagerDiseaseById);
router.put("/manager/:id", catalogUpload, diseaseController.updateDisease);
router.delete("/manager/:id", diseaseController.deleteDisease);

router.get("/", diseaseController.getDiseases);
router.get("/:id", diseaseController.getDiseaseById);

module.exports = router;
