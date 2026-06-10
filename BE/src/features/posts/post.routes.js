// post.routes.js - Định nghĩa các route cho bài viết Plantify
const express = require('express');
const postController = require('./post.controller');

const router = express.Router();

// GET /api/posts - Lấy danh sách bài viết.
router.get('/', postController.getAllPosts);

// GET /api/posts/featured - Lấy danh sách bài viết nổi bật.
router.get('/featured', postController.getFeaturedPosts);

// GET /api/posts/:id - Lấy chi tiết bài viết.
router.get('/:id', postController.getPostById);

module.exports = router;
