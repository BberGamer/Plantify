// api.js - Cac ham goi API lien quan toi reports.
import { api } from "@/lib/api";

export const reportPost = async (postId, reason) => {
  const response = await api.post("/reports", { postId, reason });
  return response.data;
};
