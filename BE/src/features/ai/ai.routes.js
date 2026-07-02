// ai.routes.js - Định nghĩa các route cho AI features (chat, chẩn đoán bệnh cây)
const express = require('express');
const aiController = require('./ai.controller');
const { uploadDiagnosisImage } = require('../../middlewares/aiDiagnosis.upload');

const router = express.Router();

// POST /api/ai/chat - Gọi Groq AI chat để trả lời câu hỏi
router.post('/chat', aiController.generateText);

// POST /api/ai/diagnose - Chẩn đoán bệnh cây từ ảnh
router.post('/diagnose', uploadDiagnosisImage, aiController.diagnosePlantDisease);

module.exports = router;
