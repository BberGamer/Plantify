// controllers/disease.controller.js - Điều phối request và response cho bệnh cây
const diseaseService = require("../services/disease.service");
const { success } = require("../utils/api-response");

const getDiseases = async (req, res, next) => {
  try {
    const result = await diseaseService.getPublicDiseases(req.query);
    return success(res, "Lấy danh sách bệnh cây thành công.", result);
  } catch (error) {
    next(error);
  }
};

const getDiseaseById = async (req, res, next) => {
  try {
    const disease = await diseaseService.getPublicDiseaseById(req.params.id);
    return success(res, "Lấy thông tin bệnh cây thành công.", disease);
  } catch (error) {
    next(error);
  }
};

const getManagerDiseases = async (req, res, next) => {
  try {
    const result = await diseaseService.getManagerDiseases(req.query);
    return success(res, "Lấy danh sách bệnh cây thành công.", result);
  } catch (error) {
    next(error);
  }
};

const getManagerDiseaseById = async (req, res, next) => {
  try {
    const disease = await diseaseService.getManagerDiseaseById(req.params.id);
    return success(res, "Lấy thông tin bệnh cây thành công.", disease);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDiseases,
  getDiseaseById,
  getManagerDiseases,
  getManagerDiseaseById,
};
