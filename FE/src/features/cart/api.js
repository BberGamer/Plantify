// api.js - Gọi API giỏ hàng, mã giảm giá và phí vận chuyển
import { api } from "@/lib/api";

/** Lấy giỏ hàng của người dùng hiện tại. @returns {Promise<Object>} Dữ liệu giỏ hàng. */
export async function getCart() {
  const response = await api.get("/cart");
  return response.data;
}

/** Thêm sản phẩm vào giỏ hàng. @param {Object} payload - Sản phẩm và số lượng cần thêm. @returns {Promise<Object>} Giỏ hàng sau cập nhật. */
export async function addCartItem(payload) {
  const response = await api.post("/cart/items", payload);
  return response.data;
}

/** Hợp nhất giỏ hàng cục bộ vào tài khoản. @param {Array} items - Các cart item cục bộ. @returns {Promise<Object>} Giỏ hàng sau hợp nhất. */
export async function mergeCart(items) {
  const response = await api.post("/cart/merge", { items });
  return response.data;
}

/** Cập nhật một cart item. @param {string} productId - ID sản phẩm. @param {Object} payload - Dữ liệu số lượng/trạng thái mới. @returns {Promise<Object>} Giỏ hàng sau cập nhật. */
export async function updateCartItem(productId, payload) {
  const response = await api.patch(`/cart/items/${productId}`, payload);
  return response.data;
}

/** Xóa sản phẩm khỏi giỏ hàng. @param {string} productId - ID sản phẩm. @returns {Promise<Object>} Giỏ hàng sau khi xóa. */
export async function removeCartItem(productId) {
  const response = await api.delete(`/cart/items/${productId}`);
  return response.data;
}

/** Xóa tất cả sản phẩm đang được chọn. @returns {Promise<Object>} Giỏ hàng sau khi xóa. */
export async function removeSelectedCartItems() {
  const response = await api.delete("/cart/items/selected");
  return response.data;
}
