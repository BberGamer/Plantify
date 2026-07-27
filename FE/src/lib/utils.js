// utils.js - Cung cấp tiện ích ghép và xử lý tên lớp CSS dùng chung
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
export {
  cn
};
