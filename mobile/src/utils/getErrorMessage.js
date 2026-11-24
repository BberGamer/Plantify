// Thông báo theo code là hợp đồng chính; không công khai message tùy ý từ server.
const ERROR_MESSAGES = {
  DIAGNOSIS_PHOTO_NOT_CONFIGURED:
    "Nơi lưu ảnh chẩn đoán chưa được cấu hình. Vui lòng liên hệ hỗ trợ.",
  DIAGNOSIS_PHOTO_STORAGE_UNAVAILABLE:
    "Chưa lưu hoặc tải được ảnh chẩn đoán. Vui lòng thử lại.",
  DIAGNOSIS_HISTORY_NOT_FOUND:
    "Không tìm thấy chẩn đoán trong lịch sử của bạn.",
  DIAGNOSIS_IMAGE_NOT_FOUND: "Ảnh của lần chẩn đoán không còn khả dụng.",
  DIAGNOSIS_HISTORY_LOAD_FAILED:
    "Không thể tải lịch sử chẩn đoán. Vui lòng thử lại.",
  DIAGNOSIS_INVALID_PHOTO:
    "Không đọc được ảnh. Vui lòng chụp hoặc chọn ảnh khác.",
  DIAGNOSIS_IMAGE_TOO_LARGE: "Ảnh tối đa 10 MB. Vui lòng chọn ảnh nhỏ hơn.",
  DIAGNOSIS_UNSUPPORTED_IMAGE: "Vui lòng chọn ảnh JPG, PNG hoặc WebP tĩnh.",
  DIAGNOSIS_TIMEOUT:
    "Phân tích ảnh quá lâu. Ảnh vẫn được giữ lại; bạn có thể thử lại.",
  DIAGNOSIS_BUSY:
    "Dịch vụ đang xử lý ảnh khác. Vui lòng chờ một chút rồi thử lại.",
  DIAGNOSIS_UNAVAILABLE:
    "Chưa kết nối được dịch vụ nhận diện. Vui lòng thử lại sau.",
  DIAGNOSIS_INVALID_RESPONSE:
    "Dịch vụ trả kết quả chưa hợp lệ. Vui lòng thử lại.",
  DIAGNOSIS_CATALOG_UNAVAILABLE:
    "Chưa tải được thông tin cây/bệnh. Vui lòng thử lại sau.",
  DIAGNOSIS_NOT_CONFIGURED:
    "Dịch vụ nhận diện chưa được cấu hình đầy đủ. Vui lòng thử lại sau.",
  DIAGNOSIS_MAPPING_MISSING:
    "Chưa có thông tin cây/bệnh tương ứng với kết quả nhận diện. Vui lòng liên hệ hỗ trợ.",
  DIAGNOSIS_MAPPING_PENDING:
    "Thông tin cây/bệnh tương ứng đang chờ xác minh. Vui lòng thử lại sau.",
  DIAGNOSIS_MAPPING_INVALID:
    "Thông tin cây/bệnh tương ứng chưa hợp lệ. Vui lòng liên hệ hỗ trợ.",
  DIAGNOSIS_CATALOG_INCOMPLETE:
    "Thông tin cây/bệnh chưa đầy đủ. Vui lòng liên hệ hỗ trợ.",
  DIAGNOSIS_INPUT_GUARD_UNAVAILABLE:
    "Dịch vụ kiểm tra ảnh chưa sẵn sàng. Vui lòng thử lại sau.",
  DIAGNOSIS_HISTORY_UNAVAILABLE:
    "Chưa lưu được lịch sử nhận diện/chẩn đoán. Vui lòng thử lại sau.",

  FINANCE_VALIDATION:
    "Thông tin giao dịch chưa hợp lệ. Vui lòng kiểm tra nội dung đã nhập.",
  INSUFFICIENT_BALANCE:
    "Số dư không đủ. Vui lòng nạp tiền vào ví để mua gói VIP.",
  ORDER_NOT_FOUND: "Không tìm thấy đơn nạp tiền.",
  ORDER_FINAL: "Đơn đã thành công hoặc bị từ chối, không thể sửa lại.",
  IDEMPOTENCY_CONFLICT:
    "Mã giao dịch đã được sử dụng. Vui lòng tải lại màn hình.",
  BALANCE_LIMIT:
    "Không thể cập nhật số dư ví. Vui lòng liên hệ quản trị viên để kiểm tra.",
  PAYMENT_NOT_CONFIGURED: "Hệ thống chưa cấu hình SePay.",
  GARDEN_LIMIT_REACHED:
    "Tài khoản Free được thêm tối đa 3 cây trong vườn. Hãy lưu trữ một cây hoặc mua gói VIP để thêm cây mới.",
  FEEDBACK_VIP_REQUIRED: "Bạn cần gói VIP còn hạn để gửi đóng góp.",
  FEEDBACK_NOT_FOUND: "Không tìm thấy đóng góp.",
  FEEDBACK_REVIEW_CHANGED:
    "Đóng góp đã được cập nhật. Hãy tải lại trước khi xử lý.",
  VIP_REQUIRED:
    "Nhận diện và chẩn đoán AI cần gói VIP còn hạn. Hãy vào Tài khoản → Tài khoản VIP để mua hoặc gia hạn gói.",
  CHAT_RETRIEVAL_UNAVAILABLE:
    "Chưa thể tra cứu kiến thức Plantify. Vui lòng thử lại sau.",
  NOTIFICATION_NOT_FOUND:
    "Thông báo không còn khả dụng. Vui lòng tải lại danh sách.",
  CARE_UNAVAILABLE:
    "Lịch đã dừng, cây đã lưu trữ hoặc đang điều trị. Vui lòng tải lại lịch.",
  CARE_NOT_FOUND: "Không tìm thấy lịch chăm sóc. Vui lòng tải lại lịch.",
  AI_INCOMPLETE_RESPONSE:
    "AI chưa hoàn tất câu trả lời. Vui lòng thử lại với câu hỏi cụ thể hơn.",
  FAVORITE_LIMIT_REACHED:
    "Tài khoản Free được lưu tối đa 5 cây yêu thích. Hãy bỏ yêu thích một cây hoặc mua gói VIP để lưu thêm.",
  GOOGLE_NOT_CONFIGURED:
    "Chưa cấu hình đăng nhập Google. Vui lòng thử lại sau.",
  GOOGLE_TOKEN_INVALID:
    "Không xác minh được tài khoản Google. Vui lòng chọn tài khoản lại.",
  GOOGLE_FLOW_EXPIRED:
    "Phiên xác thực Google đã hết hạn. Vui lòng quay lại chọn tài khoản Google.",
  GOOGLE_ACCOUNT_CONFLICT:
    "Tài khoản vừa được đăng ký hoặc liên kết. Vui lòng quay lại đăng nhập Google.",
  GOOGLE_LINK_REQUIRED:
    "Email này cần xác minh bổ sung. Vui lòng dùng đăng ký hoặc đăng nhập bằng email.",
  GOOGLE_BUSY: "Có nhiều yêu cầu đăng nhập Google. Vui lòng thử lại sau.",
  GOOGLE_SCRIPT_ERROR:
    "Không tải được đăng nhập Google. Kiểm tra kết nối hoặc thử lại.",
  EVALUATION_DISABLED: "Chế độ đánh giá AI đang tắt.",
  INVALID_PHOTO:
    "Vui lòng chọn một ảnh JPG hoặc PNG hợp lệ, tối đa 10 MB (tối đa 40 triệu điểm ảnh).",
  GARDEN_PHOTO_NOT_CONFIGURED:
    "Máy chủ chưa cấu hình lưu ảnh. Bạn có thể bỏ ảnh để lưu cây trước.",
  PLANT_PHOTO_NOT_CONFIGURED:
    "Máy chủ chưa cấu hình lưu ảnh. Bạn có thể bỏ ảnh để lưu cây trước.",
  GARDEN_PHOTO_STORAGE_UNAVAILABLE:
    "Chưa tải được ảnh vườn lên. Vui lòng thử lại.",
  PLANT_PHOTO_STORAGE_UNAVAILABLE:
    "Chưa tải được ảnh cây lên. Vui lòng thử lại.",
  DISEASE_PHOTO_NOT_CONFIGURED: "Máy chủ chưa cấu hình lưu ảnh bệnh.",
  DISEASE_PHOTO_STORAGE_UNAVAILABLE:
    "Chưa tải được ảnh bệnh lên. Vui lòng thử lại.",
  AI_NOT_CONFIGURED: "Trợ lý AI chưa được cấu hình. Vui lòng thử lại sau.",
  AI_TIMEOUT: "AI trả lời quá lâu. Vui lòng thử lại.",
  AI_BUSY: "Trợ lý AI đang bận. Vui lòng thử lại sau.",
  AI_UNAVAILABLE: "Không thể kết nối trợ lý AI. Vui lòng thử lại sau.",
  AI_INVALID_RESPONSE:
    "Trợ lý AI trả về dữ liệu không hợp lệ. Vui lòng thử lại.",
  AI_REFERENCE_INCOMPLETE: "Dữ liệu nguồn chưa đủ để tạo phác đồ 14 ngày.",
  AI_UNGROUNDED_RESPONSE:
    "AI đã tạo nội dung không có trong dữ liệu nguồn nên bản nháp không được lưu.",
  APPROVED_PROTOCOL_NOT_FOUND: "Chưa có phác đồ được phê duyệt cho bệnh này.",
  ACTIVE_TREATMENT_EXISTS: "Cây đang có một đợt điều trị hoạt động.",
  INVALID_TREATMENT_TRANSITION:
    "Trạng thái điều trị đã thay đổi. Vui lòng tải lại.",
  TASK_ALREADY_COMPLETED: "Công việc này đã được hoàn thành.",
  TASK_NOT_AVAILABLE: "Công việc chưa thể hoàn thành vào lúc này.",
  TREATMENT_TASKS_INCOMPLETE:
    "Cần hoàn thành tất cả công việc trước khi ghi nhận cây đã hồi phục.",
  TREATMENT_REFERENCE_MISSING:
    "Dữ liệu cây hoặc bệnh của lịch điều trị không còn đầy đủ.",
  DIAGNOSIS_NOT_AVAILABLE:
    "Kết quả chẩn đoán chưa thể dùng để tạo lịch điều trị.",
  DIAGNOSIS_DISEASE_MISMATCH: "Bệnh được chọn không khớp kết quả chẩn đoán.",
  DIAGNOSIS_PLANT_MISMATCH:
    "Cây trong vườn không khớp loài cây từ kết quả chẩn đoán.",
  DIAGNOSIS_ALREADY_USED:
    "Kết quả chẩn đoán này đã được dùng để tạo lịch điều trị.",
  PROTOCOL_PLANT_DISEASE_MISMATCH:
    "Phác đồ có cây chưa được liên kết với bệnh đã chọn.",
  PROTOCOL_REFERENCE_INACTIVE:
    "Chỉ có thể phê duyệt phác đồ cho cây và bệnh đang công khai.",
  PROTOCOL_DISEASE_IMMUTABLE: "Không thể đổi bệnh của phác đồ đã tạo.",
  SAME_ROLE_UPDATE_FORBIDDEN:
    "Tài khoản cùng vai trò chỉ được xem, không được chỉnh sửa.",
  ADMIN_ROLE_CHANGE_FORBIDDEN:
    "Bạn không thể thay đổi vai trò của quản trị viên khác.",
  SESSION_CHANGED: "Phiên đăng nhập đã thay đổi. Vui lòng thử lại.",
  SESSION_STORAGE_ERROR:
    "Không thể lưu phiên đăng nhập trên thiết bị. Vui lòng thử lại.",
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
  USER_STATUS_CONFLICT:
    "Trạng thái tài khoản đã thay đổi. Vui lòng thực hiện lại.",
  SELF_ROLE_CHANGE_FORBIDDEN:
    "Bạn không thể tự hạ quyền vai trò quản trị viên của chính mình.",
  AUTH_REQUIRED: "Vui lòng đăng nhập để tiếp tục.",
  SESSION_INVALID:
    "Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.",
  FORBIDDEN: "Bạn không có quyền thực hiện thao tác này.",
  PAYLOAD_TOO_LARGE: "Dữ liệu gửi lên quá lớn.",
  INTERNAL_ERROR: "Máy chủ đang gặp sự cố. Vui lòng thử lại sau.",
};

