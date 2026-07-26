// comment.controller.js - Xu ly request/response cho binh luan bai viet Plantify
const commentService = require('./comment.service');
const apiResponse = require('../../utils/apiResponse');

async function getAllComments(req, res, next) {
  try {
    const comments = await commentService.getAllComments(req.query);
    return apiResponse.success(res, 'Lấy danh sách bình luận thành công', comments);
  } catch (error) {
    return next(error);
  }
}

async function getCommentsByPostId(req, res, next) {
  try {
    const comments = await commentService.getCommentsByPostId(req.params.postId);
    return apiResponse.success(res, 'Lấy bình luận của bài viết thành công', comments);
  } catch (error) {
    return next(error);
  }
}

async function createComment(req, res, next) {
  try {
    const comment = await commentService.createComment(req.body, req.user);
    return apiResponse.success(res, 'Tạo bình luận thành công', comment, 201);
  } catch (error) {
    return next(error);
  }
}

async function getCommentsByProductId(req, res, next) {
  try {
    const comments = await commentService.getCommentsByProductId(req.params.productId);
    return apiResponse.success(res, 'Lấy bình luận của sản phẩm thành công', comments);
  } catch (error) {
    return next(error);
  }
}

async function createProductComment(req, res, next) {
  try {
    const comment = await commentService.createProductComment(req.body, req.user);
    return apiResponse.success(res, 'Tạo đánh giá sản phẩm thành công', comment, 201);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getAllComments,
  getCommentsByPostId,
  createComment,
  getCommentsByProductId,
  createProductComment,
};
