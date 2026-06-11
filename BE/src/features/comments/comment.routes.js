// comment.routes.js - Dinh nghia cac route cho binh luan bai viet Plantify
const express = require('express');
const commentController = require('./comment.controller');

const router = express.Router();

router.get('/', commentController.getAllComments);
router.get('/post/:postId', commentController.getCommentsByPostId);
router.post('/', commentController.createComment);

module.exports = router;
