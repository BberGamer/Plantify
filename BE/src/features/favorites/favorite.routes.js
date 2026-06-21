// favorite.routes.js - Routes cho chức năng cây yêu thích
const express = require('express');
const router = express.Router();
const favoriteController = require('./favorite.controller');
const { authenticate } = require('../../middlewares/auth');

// Tất cả routes đều yêu cầu đăng nhập
router.use(authenticate);

// Lấy danh sách cây yêu thích của user hiện tại
router.get('/', favoriteController.getMyFavorites);

// Kiểm tra đã thích cây này chưa
router.get('/:plantId/check', favoriteController.checkFavorite);

// Thêm cây vào yêu thích
router.post('/:plantId', favoriteController.addFavorite);

// Xóa cây khỏi yêu thích
router.delete('/:plantId', favoriteController.removeFavorite);

module.exports = router;
