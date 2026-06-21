// favorite.controller.js - Controller xử lý request/response cho favorites
const favoriteService = require('./favorite.service');
const { success, created, error, notFound } = require('../../utils/apiResponse');

/**
 * GET /api/favorites - Lấy danh sách cây yêu thích của user hiện tại
 */
async function getMyFavorites(req, res) {
  try {
    const favorites = await favoriteService.getFavoritesByUser(req.user.id);
    return success(res, 'Lấy danh sách yêu thích thành công', favorites);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
}

/**
 * POST /api/favorites/:plantId - Thêm cây vào yêu thích
 */
async function addFavorite(req, res) {
  try {
    const { plantId } = req.params;
    const favorite = await favoriteService.addFavorite(req.user.id, plantId);
    return created(res, 'Đã thêm vào danh sách yêu thích', favorite);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
}

/**
 * DELETE /api/favorites/:plantId - Xóa cây khỏi yêu thích
 */
async function removeFavorite(req, res) {
  try {
    const { plantId } = req.params;
    await favoriteService.removeFavorite(req.user.id, plantId);
    return success(res, 'Đã xóa khỏi danh sách yêu thích');
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
}

/**
 * GET /api/favorites/:plantId/check - Kiểm tra đã thích cây này chưa
 */
async function checkFavorite(req, res) {
  try {
    const { plantId } = req.params;
    const favorited = await favoriteService.isFavorited(req.user.id, plantId);
    return success(res, 'Kiểm tra thành công', { favorited });
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
}

module.exports = { getMyFavorites, addFavorite, removeFavorite, checkFavorite };
