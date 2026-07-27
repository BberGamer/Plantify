// adminUsers.utils.js - Cung cấp tiện ích hiển thị vai trò và trạng thái người dùng quản trị
const roleBadgeClassNames = {
  Admin: "border-green-200 bg-white text-green-700",
  "Business Manager": "border-green-200 bg-white text-green-700",
  "Content Manager": "border-green-200 bg-white text-green-700",
  Customer: "border-green-200 bg-white text-green-700"
};

const roleBadgeVariants = {
  Admin: "outline",
  "Business Manager": "outline",
  "Content Manager": "outline",
  Customer: "outline"
};

const statusBadgeClassNames = {
  "Hoạt động": "border-transparent bg-green-100 text-green-700",
  "Tạm khóa": "border-transparent bg-stone-200 text-stone-700"
};

const initialCreateUserForm = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  password: "",
  confirmPassword: "",
  role: ""
};

/** Ánh xạ role backend sang nhãn quản trị. @param {string} role - Role backend. @returns {string} Nhãn role. */
const mapRoleLabel = (role) => {
  switch (role) {
    case "admin":
      return "Admin";
    case "business manager":
      return "Business Manager";
    case "content manager":
      return "Content Manager";
    default:
      return "Customer";
  }
};

/** Ánh xạ trạng thái boolean sang nhãn hoạt động. @param {boolean} status - Trạng thái tài khoản. @returns {string} Nhãn trạng thái. */
const mapStatusLabel = (status) => {
  return status
    ? "Hoạt động"
    : "Tạm khóa";
};

/** Định dạng ngày cho bảng người dùng. @param {string|Date} dateValue - Ngày cần định dạng. @returns {string} Ngày hiển thị hoặc `--`. */
const formatDate = (dateValue) => {
  if (!dateValue) {
    return "--";
  }

  return new Date(dateValue).toLocaleDateString("vi-VN");
};

/** Tạo tối đa hai chữ cái đầu từ họ tên. @param {string} fullName - Họ tên người dùng. @returns {string} Chữ viết tắt viết hoa. */
const getInitials = (fullName) => {
  return (fullName || "ND")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

export {
  formatDate,
  getInitials,
  initialCreateUserForm,
  mapRoleLabel,
  mapStatusLabel,
  roleBadgeClassNames,
  roleBadgeVariants,
  statusBadgeClassNames
};
