// plant.routes.js - Định nghĩa các route cho Plants
const express = require('express');
const plantController = require('./plant.controller');
const { authenticate } = require('../../middlewares/auth');

const router = express.Router();

// GET /api/plants/categories - Lấy danh sách danh mục cây.
router.get('/categories', plantController.getAllCategories);

// POST /api/plants/categories - Tạo danh mục cây mới.
router.post('/categories', authenticate, plantController.createCategory);

// DELETE /api/plants/categories/:id - Xóa danh mục cây.
router.delete('/categories/:id', authenticate, plantController.deleteCategory);

// PUT /api/plants/categories/:id - Cập nhật danh mục cây.
router.put('/categories/:id', authenticate, plantController.updateCategory);

// GET /api/plants/tags - Lấy danh sách tags độc nhất.
router.get('/tags', plantController.getAllTags);

// GET /api/plants - Lấy danh sách cây.
router.get('/', plantController.getAllPlants);

// GET /api/plants/:id - Lấy chi tiết một cây.
router.get('/:id', plantController.getPlantById);

// POST /api/plants - Tạo mới một cây.
router.post('/', authenticate, plantController.createPlant);

// PUT /api/plants/:id - Cập nhật một cây.
router.put('/:id', authenticate, plantController.updatePlant);

// DELETE /api/plants/:id - Xóa một cây.
router.delete('/:id', authenticate, plantController.deletePlant);

module.exports = router;
