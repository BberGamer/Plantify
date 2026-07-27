// api.js - Gọi API số dư, giao dịch và nạp tiền ví
import { api } from "@/lib/api";

export const getMyWallet = () => api.get("/wallet");
