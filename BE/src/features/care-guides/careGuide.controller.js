// careGuide.controller.js - Xử lý request/response cho CareGuides
// Cung cấp các action CRUD: lấy danh sách, chi tiết, tạo, cập nhật, xóa care guide
const careGuideService = require('./careGuide.service');
const apiResponse = require('../../utils/apiResponse');

/**
 * Xử lý request GET /api/care-guides.
 */
async function getAllCareGuides(req, res, next) {
  try {
    const result = await careGuideService.getAllCareGuides(req.query);
    return apiResponse.success(res, 'Lấy danh sách care guides thành công', result);
  } catch (error) {
    return next(error);
  }
}

/**
 * Xử lý request GET /api/care-guides/:id.
 */
async function getCareGuideById(req, res, next) {
  try {
    const { id } = req.params;
    const careGuide = await careGuideService.getCareGuideById(id);
    if (!careGuide) {
      return apiResponse.notFound(res, 'Không tìm thấy care guide');
    }
    return apiResponse.success(res, 'Lấy chi tiết care guide thành công', careGuide);
  } catch (error) {
    return next(error);
  }
}

/**
 * Xử lý request POST /api/care-guides.
 */
async function createCareGuide(req, res, next) {
  try {
    const careGuide = await careGuideService.createCareGuide(req.body);
    return apiResponse.created(res, 'Tạo care guide thành công', careGuide);
  } catch (error) {
    return next(error);
  }
}

/**
 * Xử lý request PUT /api/care-guides/:id.
 */
async function updateCareGuide(req, res, next) {
  try {
    const { id } = req.params;
    const careGuide = await careGuideService.updateCareGuide(id, req.body);
    if (!careGuide) {
      return apiResponse.notFound(res, 'Không tìm thấy care guide');
    }
    return apiResponse.success(res, 'Cập nhật care guide thành công', careGuide);
  } catch (error) {
    return next(error);
  }
}

/**
 * Xử lý request DELETE /api/care-guides/:id.
 */
async function deleteCareGuide(req, res, next) {
  try {
    const { id } = req.params;
    const careGuide = await careGuideService.deleteCareGuide(id);
    if (!careGuide) {
      return apiResponse.notFound(res, 'Không tìm thấy care guide');
    }
    return apiResponse.success(res, 'Xóa care guide thành công', careGuide);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getAllCareGuides,
  getCareGuideById,
  createCareGuide,
  updateCareGuide,
  deleteCareGuide,
};
