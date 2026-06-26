export const CART_STORAGE_KEY = "cart";
export const CART_UPDATED_EVENT = "cart-updated";

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

export function normalizeCartItems(items) {
  return Array.isArray(items)
    ? items.map(normalizeCartItem).filter((item) => item.id)
    : [];
}

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

export function writeLocalCart(items) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(normalizeCartItems(items)));
  notifyCartUpdated();
}

export function clearLocalCart() {
  localStorage.removeItem(CART_STORAGE_KEY);
  notifyCartUpdated();
}

export function notifyCartUpdated() {
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}

export function getLocalCartItemCount() {
  return readLocalCart().reduce((total, item) => total + Number(item.quantity || 1), 0);
}
