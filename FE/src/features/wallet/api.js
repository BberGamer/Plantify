import { api } from "@/lib/api";

export const getMyWallet = () => api.get("/wallet");
