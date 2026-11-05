const garden = require("../services/garden.service");
const { success } = require("../utils/api-response");
const { savePhoto } = require("../middlewares/garden-upload.middleware");
const fs = require("node:fs/promises");

const create = async (req) => {
  let photo;
  try {
    if (req.file) photo = await savePhoto(req.file);
    return await garden.create(req.user.id, {
      ...req.body, ...(photo ? { plant_image_url: photo.url } : {}),
    });
  } catch (error) {
    if (photo) await fs.unlink(photo.filename).catch(() => console.error("[Upload] Cleanup failed"));
    throw error;
  }
};

const handle = (action, message, status = 200) => async (req, res, next) => {
  try {
    const data = await action(req);
    return success(res, message, data, status);
  } catch (error) { next(error); }
};

module.exports = {
  list: handle((req) => garden.list(req.user.id, req.query), "Lấy danh sách cây thành công."),
  create: handle(create, "Thêm cây vào vườn thành công.", 201),
  detail: handle((req) => garden.detail(req.user.id, req.params.id), "Lấy thông tin cây thành công."),
  update: handle((req) => garden.update(req.user.id, req.params.id, req.body), "Cập nhật cây thành công."),
  archive: handle((req) => garden.archive(req.user.id, req.params.id), "Lưu trữ cây thành công."),
};
