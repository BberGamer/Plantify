// Thông báo theo code là hợp đồng chính; không công khai message tùy ý từ server.
const ERROR_MESSAGES = {
  SESSION_CHANGED: "Phiên đăng nhập đã thay đổi. Vui lòng thử lại.",
  SESSION_STORAGE_ERROR: "Không thể lưu phiên đăng nhập trên thiết bị. Vui lòng thử lại.",
  REQUEST_IN_PROGRESS: "Thao tác đang được xử lý. Vui lòng chờ.",
  INVALID_RESPONSE: "Dữ liệu máy chủ trả về không hợp lệ. Vui lòng thử lại.",
  VALIDATION_ERROR: "Thông tin nhập chưa hợp lệ. Vui lòng kiểm tra lại.",
  INVALID_ID: "Định dạng ID không hợp lệ.",
  INVALID_CREDENTIALS: "Email hoặc mật khẩu không chính xác.",
  ACCOUNT_LOCKED: "Tài khoản đã bị khóa. Vui lòng liên hệ hỗ trợ.",
  GOOGLE_ACCOUNT: "Vui lòng sử dụng tài khoản Google để tiếp tục.",
  CURRENT_PASSWORD_INVALID: "Mật khẩu hiện tại không chính xác.",
  EMAIL_IN_USE: "Email đã được sử dụng.",
  PHONE_IN_USE: "Số điện thoại đã được sử dụng.",
  CONTACT_IN_USE: "Email hoặc số điện thoại đã được sử dụng.",
  OTP_INVALID: "Mã xác thực không chính xác. Vui lòng kiểm tra lại.",
  OTP_EXPIRED: "Mã xác thực đã hết hạn. Vui lòng yêu cầu mã mới.",
  REGISTRATION_NOT_FOUND:
    "Thông tin đăng ký không tồn tại hoặc đã hết hạn. Vui lòng đăng ký lại.",
  USER_NOT_FOUND: "Không tìm thấy tài khoản.",
  PLANT_NOT_FOUND: "Không tìm thấy cây này.",
  CATEGORY_NOT_FOUND: "Không tìm thấy danh mục cây.",
  RESOURCE_NOT_FOUND: "Không tìm thấy tài nguyên.",
  DUPLICATE_RESOURCE: "Dữ liệu đã được sử dụng.",
  SELF_LOCK_FORBIDDEN: "Bạn không thể tự khóa tài khoản của chính mình.",
  SELF_ROLE_CHANGE_FORBIDDEN:
    "Bạn không thể tự hạ quyền vai trò quản trị viên của chính mình.",
  AUTH_REQUIRED: "Vui lòng đăng nhập để tiếp tục.",
  SESSION_INVALID:
    "Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.",
  FORBIDDEN: "Bạn không có quyền thực hiện thao tác này.",
  PAYLOAD_TOO_LARGE: "Dữ liệu gửi lên quá lớn.",
  INTERNAL_ERROR: "Máy chủ đang gặp sự cố. Vui lòng thử lại sau.",
};

