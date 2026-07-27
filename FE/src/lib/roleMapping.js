// roleMapping.js - Ánh xạ vai trò với trang tổng quan và quyền truy cập

export const ROLE_DASHBOARD = {
  customer: "/",
  business_manager: "/business",
  content_manager: "/content/plants",
  admin: "/admin",
};

export const ROUTE_ALLOWED_ROLES = {
  "/": ["customer"],
  "/business": ["business_manager"],
  "/content/plants": ["content_manager"],
  "/admin": ["admin"],
};

const normalizeRole = (role) =>
  role?.toLowerCase().replace(/_/g, " ");

/** Ánh xạ role hoặc đường dẫn hiện tại sang dashboard phù hợp. @param {string} role - Role backend/FE hoặc đường dẫn. @returns {string} Đường dẫn dashboard. */
export const getDashboardPath = (role) => {
  if (!role) return "/";
  if (role === "/unauthorized" || role === "/login") return "/";
  if (role.startsWith("/")) return role;
  return ROLE_DASHBOARD[normalizeRole(role).replace(/ /g, "_")] || "/";
};

/** Kiểm tra role người dùng có nằm trong danh sách role được phép. @param {string} userRole - Role hiện tại. @param {string[]} allowedRoles - Các role được phép. @returns {boolean} Kết quả kiểm tra quyền. */
export const isRoleAllowed = (userRole, allowedRoles) => {
  if (!userRole) return false;
  const normalized = userRole.replace(/_/g, " ").toLowerCase();
  return allowedRoles.some((role) => role.toLowerCase().replace(/_/g, " ") === normalized);
};
