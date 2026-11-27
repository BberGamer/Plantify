const garden = require("../services/garden.service");
const { success } = require("../utils/api-response");
const { imageExtension } = require("../middlewares/garden-upload.middleware");
const {
  createGardenPhotos,
} = require("../integrations/cloudinary-photo.service");

const photos = createGardenPhotos();

const withPhoto = async (req, savePlant) => {
  if (!req.file) return savePlant(req.body);
  const { buffer } = req.file;
  const photo = await photos.save(buffer, imageExtension(buffer));
  try {
    return await savePlant({ ...req.body, plant_image_url: photo.url });
  } catch (error) {
    await photos
      .remove(photo)
      .catch(() =>
        console.error("[Garden] Không dọn được ảnh sau khi lưu cây thất bại."),
      );
    throw error;
  }
};

const create = (req) =>
  withPhoto(req, (input) => garden.create(req.user.id, input));
const update = (req) =>
  withPhoto(req, (input) => garden.update(req.user.id, req.params.id, input));

const handle =
  (action, message, status = 200) =>
  async (req, res, next) => {
    try {
      const data = await action(req);
      return success(res, message, data, status);
    } catch (error) {
      next(error);
    }
  };

module.exports = {
  list: handle(
    (req) => garden.list(req.user.id, req.query),
    "Lấy danh sách cây thành công.",
  ),
  create: handle(create, "Thêm cây vào vườn thành công.", 201),
  detail: handle(
    (req) => garden.detail(req.user.id, req.params.id),
    "Lấy thông tin cây thành công.",
  ),
  update: handle(update, "Cập nhật cây thành công."),
  archive: handle(
    (req) => garden.archive(req.user.id, req.params.id),
    "Lưu trữ cây thành công.",
  ),
  remove: handle(
    (req) => garden.archive(req.user.id, req.params.id),
    "Đã xóa cây khỏi vườn.",
  ),
};
