import { api } from "@/lib/api";

export async function getCart() {
  const response = await api.get("/cart");
  return response.data;
}

export async function addCartItem(payload) {
  const response = await api.post("/cart/items", payload);
  return response.data;
}

export async function mergeCart(items) {
  const response = await api.post("/cart/merge", { items });
  return response.data;
}

export async function updateCartItem(productId, payload) {
  const response = await api.patch(`/cart/items/${productId}`, payload);
  return response.data;
}

export async function removeCartItem(productId) {
  const response = await api.delete(`/cart/items/${productId}`);
  return response.data;
}

export async function removeSelectedCartItems() {
  const response = await api.delete("/cart/items/selected");
  return response.data;
}
