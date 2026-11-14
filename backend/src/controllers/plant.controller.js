// controllers/plant.controller.js - Dieu phoi request & response cho Plants
const plantService = require('../services/plant.service');
const { success } = require('../utils/api-response');
const { savePhoto } = require('../middlewares/garden-upload.middleware');
const fs = require('node:fs/promises');
const v = require('../validators/common');

// Multipart keeps structured care fields and booleans in a JSON payload.
async function savePlant(req, action) {
  let data = req.body;
  if (req.is('multipart/form-data')) {
    try { data = JSON.parse(req.body.payload); }
    catch { v.invalid('payload', 'Thông tin cây không hợp lệ.'); }
    v.object(data);
  }
  let photo;
  try {
    if (req.file) photo = await savePhoto(req.file);
    return await action({ ...data, ...(photo ? { plant_image: photo.url } : {}) });
  } catch (error) {
    if (photo) await fs.unlink(photo.filename).catch(() => console.error('[Upload] Cleanup failed'));
    throw error;
  }
}

/**
 * [GET] /plants/categories
 * Lay danh sach tat ca danh muc cay
 */
const getCategories = async (req, res, next) => {
  try {
    const categories = await plantService.getAllCategories();
    return success(res, 'Lấy danh mục cây thành công.', categories);
  } catch (error) {
    next(error);
  }
};

/**
 * [GET] /plants
 * Lay danh sach cay - co the loc theo category_id, search, phan trang
 * Query params: category_id, search, page, limit
 */
const getPlants = async (req, res, next) => {
  try {
    const { category_id, search, page, limit } = req.query;
    const result = await plantService.getAllPlants({ category_id, search, page, limit });
    return success(res, 'Lấy danh sách cây thành công.', result);
  } catch (error) {
    next(error);
  }
};

/**
 * [GET] /plants/:id
 * Lay chi tiet mot cay
 */
const getPlantById = async (req, res, next) => {
  try {
    const plant = await plantService.getPlantById(req.params.id);
    return success(res, 'Lấy thông tin cây thành công.', plant);
  } catch (error) {
    next(error);
  }
};

const getManagerPlants = async (req, res, next) => {
  try {
    const result = await plantService.getManagerPlants(req.query);
    return success(res, 'Lấy danh sách cây thành công.', result);
  } catch (error) { next(error); }
};

const createPlant = async (req, res, next) => {
  try {
    const plant = await savePlant(req, data => plantService.createPlant(data));
    return success(res, 'Tạo cây thành công.', plant, 201);
  } catch (error) { next(error); }
};

const updatePlant = async (req, res, next) => {
  try {
    const plant = await savePlant(req, data => plantService.updatePlant(req.params.id, data));
    return success(res, 'Cập nhật cây thành công.', plant);
  } catch (error) { next(error); }
};

const deletePlant = async (req, res, next) => {
  try {
    await plantService.deletePlant(req.params.id);
    return success(res, 'Xóa cây thành công.');
  } catch (error) { next(error); }
};

module.exports = { getCategories, getPlants, getPlantById, getManagerPlants, createPlant, updatePlant, deletePlant };
