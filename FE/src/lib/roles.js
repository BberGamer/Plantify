// roles.js
// Vai trò người dùng và hàm so sánh quyền
export const USER_ROLES = [
  "guest",
  "customer",
  "sales",
  "manager",
  "admin",
];

export const ROLE_LABELS = {
  guest: "Khách",
  customer: "Khách hàng",
  sales: "Nhân viên bán hàng",
  manager: "Quản lý",
  admin: "Quản trị viên",
};

/** Numeric rank for role comparison (higher = more privilege). */
export const ROLE_RANK = {
  guest: 0,
  customer: 1,
  sales: 2,
  manager: 3,
  admin: 4,
};

/**
 * @param {string} userRole
 * @param {string} requiredRole
 */
export function hasMinimumRole(userRole, requiredRole) {
  return ROLE_RANK[userRole] >= ROLE_RANK[requiredRole];
}
