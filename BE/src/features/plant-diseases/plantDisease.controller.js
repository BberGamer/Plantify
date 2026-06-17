// plantDisease.controller.js - Xử lý request/response cho PlantDiseases
// Cung cấp các action CRUD: lấy danh sách, chi tiết, tạo, cập nhật, xóa bệnh cây
const plantDiseaseService = require('./plantDisease.service');
const apiResponse = require('../../utils/apiResponse');

/**
 * Xử lý request GET /api/plant-diseases.
 */
async function getAllPlantDiseases(req, res, next) {
  try {
    const result = await plantDiseaseService.getAllPlantDiseases(req.query);
    return apiResponse.success(res, 'Lấy danh sách bệnh cây thành công', result);
  } catch (error) {
    return next(error);
  }
}

/**
 * Xử lý request GET /api/plant-diseases/:id.
 */
async function getPlantDiseaseById(req, res, next) {
  try {
    const { id } = req.params;
    const disease = await plantDiseaseService.getPlantDiseaseById(id);
    if (!disease) {
      return apiResponse.notFound(res, 'Không tìm thấy bệnh cây');
    }
    return apiResponse.success(res, 'Lấy chi tiết bệnh cây thành công', disease);
  } catch (error) {
    return next(error);
  }
}

/**
 * Xử lý request POST /api/plant-diseases.
 */
async function createPlantDisease(req, res, next) {
  try {
    const disease = await plantDiseaseService.createPlantDisease(req.body);
    return apiResponse.created(res, 'Tạo bệnh cây thành công', disease);
  } catch (error) {
    return next(error);
  }
}

/**
 * Xử lý request PUT /api/plant-diseases/:id.
 */
async function updatePlantDisease(req, res, next) {
  try {
    const { id } = req.params;
    const disease = await plantDiseaseService.updatePlantDisease(id, req.body);
    if (!disease) {
      return apiResponse.notFound(res, 'Không tìm thấy bệnh cây');
    }
    return apiResponse.success(res, 'Cập nhật bệnh cây thành công', disease);
  } catch (error) {
    return next(error);
  }
}

/**
 * Xử lý request DELETE /api/plant-diseases/:id.
 */
async function deletePlantDisease(req, res, next) {
  try {
    const { id } = req.params;
    const disease = await plantDiseaseService.deletePlantDisease(id);
    if (!disease) {
      return apiResponse.notFound(res, 'Không tìm thấy bệnh cây');
    }
    return apiResponse.success(res, 'Xóa bệnh cây thành công', disease);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getAllPlantDiseases,
  getPlantDiseaseById,
  createPlantDisease,
  updatePlantDisease,
  deletePlantDisease,
};
