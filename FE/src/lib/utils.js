// utils.js
// Gộp class Tailwind (clsx + tailwind-merge)
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
export {
  cn
};
