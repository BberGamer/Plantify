// auth.controller.js - Cầu nối điều phối giữa router và service
const authService = require('./auth.service');
const { success } = require('../../utils/apiResponse');

const ADMIN_CREATABLE_ROLES = ['admin', 'customer', 'business manager', 'content manager'];

const validateUserInput = ({ fullName, email, password, phone }) => {
  if (!fullName || !email || !password) {
    const err = new Error('Họ tên, email và mật khẩu là bắt buộc');
    err.statusCode = 400;
    throw err;
  }

  const normalizedFullName = fullName.trim();
  const normalizedEmail = email.trim();
  const fullNameRegex = /^[\p{L}\s]+$/u;
  if (!fullNameRegex.test(normalizedFullName)) {
    const err = new Error('Họ tên chỉ được chứa chữ cái và khoảng trắng');
    err.statusCode = 400;
    throw err;
  }

  // Chỉ chấp nhận @gmail.com | @yahoo.com | @fpt.edu.vn
  const emailRegex = /^[a-zA-Z0-9._%+\-]+@(gmail\.com|yahoo\.com|fpt\.edu\.vn)$/i;
  if (!emailRegex.test(normalizedEmail)) {
    const err = new Error('Email không đúng định dạng');
    err.statusCode = 400;
    throw err;
  }

  if (phone && phone.trim() !== '') {
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (!phoneRegex.test(phone.trim())) {
      const err = new Error('Số điện thoại không hợp lệ (phải bắt đầu bằng 03, 05, 07, 08, 09 và gồm 10 chữ số)');
      err.statusCode = 400;
      throw err;
    }
  }

  if (password.length < 8) {
    const err = new Error('Mật khẩu phải có tối thiểu 8 ký tự');
    err.statusCode = 400;
    throw err;
  }
};

/**
 * Đăng ký tài khoản người dùng
 */
