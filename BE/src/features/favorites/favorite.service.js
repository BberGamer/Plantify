// favorite.service.js - Business logic cho chức năng yêu thích cây
const mongoose = require('mongoose');
const Favorite = require('./favorite.model');

function ensureObjectId(id, message = 'ID không hợp lệ') {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error(message);
    error.statusCode = 400;
    throw error;
  }
}

/**
 * Lấy danh sách cây yêu thích của một user, populate thông tin cây
 * @param {string} userId
 * @returns {Promise<Array>}
 */
async function getFavoritesByUser(userId) {
  ensureObjectId(userId, 'User ID không hợp lệ');

  return Favorite.find({ userId })
    .populate('plantId', 'name scientificName thumbnail images difficultyLevel')
    .sort({ createdAt: -1 })
    .lean();
}

/**
 * Thêm cây vào danh sách yêu thích
 * @param {string} userId
 * @param {string} plantId
 * @returns {Promise<object>}
 */
async function addFavorite(userId, plantId) {
  ensureObjectId(userId, 'User ID không hợp lệ');
  ensureObjectId(plantId, 'Plant ID không hợp lệ');

  // findOneAndUpdate với upsert để tránh duplicate
  const favorite = await Favorite.findOneAndUpdate(
    { userId, plantId },
    { userId, plantId },
    { upsert: true, new: true }
  ).populate('plantId', 'name scientificName thumbnail images difficultyLevel');

  return favorite;
}

/**
 * Xóa cây khỏi danh sách yêu thích
 * @param {string} userId
 * @param {string} plantId
 * @returns {Promise<void>}
 */
async function removeFavorite(userId, plantId) {
  ensureObjectId(userId, 'User ID không hợp lệ');
  ensureObjectId(plantId, 'Plant ID không hợp lệ');

  await Favorite.findOneAndDelete({ userId, plantId });
}

/**
 * Kiểm tra xem user đã thích cây này chưa
 * @param {string} userId
 * @param {string} plantId
 * @returns {Promise<boolean>}
 */
async function isFavorited(userId, plantId) {
  ensureObjectId(userId, 'User ID không hợp lệ');
  ensureObjectId(plantId, 'Plant ID không hợp lệ');

  const found = await Favorite.findOne({ userId, plantId });
  return !!found;
}

module.exports = { getFavoritesByUser, addFavorite, removeFavorite, isFavorited };
