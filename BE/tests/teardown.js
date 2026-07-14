// tests/teardown.js - Dọn dẹp tài nguyên sau khi Jest chạy xong toàn bộ test
// Hiện tại không cần cleanup gì vì dùng manual mock thay vì kết nối DB thật
module.exports = async () => {
  // Reset biến môi trường nếu cần
  // Hiện tại để trống, có thể thêm logic cleanup khi dùng integration test
};
