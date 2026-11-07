export default function validateRegistration(form) {
  if (!form.fullName.trim()) return "Vui lòng nhập họ và tên.";
  if (!form.email.trim()) return "Vui lòng nhập địa chỉ email.";
  if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.email.trim()))
    return "Email không đúng định dạng.";
  if (form.password.length < 8) return "Mật khẩu phải có tối thiểu 8 ký tự.";
  if (form.password !== form.confirmPassword) return "Mật khẩu xác nhận không khớp.";
  if (!form.agreeTerms) return "Vui lòng đồng ý với Điều khoản dịch vụ và Chính sách.";
  return "";
}