const register = async (req, res, next) => {
  try {
    validateUserInput(req.body);
    const user = await authService.register(req.body);
    return success(res, 'Đăng ký tài khoản thành công', user, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Bước 1 đăng ký: Kiểm tra trùng email/SĐT và gửi OTP xác thực qua Gmail
 */
const sendRegisterOTP = async (req, res, next) => {
  try {
    validateUserInput(req.body);
    await authService.sendRegisterOTP(req.body);
    return success(res, 'Mã OTP xác thực đã được gửi đến Gmail của bạn. Vui lòng kiểm tra hộp thư.', null, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Bước 2 đăng ký: Xác thực OTP để kích hoạt tài khoản
 */
const verifyRegisterOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !email.trim()) {
      const err = new Error('Email là bắt buộc');
      err.statusCode = 400;
      throw err;
    }

    if (!otp || otp.trim().length !== 6) {
      const err = new Error('Mã OTP không hợp lệ (phải gồm 6 chữ số)');
      err.statusCode = 400;
      throw err;
    }

    const user = await authService.verifyRegisterOTP(email.trim(), otp.trim());
    return success(res, 'Đăng ký tài khoản thành công! Hãy đăng nhập.', user, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Tạo tài khoản người dùng bởi quản trị viên
 */
const createUserByAdmin = async (req, res, next) => {
  try {
    validateUserInput(req.body);

    if (!ADMIN_CREATABLE_ROLES.includes(req.body.role)) {
      const err = new Error('Vai trò không hợp lệ');
      err.statusCode = 400;
      throw err;
    }

    const user = await authService.createUserByAdmin(req.body);
    return success(res, 'Tạo tài khoản người dùng thành công', user, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Đăng nhập tài khoản người dùng
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const err = new Error('Email và mật khẩu là bắt buộc');
      err.statusCode = 400;
      throw err;
    }

    // Chỉ chấp nhận @gmail.com | @yahoo.com | @fpt.edu.vn
    const emailRegex = /^[a-zA-Z0-9._%+\-]+@(gmail\.com|yahoo\.com|fpt\.edu\.vn)$/i;
    if (!emailRegex.test(email)) {
      const err = new Error('Email không đúng định dạng');
      err.statusCode = 400;
      throw err;
    }

    const data = await authService.login(email, password);
    return success(res, 'Đăng nhập thành công', data, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Lấy thông tin tài khoản hiện tại (Me)
 */
const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    return success(res, 'Lấy thông tin tài khoản thành công', user, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Lấy danh sách người dùng cho quản trị viên
 */
const getUsers = async (req, res, next) => {
  try {
    const users = await authService.getUsers();
    return success(res, 'Lấy danh sách người dùng thành công', users, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Cập nhật trạng thái tài khoản người dùng
 */
const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (typeof status !== "boolean") {
      const err = new Error("Trạng thái không hợp lệ");
      err.statusCode = 400;
      throw err;
    }

    const user = await authService.updateUserStatus(req.params.id, status);

    return success(
      res,
      "Cập nhật trạng thái người dùng thành công",
      user,
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Xóa tài khoản người dùng
 */
const deleteUser = async (req, res, next) => {
  try {
    await authService.deleteUser(req.params.id);
    return success(res, 'Xóa người dùng thành công', null, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Quên mật khẩu - gửi email đặt lại
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      const err = new Error('Email là bắt buộc');
      err.statusCode = 400;
      throw err;
    }

    // Chỉ chấp nhận @gmail.com | @yahoo.com | @fpt.edu.vn
    const emailRegex = /^[a-zA-Z0-9._%+\-]+@(gmail\.com|yahoo\.com|fpt\.edu\.vn)$/i;
    if (!emailRegex.test(email.trim())) {
      const err = new Error('Email không đúng định dạng');
      err.statusCode = 400;
      throw err;
    }

    await authService.forgotPassword(email.trim());
    return success(res, 'Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn.', null, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Đặt lại mật khẩu bằng OTP
 */
const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, password, confirmPassword } = req.body;

    if (!email || !email.trim()) {
      const err = new Error('Email là bắt buộc');
      err.statusCode = 400;
      throw err;
    }

    if (!otp || !otp.trim() || otp.trim().length !== 6) {
      const err = new Error('Mã OTP không hợp lệ (phải gồm 6 chữ số)');
      err.statusCode = 400;
      throw err;
    }

    if (!password || !confirmPassword) {
      const err = new Error('Mật khẩu và xác nhận mật khẩu là bắt buộc');
      err.statusCode = 400;
      throw err;
    }

    if (password !== confirmPassword) {
      const err = new Error('Mật khẩu xác nhận không khớp');
      err.statusCode = 400;
      throw err;
    }

    if (password.length < 8) {
      const err = new Error('Mật khẩu phải có tối thiểu 8 ký tự');
      err.statusCode = 400;
      throw err;
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      const err = new Error('Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số');
      err.statusCode = 400;
      throw err;
    }

    await authService.resetPassword(email.trim(), otp.trim(), password);
    return success(res, 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập với mật khẩu mới.', null, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Xác thực mã OTP (không đặt lại mật khẩu)
 */
const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !email.trim()) {
      const err = new Error('Email là bắt buộc');
      err.statusCode = 400;
      throw err;
    }

    if (!otp || otp.trim().length !== 6) {
      const err = new Error('Mã OTP không hợp lệ (phải gồm 6 chữ số)');
      err.statusCode = 400;
      throw err;
    }

    await authService.verifyOTP(email.trim(), otp.trim());
    return success(res, 'Mã OTP hợp lệ. Bạn có thể đặt lại mật khẩu.', null, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Cập nhật thông tin cá nhân của người dùng đang đăng nhập
 */
const updateProfile = async (req, res, next) => {
  try {
    const { fullName, phone, address } = req.body;

    // Validate họ tên
    if (fullName !== undefined) {
      const trimmed = fullName.trim();
      if (!trimmed) {
        const err = new Error('Họ tên không được để trống');
        err.statusCode = 400;
        throw err;
      }
      const fullNameRegex = /^[\p{L}\s]+$/u;
      if (!fullNameRegex.test(trimmed)) {
        const err = new Error('Họ tên chỉ được chứa chữ cái và khoảng trắng');
        err.statusCode = 400;
        throw err;
      }
    }

    // Validate số điện thoại
    if (phone !== undefined && phone.trim() !== '') {
      const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
      if (!phoneRegex.test(phone.trim())) {
        const err = new Error('Số điện thoại không hợp lệ (phải bắt đầu bằng 03, 05, 07, 08, 09 và gồm 10 chữ số)');
        err.statusCode = 400;
        throw err;
      }
    }

    const updatedUser = await authService.updateProfile(req.user.id, { fullName, phone, address });
    return success(res, 'Cập nhật thông tin thành công', updatedUser, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Đổi mật khẩu của người dùng đang đăng nhập
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validate các trường bắt buộc
    if (!currentPassword || !newPassword || !confirmPassword) {
      const err = new Error('Vui lòng nhập đầy đủ mật khẩu hiện tại, mật khẩu mới và xác nhận mật khẩu');
      err.statusCode = 400;
      throw err;
    }

    // Validate độ dài mật khẩu mới
    if (newPassword.length < 8) {
      const err = new Error('Mật khẩu mới phải có tối thiểu 8 ký tự');
      err.statusCode = 400;
      throw err;
    }

    // Validate độ phức tạp mật khẩu mới
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      const err = new Error('Mật khẩu mới phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số');
      err.statusCode = 400;
      throw err;
    }

    // Validate xác nhận mật khẩu khớp
    if (newPassword !== confirmPassword) {
      const err = new Error('Mật khẩu xác nhận không khớp với mật khẩu mới');
      err.statusCode = 400;
      throw err;
    }

    await authService.changePassword(req.user.id, { currentPassword, newPassword, confirmPassword });
    return success(res, 'Đổi mật khẩu thành công', null, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  sendRegisterOTP,
  verifyRegisterOTP,
  createUserByAdmin,
  login,
  getMe,
  getUsers,
  updateUserStatus,
  deleteUser,
  forgotPassword,
  verifyOTP,
  resetPassword,
  updateProfile,
  changePassword,
};
