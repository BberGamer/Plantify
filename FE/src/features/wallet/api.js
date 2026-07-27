// api.js - Gọi API số dư, giao dịch và nạp tiền ví
import { api } from "@/lib/api";

/** Lấy thông tin ví của người dùng hiện tại. @returns {Promise<Object>} Axios response của ví. */
export const getMyWallet = () => api.get("/wallet");
