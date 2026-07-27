// useAuth.js - Truy cập trạng thái xác thực được cung cấp bởi AuthContext
import { useContext } from "react";
import { AuthContext } from "../AuthContext";

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
export default useAuth;
