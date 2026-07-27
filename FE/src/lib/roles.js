// roles.js - Định nghĩa vai trò và các nhóm quyền sử dụng trong frontend
export const USER_ROLES = [
  "guest",
  "customer",
  "business_manager",
  "content_manager",
  "admin"
];

export const ROLE_LABELS = {
  guest: "Khach",
  customer: "Khach hang",
  business_manager: "Quan ly kinh doanh",
  content_manager: "Quan ly noi dung",
  admin: "Quan tri vien"
};

export const ROLE_RANK = {
  guest: 0,
  customer: 1,
  business_manager: 2,
  content_manager: 3,
  admin: 4
};

/** So sánh cấp quyền của hai role. @param {string} userRole - Role người dùng. @param {string} requiredRole - Role tối thiểu. @returns {boolean} `true` nếu người dùng đủ cấp quyền. */
export function hasMinimumRole(userRole, requiredRole) {
  return ROLE_RANK[userRole] >= ROLE_RANK[requiredRole];
}

// Ánh xạ role từ backend (có khoảng trắng) sang FE (underscore)
export const BACKEND_ROLE_MAP = {
  "business manager": "business_manager",
  "content manager": "content_manager",
};

/** Chuẩn hóa role có khoảng trắng từ backend sang role dùng dấu gạch dưới ở frontend. @param {string} backendRole - Role backend. @returns {string} Role frontend tương ứng. */
export function mapBackendRoleToFeRole(backendRole) {
  return BACKEND_ROLE_MAP[backendRole] || backendRole || "customer";
}