const FINANCE_FIELD_MESSAGES = {
  amount: "Số tiền phải là số nguyên từ 10.000 đến 10.000.000 đồng.",
  reason: "Lý do phải có từ 5 đến 500 ký tự và không chứa ký tự không hợp lệ.",
  plan: "Gói VIP được chọn không hợp lệ. Vui lòng tải lại danh sách gói.",
  request_key:
    "Không thể xác nhận mã yêu cầu giao dịch. Vui lòng tải lại màn hình.",
  page: "Trang giao dịch không hợp lệ. Vui lòng tải lại danh sách.",
  status: "Trạng thái xử lý đơn không hợp lệ. Vui lòng tải lại đơn nạp.",
};

// Giữ allowlist hữu hạn cho backend đã triển khai nhưng chưa xác nhận rollout code.
// Chỉ bỏ sau khi endpoint có test code/status VÀ consumer xác nhận server đang dùng hợp đồng mới.
// Không dùng dấu tiếng Việt để quyết định message nào an toàn.
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
  "Số điện thoại không hợp lệ.",
  "Số điện thoại này đã được sử dụng bởi tài khoản khác.",
  "Số điện thoại phải có 10 số.",
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
  if (code === "FEEDBACK_INVALID_IMAGES") {
    return (
      data?.errors?.images ||
      error?.message ||
      "Vui lòng kiểm tra ảnh đính kèm."
    );
  }
  if (
    code === "FINANCE_VALIDATION" &&
    data?.errors &&
    typeof data.errors === "object"
  ) {
    const field = Object.keys(FINANCE_FIELD_MESSAGES).find((key) =>
      Object.prototype.hasOwnProperty.call(data.errors, key),
    );
    if (field) return FINANCE_FIELD_MESSAGES[field];
  }
  if (["CATALOG_AI_CONFLICT", "CATALOG_IN_USE"].includes(code) && typeof data?.message === "string") {
    return data.message;
  }
  if (code === "VALIDATION_ERROR" && typeof data?.errors?.phone === "string") {
    return data.errors.phone;
  }
  if (code === "VALIDATION_ERROR" && data?.errors) {
    const first = Object.values(data.errors).find(
      (message) => typeof message === "string" && message.trim(),
    );
    if (first) return first;
  }
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
