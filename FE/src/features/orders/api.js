import { api } from "@/lib/api";

export async function createOrder(payload) {
  const response = await api.post("/orders", payload);
  return response.data;
}

export async function getMyOrders() {
  const response = await api.get("/orders/me");
  return response.data;
}
