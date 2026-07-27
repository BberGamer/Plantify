// ai.routes.js - Định nghĩa các route cho AI features (chat, chẩn đoán bệnh cây)
const express = require('express');
const aiController = require('./ai.controller');
const { uploadDiagnosisImage } = require('../../middlewares/aiDiagnosis.upload');
const {
  authenticate,
  authorizeCustomer,
} = require('../../middlewares/auth');

const router = express.Router();

// POST /api/ai/chat - Gọi Groq AI chat để trả lời câu hỏi
router.post('/chat', aiController.generateText);

// POST /api/ai/diagnose - Customer chẩn đoán bệnh cây và lưu lịch sử
router.post(
  '/diagnose',
  authenticate,
  authorizeCustomer,
  uploadDiagnosisImage,
  aiController.diagnosePlantDisease
);

module.exports = router;
