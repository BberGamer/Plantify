import { useEffect } from "react";
import { AppState, Platform } from "react-native";

// Cập nhật danh mục khi trở lại ứng dụng/tab sau khi dữ liệu thay đổi ở nơi khác.
export default function useRefreshOnResume(refresh) {
  useEffect(() => {
    const subscription = AppState.addEventListener("change", state => {
      if (state === "active") refresh();
    });
    if (Platform.OS === "web" && typeof window !== "undefined")
      window.addEventListener("focus", refresh);
    return () => {
      subscription.remove();
      if (Platform.OS === "web" && typeof window !== "undefined")
        window.removeEventListener("focus", refresh);
    };
  }, [refresh]);
}
