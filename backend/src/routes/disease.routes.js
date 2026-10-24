// routes/disease.routes.js - Các endpoint đọc danh mục bệnh cây
const express = require("express");
const diseaseController = require("../controllers/disease.controller");
const {
  authenticate,
  authorizeManager,
} = require("../middlewares/auth.middleware");

const router = express.Router();

router.use("/manager", authenticate, authorizeManager);
router.get("/manager", diseaseController.getManagerDiseases);
router.post("/manager", diseaseController.createDisease);
router.get("/manager/:id", diseaseController.getManagerDiseaseById);
router.put("/manager/:id", diseaseController.updateDisease);

router.get("/", diseaseController.getDiseases);
router.get("/:id", diseaseController.getDiseaseById);

module.exports = router;
