// post.routes.js - Dinh nghia cac route cho bai viet Plantify
const express = require('express');
const postController = require('./post.controller');
const { authenticate, authorizeCustomer } = require('../../middlewares/auth');

const router = express.Router();

// POST /api/posts - Customer tao bai viet moi.
router.post('/', authenticate, authorizeCustomer, postController.createPost);

// GET /api/posts - Lay danh sach bai viet.
router.get('/', postController.getAllPosts);

// GET /api/posts/featured - Lay danh sach bai viet noi bat.
router.get('/featured', postController.getFeaturedPosts);

// GET /api/posts/my - Customer lay danh sach bai viet cua minh.
router.get('/my', authenticate, authorizeCustomer, postController.getMyPosts);

// PATCH /api/posts/:id - Customer cap nhat bai viet cua chinh minh.
router.patch('/:id', authenticate, authorizeCustomer, postController.updatePost);

// PUT /api/posts/:id - Customer cap nhat bai viet cua chinh minh.
router.put('/:id', authenticate, authorizeCustomer, postController.updatePost);

// DELETE /api/posts/:id - Customer xoa bai viet cua chinh minh.
router.delete('/:id', authenticate, authorizeCustomer, postController.deletePost);

// GET /api/posts/:id - Lay chi tiet bai viet.
router.get('/:id', postController.getPostById);

module.exports = router;
