const favorite = require("../services/favorite.service");
const { success } = require("../utils/api-response");

const handle = (action, message) => async (req, res, next) => {
  try { return success(res, message, await action(req)); }
  catch (error) { next(error); }
};

module.exports = {
  list: handle((req) => favorite.list(req.user.id, req.query), "Lấy cây yêu thích thành công."),
  status: handle((req) => favorite.status(req.user.id, req.query), "Lấy trạng thái yêu thích thành công."),
  add: handle((req) => favorite.add(req.user.id, req.params.plantId), "Đã thêm vào cây yêu thích."),
  remove: handle((req) => favorite.remove(req.user.id, req.params.plantId), "Đã bỏ yêu thích cây."),
};
