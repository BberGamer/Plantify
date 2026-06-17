// plantDisease.routes.js - Định nghĩa các route cho PlantDiseases
const express = require('express');
const plantDiseaseController = require('./plantDisease.controller');

const router = express.Router();

// GET /api/plant-diseases - Lấy danh sách bệnh cây
router.get('/', plantDiseaseController.getAllPlantDiseases);

// GET /api/plant-diseases/:id - Lấy chi tiết một bệnh cây
router.get('/:id', plantDiseaseController.getPlantDiseaseById);

// POST /api/plant-diseases - Tạo mới bệnh cây
router.post('/', plantDiseaseController.createPlantDisease);

// PUT /api/plant-diseases/:id - Cập nhật bệnh cây
router.put('/:id', plantDiseaseController.updatePlantDisease);

// DELETE /api/plant-diseases/:id - Xóa bệnh cây
router.delete('/:id', plantDiseaseController.deletePlantDisease);

module.exports = router;
