// profilePage.utils.jsx - Cung cấp dữ liệu và tiện ích hiển thị cho trang hồ sơ
import { Badge } from "@/components/ui/badge";
import { Briefcase, Crown, Leaf, PenLine } from "lucide-react";

// === Cấu hình hiển thị role theo DB ===
const ROLE_CONFIG = {
  customer: {
    label: "Khách hàng",
    icon: Leaf,
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  admin: {
    label: "Quản trị viên",
    icon: Crown,
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
  "business manager": {
    label: "Quản lý kinh doanh",
    icon: Briefcase,
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  "content manager": {
    label: "Quản lý nội dung",
    icon: PenLine,
    className: "bg-purple-100 text-purple-700 border-purple-200",
  },
};

// === Cấu hình hiển thị trạng thái đơn hàng (khớp với enum order.model.js) ===
const STATUS_CONFIG = {
  pending: {
    label: "Chờ xử lý",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  packing: {
    label: "Đang đóng hàng",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  sented: {
    label: "Đã gửi hàng",
    className: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  succeeded: {
    label: "Nhận hàng thành công",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  returning: {
    label: "Đang hoàn trả",
    className: "bg-orange-50 text-orange-700 border-orange-200",
  },
  cancelled: {
    label: "Đã hủy",
    className: "bg-rose-50 text-rose-700 border-rose-200",
  },
};

const PAYMENT_STATUS_CONFIG = {
  pending: {
    label: "Chưa thanh toán",
    className: "bg-orange-50 text-orange-700 border-orange-200",
  },
  paid: {
    label: "Đã thanh toán",
    className: "bg-teal-50 text-teal-700 border-teal-200",
  },
  failed: {
    label: "Thanh toán lỗi",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  refunded: {
    label: "Đã hoàn vào ví",
    className: "bg-violet-50 text-violet-700 border-violet-200",
  },
};

const CANCELLATION_REASON_LABELS = {
  out_of_stock: "Hết hàng",
  defective_product: "Hàng lỗi",
  weather_incident: "Sự cố thời tiết",
  no_carrier: "Không có người vận chuyển",
  customer_return: "Khách hàng hoàn trả",
  customer_cancelled: "Khách hàng chủ động hủy",
  payment_failed: "Thanh toán không thành công",
};

/** Định dạng số tiền theo VND. @param {number} amount - Số tiền. @returns {string} Chuỗi tiền VND. */
function formatVND(amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

/** Tính phần tiền còn phải thanh toán sau khi trừ ví. @param {Object} order - Đơn hàng. @returns {number} Số tiền còn lại, không nhỏ hơn 0. */
function getRemainingPayment(order) {
  return Math.max(
    0,
    Number(order?.total || 0) - Number(order?.walletAmount || 0)
  );
}

/** Định dạng ngày giờ đặt hàng theo locale Việt Nam. @param {string|Date} dateStr - Ngày đặt hàng. @returns {string} Ngày giờ hiển thị. */
function formatOrderDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Số cây yêu thích hiển thị mỗi trang
const FAV_PER_PAGE = 6;



/** Lấy chữ cái đầu của phần tên cuối để làm avatar fallback. @param {string} name - Họ tên. @returns {string} Một chữ cái viết hoa. */
function getInitials(name) {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  return parts[parts.length - 1]?.charAt(0).toUpperCase() || "U";
}

/** Định dạng ngày tham gia thành tháng/năm. @param {string|Date} dateStr - Ngày tham gia. @returns {string} Chuỗi MM/YYYY. */
function formatJoinDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${month}/${year}`;
}

/** Hiển thị badge role theo cấu hình quyền. @param {Object} props - Component props. @param {string} props.role - Role người dùng. @returns {JSX.Element} Badge role. */
function RoleBadge({ role }) {
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.customer;
  const Icon = config.icon;
  return (
    <Badge variant="outline" className={`flex items-center gap-1.5 px-3 py-1 font-medium border ${config.className}`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </Badge>
  );
}


export {
  CANCELLATION_REASON_LABELS,
  FAV_PER_PAGE,
  PAYMENT_STATUS_CONFIG,
  ROLE_CONFIG,
  STATUS_CONFIG,
  RoleBadge,
  formatJoinDate,
  formatOrderDate,
  formatVND,
  getInitials,
  getRemainingPayment,
};
