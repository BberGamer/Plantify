// ai.routes.js - Định nghĩa route chẩn đoán bệnh cây bằng AI
const express = require('express');
const aiController = require('./ai.controller');
const { uploadDiagnosisImage } = require('../../middlewares/aiDiagnosis.upload');
const {
  authenticate,
  authorizeCustomer,
} = require('../../middlewares/auth');

const router = express.Router();

// POST /api/ai/diagnose - Customer chẩn đoán bệnh cây và lưu lịch sử
router.post(
  '/diagnose',
  authenticate,
  authorizeCustomer,
  uploadDiagnosisImage,
  aiController.diagnosePlantDisease
);

module.exports = router;
