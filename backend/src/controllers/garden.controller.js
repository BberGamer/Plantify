const garden = require("../services/garden.service");
const { success } = require("../utils/api-response");

const handle = (action, message, status = 200) => async (req, res, next) => {
  try {
    const data = await action(req);
    return success(res, message, data, status);
  } catch (error) { next(error); }
};

module.exports = {
  list: handle((req) => garden.list(req.user.id, req.query), "Lấy danh sách cây thành công."),
  create: handle((req) => garden.create(req.user.id, req.body), "Thêm cây vào vườn thành công.", 201),
  detail: handle((req) => garden.detail(req.user.id, req.params.id), "Lấy thông tin cây thành công."),
  update: handle((req) => garden.update(req.user.id, req.params.id, req.body), "Cập nhật cây thành công."),
  archive: handle((req) => garden.archive(req.user.id, req.params.id), "Lưu trữ cây thành công."),
};
