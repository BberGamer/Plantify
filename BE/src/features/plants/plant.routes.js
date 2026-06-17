// plant.routes.js - Định nghĩa các route cho Plants
const express = require('express');
const plantController = require('./plant.controller');

const router = express.Router();

// GET /api/plants/tags - Lấy danh sách tags độc nhất.
router.get('/tags', plantController.getAllTags);

// GET /api/plants - Lấy danh sách cây.
router.get('/', plantController.getAllPlants);

// GET /api/plants/:id - Lấy chi tiết một cây.
router.get('/:id', plantController.getPlantById);

// POST /api/plants - Tạo mới một cây.
router.post('/', plantController.createPlant);

// PUT /api/plants/:id - Cập nhật một cây.
router.put('/:id', plantController.updatePlant);

// DELETE /api/plants/:id - Xóa một cây.
router.delete('/:id', plantController.deletePlant);

module.exports = router;
