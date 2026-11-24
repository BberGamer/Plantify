const catalogAi = require("../services/catalog-ai.service");
const { success } = require("../utils/api-response");

const list = kind => async (req, res, next) => {
  try {
    return success(res, "Lấy nhãn AI thành công.", await catalogAi.listLabels(kind));
  } catch (error) { next(error); }
};

module.exports = { plantLabels: list("plant"), diseaseLabels: list("disease") };
