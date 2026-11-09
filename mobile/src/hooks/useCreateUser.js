import { useRef, useState } from "react";
import userService from "../services/userService";
import getErrorMessage from "../utils/getErrorMessage";
import useScreenScope from "./useScreenScope";

const emptyDraft = () => ({
  fullName: "", email: "", phone: "", password: "", confirmPassword: "", role: "customer",
});

export default function useCreateUser({ onCreated }) {
  const [visible, setVisible] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const pending = useRef(false);
  const { capture, isActive } = useScreenScope(undefined, () => {
    setVisible(false);
    setDraft(emptyDraft());
    setErrors({});
    setError("");
    setSubmitting(false);
  });
  const reset = () => {
    setDraft(emptyDraft());
    setErrors({});
    setError("");
  };
  const open = () => {
    if (pending.current || !isActive()) return;
    reset();
    setVisible(true);
  };
  const close = () => {
    if (pending.current) return;
    setVisible(false);
    reset();
  };
  const changeField = (field, value) => {
    if (pending.current || !visible || !Object.prototype.hasOwnProperty.call(emptyDraft(), field)) return;
    setDraft((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
    setError("");
  };
  const submit = async () => {
    if (pending.current || !visible || !isActive()) return;
    const issues = {};
    if (!draft.fullName.trim()) issues.fullName = "Vui lòng nhập họ và tên.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim()) || draft.email.trim().length > 254)
      issues.email = "Email không hợp lệ.";
    if (draft.phone.trim() && !/^0[35789]\d{8}$/.test(draft.phone.trim()))
      issues.phone = "Số điện thoại phải có 10 số.";
    const passwordBytes = Array.from(draft.password).reduce((total, character) => {
      const code = character.codePointAt(0);
      return total + (code <= 0x7f ? 1 : code <= 0x7ff ? 2 : code <= 0xffff ? 3 : 4);
    }, 0);
    if (draft.password.length < 8 || passwordBytes > 72)
      issues.password = "Mật khẩu cần ít nhất 8 ký tự và không quá 72 byte.";
    if (draft.confirmPassword !== draft.password || !draft.confirmPassword)
      issues.confirmPassword = "Mật khẩu xác nhận không khớp.";
    if (!["customer", "manager", "admin"].includes(draft.role)) issues.role = "Vai trò không hợp lệ.";
    setErrors(issues);
    if (Object.keys(issues).length) return;
    const payload = {
      fullName: draft.fullName.trim(), email: draft.email.trim().toLowerCase(),
      phone: draft.phone.trim(), password: draft.password, role: draft.role,
    };
    const isCurrent = capture();
    pending.current = true;
    setSubmitting(true);
    setError("");
    try {
      const response = await userService.createUser(payload);
      if (!response?.success || !response.data?._id) throw new Error("CREATE_USER_FAILED");
      if (!isCurrent()) return;
      setVisible(false);
      reset();
      onCreated(response.data);
    } catch (failure) {
      if (!isCurrent()) return;
      const message = getErrorMessage(failure, "Không thể thêm người dùng. Vui lòng thử lại.");
      const code = failure.response?.data?.code;
      if (code === "EMAIL_IN_USE" || code === "PHONE_IN_USE") {
        setErrors({ [code === "EMAIL_IN_USE" ? "email" : "phone"]: message });
      } else if (code === "VALIDATION_ERROR") {
        const fields = failure.response?.data?.errors || {};
        const issues = {};
        const labels = {
          fullName: "Vui lòng nhập họ và tên hợp lệ.", email: "Email không hợp lệ.",
          phone: "Số điện thoại phải có 10 số.",
          password: "Mật khẩu cần ít nhất 8 ký tự và không quá 72 byte.", role: "Vai trò không hợp lệ.",
        };
        for (const field of Object.keys(fields)) {
          if (Object.prototype.hasOwnProperty.call(labels, field)) issues[field] = labels[field];
        }
        if (Object.keys(issues).length) setErrors(issues);
        else setError(message);
      } else {
        setError(message);
      }
    } finally {
      pending.current = false;
      if (isCurrent()) setSubmitting(false);
    }
  };
  return { visible, draft, errors, error, submitting, open, close, changeField, submit };
}
