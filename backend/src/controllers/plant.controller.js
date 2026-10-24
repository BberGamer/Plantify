// controllers/plant.controller.js - Dieu phoi request & response cho Plants
const plantService = require('../services/plant.service');
const { success } = require('../utils/api-response');

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
    const plant = await plantService.createPlant(req.body);
    return success(res, 'Tạo cây thành công.', plant, 201);
  } catch (error) { next(error); }
};

const updatePlant = async (req, res, next) => {
  try {
    const plant = await plantService.updatePlant(req.params.id, req.body);
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
