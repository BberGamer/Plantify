// comment.routes.js - Dinh nghia cac route cho binh luan bai viet va san pham Plantify
const express = require('express');
const commentController = require('./comment.controller');
const { authenticate, authorizeCustomer } = require('../../middlewares/auth');

const router = express.Router();

router.get('/', commentController.getAllComments);
router.get('/post/:postId', commentController.getCommentsByPostId);
router.post('/', authenticate, authorizeCustomer, commentController.createComment);

// Routes danh gia san pham
router.get('/product/:productId', commentController.getCommentsByProductId);
router.post('/product', authenticate, authorizeCustomer, commentController.createProductComment);

module.exports = router;
