// plant.controller.js - Xử lý request/response cho Plants
// Cung cấp các action CRUD: lấy danh sách, chi tiết, tạo, cập nhật, xóa cây
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

/**
 * Xử lý request GET /api/plants/:id.
 * Trả về chi tiết một cây.
 */
async function getPlantById(req, res, next) {
  try {
    const { id } = req.params;
    const { populate } = req.query;
    const plant = await plantService.getPlantById(id, populate === 'true');
    if (!plant) {
      return apiResponse.notFound(res, 'Không tìm thấy cây');
    }
    return apiResponse.success(res, 'Lấy chi tiết cây thành công', plant);
  } catch (error) {
    return next(error);
  }
}

/**
 * Xử lý request POST /api/plants.
 * Tạo mới một cây.
 */
async function createPlant(req, res, next) {
  try {
    const plant = await plantService.createPlant(req.body);
    return apiResponse.created(res, 'Tạo cây thành công', plant);
  } catch (error) {
    return next(error);
  }
}

/**
 * Xử lý request PUT /api/plants/:id.
 * Cập nhật một cây.
 */
async function updatePlant(req, res, next) {
  try {
    const { id } = req.params;
    const plant = await plantService.updatePlant(id, req.body);
    if (!plant) {
      return apiResponse.notFound(res, 'Không tìm thấy cây');
    }
    return apiResponse.success(res, 'Cập nhật cây thành công', plant);
  } catch (error) {
    return next(error);
  }
}

/**
 * Xử lý request DELETE /api/plants/:id.
 * Xóa một cây.
 */
async function deletePlant(req, res, next) {
  try {
    const { id } = req.params;
    const plant = await plantService.deletePlant(id);
    if (!plant) {
      return apiResponse.notFound(res, 'Không tìm thấy cây');
    }
    return apiResponse.success(res, 'Xóa cây thành công', plant);
  } catch (error) {
    return next(error);
  }
}

module.exports = { getAllPlants, getAllTags, getPlantById, createPlant, updatePlant, deletePlant };
