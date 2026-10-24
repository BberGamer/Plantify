// roles.js - Nhãn vai trò tiếng Việt dùng chung trên giao diện.
export const ROLE_LABELS = {
  customer: "Khách hàng",
  manager: "Quản lý",
  admin: "Quản trị viên",
};

export const getRoleLabel = (role) => ROLE_LABELS[role] || "Không xác định";
