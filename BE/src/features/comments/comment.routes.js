// comment.routes.js - Dinh nghia cac route cho binh luan bai viet va san pham Plantify
const express = require('express');
const commentController = require('./comment.controller');

const router = express.Router();

router.get('/', commentController.getAllComments);
router.get('/post/:postId', commentController.getCommentsByPostId);
router.post('/', commentController.createComment);

// Routes danh gia san pham
router.get('/product/:productId', commentController.getCommentsByProductId);
router.post('/product', commentController.createProductComment);

module.exports = router;
