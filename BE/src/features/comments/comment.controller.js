// comment.controller.js - Xu ly request/response cho binh luan bai viet Plantify
const commentService = require('./comment.service');
const apiResponse = require('../../utils/apiResponse');

async function getAllComments(req, res, next) {
  try {
    const comments = await commentService.getAllComments(req.query);
    return apiResponse.success(res, 'Lay danh sach binh luan thanh cong', comments);
  } catch (error) {
    return next(error);
  }
}

async function getCommentsByPostId(req, res, next) {
  try {
    const comments = await commentService.getCommentsByPostId(req.params.postId);
    return apiResponse.success(res, 'Lay binh luan cua bai viet thanh cong', comments);
  } catch (error) {
    return next(error);
  }
}

async function createComment(req, res, next) {
  try {
    const comment = await commentService.createComment(req.body, req.user);
    return apiResponse.success(res, 'Tao binh luan thanh cong', comment, 201);
  } catch (error) {
    return next(error);
  }
}

async function getCommentsByProductId(req, res, next) {
  try {
    const comments = await commentService.getCommentsByProductId(req.params.productId);
    return apiResponse.success(res, 'Lay binh luan cua san pham thanh cong', comments);
  } catch (error) {
    return next(error);
  }
}

async function createProductComment(req, res, next) {
  try {
    const comment = await commentService.createProductComment(req.body, req.user);
    return apiResponse.success(res, 'Tao danh gia san pham thanh cong', comment, 201);
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
