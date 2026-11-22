const { upload, imageExtension } = require("./garden-upload.middleware");
const v = require("../validators/common");

function parseCatalogPayload(req, res, next) {
  if (!req.is("multipart/form-data")) return next();
  try {
    let data;
    try {
      data = JSON.parse(req.body.payload);
    } catch {
      v.invalid("payload", "Thông tin không hợp lệ.");
    }
    v.object(data);
    req.body = data;
    if (req.file) req.file.extension = imageExtension(req.file.buffer);
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = [upload, parseCatalogPayload];
