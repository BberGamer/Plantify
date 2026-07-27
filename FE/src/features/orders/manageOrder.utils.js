// manageOrder.utils.js - Cung cấp hằng số và tiện ích hiển thị đơn hàng quản lý
const ORDER_PAGE_SIZE = 8;

const STATUS_LABELS = {
  pending: "Chờ xử lý",
  packing: "Đang đóng hàng",
  sented: "Đã gửi hàng",
  succeeded: "Nhận hàng thành công",
  returning: "Đang hoàn trả",
  cancelled: "Đã hủy",
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

const PAYMENT_STATUS_CONFIG = {
  pending: {
    label: "Chưa thanh toán",
    className: "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-50",
  },
  paid: {
    label: "Đã thanh toán",
    className: "border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-50",
  },
  failed: {
    label: "Thanh toán lỗi",
    className: "border-red-200 bg-red-50 text-red-700 hover:bg-red-50",
  },
  refunded: {
    label: "Đã hoàn vào ví",
    className: "border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-50",
  },
};

/** Lấy class badge tương ứng với trạng thái đơn hàng. @param {string} status - Trạng thái đơn. @returns {string} Chuỗi class hiển thị. */
function getStatusClassName(status) {
  const classes = {
    pending: "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50",
    packing: "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-50",
    sented: "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-50",
    succeeded: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50",
    returning: "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-50",
    cancelled: "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-50",
  };
  return classes[status] || "border-border bg-muted text-muted-foreground hover:bg-muted";
}

/** Định dạng số tiền theo tiền tệ Việt Nam. @param {number} amount - Số tiền. @returns {string} Chuỗi tiền VND. */
function formatVND(amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

/** Định dạng ngày ngắn theo locale Việt Nam. @param {string|Date} dateStr - Ngày cần định dạng. @returns {string} Ngày hiển thị hoặc chuỗi rỗng. */
function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("vi-VN");
}

/** Định dạng ngày giờ chi tiết theo locale Việt Nam. @param {string|Date} dateStr - Ngày cần định dạng. @returns {string} Ngày giờ hiển thị hoặc chuỗi rỗng. */
function formatDateTime(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Chuyển mã phương thức thanh toán thành nhãn UI. @param {string} method - Mã phương thức. @returns {string} Nhãn phương thức thanh toán. */
function getPaymentMethodLabel(method) {
  return method === "COD"
    ? "Thanh toán khi nhận hàng (COD)"
    : "Chuyển khoản Internet Banking (VNPay)";
}

/** Kiểm tra đơn hàng có kết hợp ví và thanh toán ngoài hay không. @param {Object} order - Đơn hàng. @returns {boolean} `true` nếu cả hai khoản đều lớn hơn 0. */
function isHybridPayment(order) {
  return Number(order.walletAmount || 0) > 0
    && Number(order.externalAmount || 0) > 0;
}

export {
  CANCELLATION_REASON_LABELS,
  ORDER_PAGE_SIZE,
  PAYMENT_STATUS_CONFIG,
  STATUS_LABELS,
  formatDate,
  formatDateTime,
  formatVND,
  getPaymentMethodLabel,
  getStatusClassName,
  isHybridPayment,
};
