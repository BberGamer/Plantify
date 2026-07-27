// useAuth.js - Truy cập trạng thái xác thực được cung cấp bởi AuthContext
import { useContext } from "react";
import { AuthContext } from "../AuthContext";

/** Đọc AuthContext và đảm bảo hook được dùng bên trong AuthProvider. @returns {Object} Giá trị auth context. @throws {Error} Khi gọi ngoài AuthProvider. */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
export default useAuth;