// Chỉ dành cho endpoint cũ chưa trả code. Bỏ danh sách sau khi mọi endpoint được chuyển đổi.
const LEGACY_MESSAGES = new Set([
  "Bạn không có quyền quản lý",
  "Bạn không có quyền truy cập chức năng này (yêu cầu quyền quản trị viên)",
  "Bạn không thể tự hạ quyền vai trò quản trị viên của chính mình.",
  "Bạn không thể tự khóa tài khoản của chính mình.",
  "Chỉ tài khoản khách hàng mới có thể thực hiện",
  "Danh sách cây chứa ID không hợp lệ.",
  "Danh sách cây không được chứa ID trùng nhau.",
  "Dữ liệu bệnh cây không hợp lệ.",
  "Email chưa được đăng ký trong hệ thống.",
  "Email hoặc số điện thoại đã được sử dụng.",
  "Email không hợp lệ.",
  "Email là bắt buộc.",
  "Email này đã được sử dụng bởi một tài khoản khác.",
  "Email đã được sử dụng.",
  "Họ tên là bắt buộc và không quá 100 ký tự.",
  "Họ và tên không được để trống.",
  "Họ và tên là bắt buộc.",
  "Không tìm thấy bệnh cây này.",
  "Không tìm thấy cây này.",
  "Không tìm thấy người dùng với ID này.",
  "Không tìm thấy thông tin người dùng.",
  "Không tìm thấy thông tin đăng ký cho email này hoặc đã hết hạn. Vui lòng đăng ký lại.",
  "Không tìm thấy tài khoản với email này.",
  "Không tìm thấy tài khoản.",
  "Loại tác nhân gây bệnh không hợp lệ.",
  "Mã xác thực không chính xác.",
  "Mã xác thực không chính xác. Vui lòng kiểm tra lại.",
  "Mã xác thực không hợp lệ (phải gồm 6 chữ số).",
  "Mã xác thực đã hết hạn (chỉ có hiệu lực trong 5 phút). Vui lòng yêu cầu mã mới.",
  "Mã xác thực đã hết hạn hoặc không tồn tại. Vui lòng yêu cầu mã mới.",
  "Mật khẩu hiện tại không chính xác.",
  "Mật khẩu không chính xác. Vui lòng thử lại.",
  "Mật khẩu mới cần ít nhất 8 ký tự và không quá 72 byte.",
  "Mật khẩu mới phải có tối thiểu 8 ký tự.",
  "Mật khẩu phải có tối thiểu 8 ký tự.",
  "Một hoặc nhiều cây được chọn không tồn tại.",
  "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.",
  "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại",
  "Phác đồ điều trị phải là một đối tượng JSON.",
  "Số điện thoại không hợp lệ (10 chữ số, bắt đầu bằng 03, 05, 07, 08, 09).",
  "Số điện thoại này đã được sử dụng bởi tài khoản khác.",
  "Số điện thoại phải có 10 số, bắt đầu bằng 03, 05, 07, 08 hoặc 09.",
  "Trạng thái bệnh không hợp lệ.",
  "Trạng thái không hợp lệ. Vui lòng chọn hoạt động hoặc bị khóa.",
  "Tài khoản Google không thể đổi email hoặc mật khẩu tại đây.",
  "Tài khoản của bạn đã bị khóa hoặc tạm ngưng. Vui lòng liên hệ hỗ trợ.",
  "Tài khoản này được đăng ký bằng Google. Vui lòng chọn 'Tiếp tục với Google'.",
  "Tài khoản đã bị khóa, không thể đặt lại mật khẩu.",
  "Tài khoản đã bị khóa.",
  "Tên bệnh đã tồn tại.",
  "Từ khóa tìm kiếm không hợp lệ.",
  "Vai trò không hợp lệ. Vui lòng chọn khách hàng, quản lý hoặc quản trị viên.",
  "Vui lòng chọn trạng thái tài khoản: hoạt động hoặc bị khóa.",
  "Vui lòng chọn vai trò: khách hàng, quản lý hoặc quản trị viên.",
  "Vui lòng chọn ít nhất một cây liên quan.",
  "Vui lòng nhập đầy đủ email và mật khẩu.",
  "Vui lòng nhập đầy đủ email, mã xác thực và mật khẩu mới.",
  "Vui lòng đăng nhập để tiếp tục",
  "Địa chỉ email không đúng định dạng.",
  "Địa chỉ email là bắt buộc.",
  "Định dạng ID bệnh không hợp lệ.",
  "Định dạng ID cây không hợp lệ.",
  "Định dạng ID người dùng không hợp lệ.",
]);

export default function getErrorMessage(
  error,
  fallback = "Đã xảy ra lỗi. Vui lòng thử lại.",
) {
  if (error?.code === "ECONNABORTED" || error?.code === "ETIMEDOUT") {
    return "Yêu cầu đã hết thời gian chờ. Vui lòng thử lại.";
  }
  const data = error?.response?.data;
  const code = data?.code || error?.code;
  if (
    typeof code === "string" &&
    Object.prototype.hasOwnProperty.call(ERROR_MESSAGES, code)
  )
    return ERROR_MESSAGES[code];
  const rawMessage =
    typeof error === "string" ? error : data?.message || error?.message;
  const message = typeof rawMessage === "string" ? rawMessage : "";
  if (
    error?.code === "ERR_NETWORK" ||
    /^(Network Error|Network request failed|Failed to fetch)$/i.test(
      message || "",
    )
  ) {
    return "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.";
  }
  if (/^timeout of \d+ms exceeded$/i.test(message || "")) {
    return "Yêu cầu đã hết thời gian chờ. Vui lòng thử lại.";
  }
  if (error?.response?.status >= 500) return ERROR_MESSAGES.INTERNAL_ERROR;
  // Một code mới chưa được client hỗ trợ dùng fallback, không dùng raw message.
  if (data?.code) return fallback;
  if (
    typeof message === "string" &&
    (LEGACY_MESSAGES.has(message.trim()) ||
      Object.values(ERROR_MESSAGES).includes(message.trim()))
  ) {
    return message.trim();
  }
  return fallback;
}
