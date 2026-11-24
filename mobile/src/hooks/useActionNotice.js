import { useState } from "react";
import { useRouter } from "expo-router";
import getErrorMessage from "../utils/getErrorMessage";
import useScreenScope from "./useScreenScope";

const VIP_CODES = new Set(["FAVORITE_LIMIT_REACHED", "GARDEN_LIMIT_REACHED", "VIP_REQUIRED", "FEEDBACK_VIP_REQUIRED"]);

// Thao tác gọi trực tiếp khi có kết quả; không tự mở lại popup theo render/effect.
export default function useActionNotice() {
  const [notice, setNotice] = useState(null);
  const router = useRouter();
  const dismiss = () => setNotice(null);
  useScreenScope(undefined, dismiss);
  const showLimit = (failure) => {
    const code = failure?.response?.data?.code || failure?.code;
    if (!VIP_CODES.has(code)) return false;
    setNotice({
      title: code === "VIP_REQUIRED" || code === "FEEDBACK_VIP_REQUIRED"
        ? "Cần gói VIP còn hạn" : "Đã đạt giới hạn tài khoản Free",
      message: getErrorMessage(failure),
      upgrade: true,
    });
    return true;
  };
  return {
    showLimit,
    showSuccess: (message) => setNotice({ title: "Đã lưu yêu thích", message }),
    dismiss,
    dialogProps: {
      notice,
      onDismiss: dismiss,
      onUpgrade: () => {
        dismiss();
        router.push("/customer/vip");
      },
    },
  };
}
