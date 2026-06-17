// careGuide.routes.js - Định nghĩa các route cho CareGuides
const express = require('express');
const careGuideController = require('./careGuide.controller');

const router = express.Router();

// GET /api/care-guides - Lấy danh sách care guides
router.get('/', careGuideController.getAllCareGuides);

// GET /api/care-guides/:id - Lấy chi tiết một care guide
router.get('/:id', careGuideController.getCareGuideById);

// POST /api/care-guides - Tạo mới care guide
router.post('/', careGuideController.createCareGuide);

// PUT /api/care-guides/:id - Cập nhật care guide
router.put('/:id', careGuideController.updateCareGuide);

// DELETE /api/care-guides/:id - Xóa care guide
router.delete('/:id', careGuideController.deleteCareGuide);

module.exports = router;
