// userPlant.controller.js - Xử lý request/response cho CRUD My Garden
const apiResponse = require('../../utils/apiResponse');
const userPlantService = require('./userPlant.service');

/**
 * POST /api/my-garden - Tạo cây cho user đang đăng nhập.
 */
async function createUserPlant(req, res, next) {
  try {
    const userPlant = await userPlantService.createUserPlant(
      req.user.id,
      req.body
    );
    return apiResponse.created(res, 'Thêm cây vào My Garden thành công', userPlant);
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/my-garden - Lấy danh sách cây active của user.
 */
async function getMyUserPlants(req, res, next) {
  try {
    const userPlants = await userPlantService.getMyUserPlants(req.user.id);
    return apiResponse.success(
      res,
      'Lấy danh sách My Garden thành công',
      userPlants
    );
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/my-garden/:id - Lấy chi tiết cây thuộc user.
 */
async function getMyUserPlantById(req, res, next) {
  try {
    const userPlant = await userPlantService.getMyUserPlantById(
      req.user.id,
      req.params.id
    );
    if (!userPlant) {
      return apiResponse.notFound(res, 'Không tìm thấy cây trong My Garden');
    }
    return apiResponse.success(
      res,
      'Lấy chi tiết cây trong My Garden thành công',
      userPlant
    );
  } catch (error) {
    return next(error);
  }
}

/**
 * PATCH /api/my-garden/:id - Cập nhật cây thuộc user.
 */
async function updateMyUserPlant(req, res, next) {
  try {
    const userPlant = await userPlantService.updateMyUserPlant(
      req.user.id,
      req.params.id,
      req.body
    );
    if (!userPlant) {
      return apiResponse.notFound(res, 'Không tìm thấy cây trong My Garden');
    }
    return apiResponse.success(
      res,
      'Cập nhật cây trong My Garden thành công',
      userPlant
    );
  } catch (error) {
    return next(error);
  }
}

/**
 * DELETE /api/my-garden/:id - Xóa vĩnh viễn cây thuộc user.
 */
async function deleteMyUserPlant(req, res, next) {
  try {
    const userPlant = await userPlantService.deleteMyUserPlant(
      req.user.id,
      req.params.id
    );
    if (!userPlant) {
      return apiResponse.notFound(res, 'Không tìm thấy cây trong My Garden');
    }
    return apiResponse.success(
      res,
      'Xóa cây khỏi My Garden thành công',
      userPlant
    );
  } catch (error) {
    return next(error);
  }
}

/** Upload ảnh vào album cây của người dùng. @param {Object} req @param {Object} res @param {Function} next @returns {Promise<Object>} HTTP response. */
async function uploadUserPlantImage(req, res, next) {
  try {
    const userPlant = await userPlantService.uploadUserPlantImage(req.user.id, req.params.id, req.file, req.body);
    if (!userPlant) return apiResponse.notFound(res, 'Không tìm thấy cây trong My Garden');
    return apiResponse.created(res, 'Tải ảnh album thành công', userPlant);
  } catch (error) { return next(error); }
}

/** Cập nhật metadata ảnh trong album cây. @param {Object} req @param {Object} res @param {Function} next @returns {Promise<Object>} HTTP response. */
async function updateUserPlantImage(req, res, next) {
  try {
    const userPlant = await userPlantService.updateUserPlantImage(req.user.id, req.params.id, req.params.imageId, req.body);
    if (userPlant === null) return apiResponse.notFound(res, 'Không tìm thấy cây trong My Garden');
    if (userPlant === false) return apiResponse.notFound(res, 'Không tìm thấy ảnh album');
    return apiResponse.success(res, 'Cập nhật ảnh album thành công', userPlant);
  } catch (error) { return next(error); }
}

/** Xóa ảnh khỏi album cây và storage. @param {Object} req @param {Object} res @param {Function} next @returns {Promise<Object>} HTTP response. */
async function deleteUserPlantImage(req, res, next) {
  try {
    const userPlant = await userPlantService.deleteUserPlantImage(req.user.id, req.params.id, req.params.imageId);
    if (userPlant === null) return apiResponse.notFound(res, 'Không tìm thấy cây trong My Garden');
    if (userPlant === false) return apiResponse.notFound(res, 'Không tìm thấy ảnh album');
    return apiResponse.success(res, 'Xóa ảnh album thành công', userPlant);
  } catch (error) { return next(error); }
}

module.exports = {
  createUserPlant,
  getMyUserPlants,
  getMyUserPlantById,
  updateMyUserPlant,
  deleteMyUserPlant,
  uploadUserPlantImage,
  updateUserPlantImage,
  deleteUserPlantImage,
};
