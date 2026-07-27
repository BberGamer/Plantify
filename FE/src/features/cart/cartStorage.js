// cartStorage.js - Cung cấp khóa và tiện ích lưu giỏ hàng trong bộ nhớ trình duyệt
export const CART_STORAGE_KEY = "cart";
export const CART_UPDATED_EVENT = "cart-updated";

/**
 * Chuẩn hóa một cart item từ các response shape cục bộ hoặc backend.
 * @param {Object} item - Cart item cần chuẩn hóa.
 * @returns {Object} Cart item có ID, giá, tồn kho và trạng thái chọn thống nhất.
 */
export function normalizeCartItem(item) {
  const product = item?.productId && typeof item.productId === "object" ? item.productId : null;
  const id = item?.id || product?._id || product?.id || item?.productId || "";

  return {
    id: String(id),
    productId: String(id),
    name: item?.name || product?.name || "Sản phẩm",
    price: Number(item?.price ?? product?.price ?? 0),
    quantity: Math.max(1, Number(item?.quantity || 1)),
    stock: Math.max(0, Number(item?.stock ?? product?.stock ?? item?.quantity ?? 1)),
    image:
      item?.image ||
      product?.thumbnail ||
      product?.images?.[0] ||
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400",
    shop: item?.shop || product?.brand || "Plantify Shop",
    selected: item?.selected !== false,
  };
}

/**
 * Chuẩn hóa danh sách cart item và loại bỏ phần tử không có ID.
 * @param {Array} items - Danh sách cart item thô.
 * @returns {Object[]} Danh sách cart item hợp lệ.
 */
export function normalizeCartItems(items) {
  return Array.isArray(items)
    ? items.map(normalizeCartItem).filter((item) => item.id)
    : [];
}

/**
 * Trích xuất payload giỏ hàng từ các response shape và tính tổng số lượng.
 * @param {Object} response - Response hoặc payload giỏ hàng.
 * @returns {Object} Payload giỏ hàng đã chuẩn hóa.
 */
export function extractCartPayload(response) {
  const payload = (response?.data?.items || response?.items)
    ? response.data || response
    : response?.data?.data || response?.data || response || {};

  const items = normalizeCartItems(payload.items || payload.cart?.items || []);
  const totalItems = Number(
    payload.totalItems ??
    payload.itemCount ??
    payload.count ??
    items.reduce((total, item) => total + Number(item.quantity || 1), 0)
  );

  return {
    ...payload,
    items,
    totalItems,
  };
}

/**
 * Đọc và chuẩn hóa giỏ hàng trong localStorage.
 * @returns {Object[]} Giỏ hàng cục bộ, hoặc mảng rỗng nếu dữ liệu không hợp lệ.
 */
export function readLocalCart() {
  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (!savedCart) return [];

    const cart = JSON.parse(savedCart);
    return normalizeCartItems(cart);
  } catch {
    return [];
  }
}

/**
 * Ghi giỏ hàng đã chuẩn hóa vào localStorage và phát sự kiện cập nhật.
 * @param {Array} items - Danh sách cart item cần lưu.
 * @returns {void}
 */
export function writeLocalCart(items) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(normalizeCartItems(items)));
  notifyCartUpdated();
}

/**
 * Xóa giỏ hàng cục bộ và phát sự kiện cập nhật.
 * @returns {void}
 */
export function clearLocalCart() {
  localStorage.removeItem(CART_STORAGE_KEY);
  notifyCartUpdated();
}

/**
 * Phát sự kiện trình duyệt để các vùng UI đồng bộ lại giỏ hàng.
 * @returns {void}
 */
export function notifyCartUpdated() {
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}

/**
 * Tính tổng số sản phẩm đang lưu trong giỏ hàng cục bộ.
 * @returns {number} Tổng quantity của các cart item.
 */
export function getLocalCartItemCount() {
  return readLocalCart().reduce((total, item) => total + Number(item.quantity || 1), 0);
}
