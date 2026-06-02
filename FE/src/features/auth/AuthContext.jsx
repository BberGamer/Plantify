// AuthContext.jsx - Context quản lý trạng thái xác thực và thông tin người dùng
import { createContext, useState, useEffect } from "react";
import { loginApi, registerApi, getMeApi } from "./api";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Khởi tạo Auth từ localStorage khi ứng dụng mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken) {
        setToken(storedToken);
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            setUser(null);
          }
        }

        try {
          // Gọi API kiểm tra token và đồng bộ thông tin mới nhất
          const res = await getMeApi();
          if (res && res.success) {
            setUser(res.data);
            localStorage.setItem("user", JSON.stringify(res.data));
          }
        } catch (error) {
          console.error("Xác thực token thất bại:", error);
          // Token không hợp lệ hoặc đã hết hạn
          setUser(null);
          setToken(null);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const res = await loginApi(email, password);
    if (res && res.success) {
      const { user: loggedInUser, token: authToken } = res.data;
      setUser(loggedInUser);
      setToken(authToken);
      localStorage.setItem("token", authToken);
      localStorage.setItem("user", JSON.stringify(loggedInUser));
      return loggedInUser;
    }
    throw new Error(res?.message || "Đăng nhập thất bại");
  };

  const register = async (userData) => {
    const res = await registerApi(userData);
    return res;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
export default AuthContext;
