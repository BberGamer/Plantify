// plant.controller.js - Xử lý request/response cho Plants
const plantService = require('./plant.service');
const apiResponse = require('../../utils/apiResponse');

/**
 * Xử lý request GET /api/plants.
 * Hỗ trợ search, tag, phân trang (page, limit).
 */
async function getAllPlants(req, res, next) {
  try {
    const result = await plantService.getAllPlants(req.query);
    return apiResponse.success(res, 'Lấy danh sách cây thành công', result);
  } catch (error) {
    return next(error);
  }
}

/**
 * Xử lý request GET /api/plants/tags.
 * Trả về danh sách tags độc nhất từ plants.
 */
async function getAllTags(req, res, next) {
  try {
    const tags = await plantService.getAllTags();
    return apiResponse.success(res, 'Lấy danh sách tags thành công', tags);
  } catch (error) {
    return next(error);
  }
}

module.exports = { getAllPlants, getAllTags };
