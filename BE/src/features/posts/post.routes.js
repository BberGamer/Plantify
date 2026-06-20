// post.routes.js - Định nghĩa các route cho bài viết Plantify
const express = require('express');
const postController = require('./post.controller');
const { authenticate, authorizeCustomer } = require('../../middlewares/auth');

const router = express.Router();

// POST /api/posts - Customer tạo bài viết mới.
router.post('/', authenticate, authorizeCustomer, postController.createPost);

// GET /api/posts - Lấy danh sách bài viết.
router.get('/', postController.getAllPosts);

// GET /api/posts/featured - Lấy danh sách bài viết nổi bật.
router.get('/featured', postController.getFeaturedPosts);

// GET /api/posts/:id - Lấy chi tiết bài viết.
router.get('/:id', postController.getPostById);

module.exports = router;
