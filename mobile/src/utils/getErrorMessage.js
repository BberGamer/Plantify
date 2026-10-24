// getErrorMessage.js - Chuyển lỗi kỹ thuật thành thông báo tiếng Việt cho người dùng.
export default function getErrorMessage(error, fallback = "Đã xảy ra lỗi. Vui lòng thử lại.") {
  if (error?.code === "ECONNABORTED" || error?.code === "ETIMEDOUT") {
    return "Yêu cầu đã hết thời gian chờ. Vui lòng thử lại.";
  }
  const message = typeof error === "string"
    ? error
    : error?.response?.data?.message || error?.message;
  if (error?.code === "ERR_NETWORK" || /^(Network Error|Network request failed|Failed to fetch)$/i.test(message || "")) {
    return "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.";
  }
  if (/^timeout of \d+ms exceeded$/i.test(message || "")) {
    return "Yêu cầu đã hết thời gian chờ. Vui lòng thử lại.";
  }
  if (error?.response?.status >= 500) {
    return "Máy chủ đang gặp sự cố. Vui lòng thử lại sau.";
  }
  // Giữ thông báo nghiệp vụ tiếng Việt; dùng thông báo dự phòng cho lỗi thư viện.
  if (typeof message === "string" && /[\u00C0-\u024F\u1E00-\u1EFF]/.test(message)) {
    return message.trim();
  }
  return fallback;
}
