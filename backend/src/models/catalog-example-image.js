const mongoose = require("mongoose");
// Đọc ảnh từ bản ghi cũ khi chưa có thư viện ảnh.
const schema = new mongoose.Schema({
  image_url: { type: String, required: true, trim: true, maxlength: 2048 },
  caption: { type: String, required: true, trim: true, maxlength: 120 },
}, { _id: false });

module.exports = {
  type: [schema],
  default: undefined,
};
