import { createContext, useContext, useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { api, setToken } from "../services/api";
const Context = createContext(null);
const key = "plantify.management.session.v1";
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null),
    [ready, setReady] = useState(false);
  const clear = () => {
    setToken(null);
    sessionStorage.removeItem(key);
    setUser(null);
  };
  useEffect(() => {
    let live = true;
    const restore = async () => {
      try {
        const saved = JSON.parse(sessionStorage.getItem(key) || "null");
        if (typeof saved?.token !== "string") return;
        setToken(saved.token);
        const data = await api("/auth/me");
        const current = data?.user || data;
        if (
          !["admin", "manager"].includes(current?.role) ||
          current.status === false
        )
          throw new Error("Không có quyền");
        if (live) setUser(current);
      } catch {
        if (live) clear();
      } finally {
        if (live) setReady(true);
      }
    };
    restore();
    const expired = () => clear();
    window.addEventListener("plantify:unauthorized", expired);
    return () => {
      live = false;
      window.removeEventListener("plantify:unauthorized", expired);
    };
  }, []);
  const login = async (email, password) => {
    const data = await api("/auth/login", {
      method: "POST",
      body: { email, password },
    });
    if (!["admin", "manager"].includes(data?.user?.role))
      throw new Error("Trang này chỉ dành cho Admin và Manager.");
    if (typeof data.token !== "string")
      throw new Error("Phiên đăng nhập không hợp lệ.");
    setToken(data.token);
    sessionStorage.setItem(key, JSON.stringify({ token: data.token }));
    setUser(data.user);
  };
  const logout = async () => {
    const request = api("/auth/logout", { method: "POST" });
    clear();
    try {
      await request;
    } catch {
      /* Phiên trên web đã được xóa kể cả khi backend không phản hồi. */
    }
  };
  return (
    <Context.Provider value={{ user, ready, login, logout, setUser }}>
      {children}
    </Context.Provider>
  );
}
export const useAuth = () => useContext(Context);
export function Guard({ role }) {
  const { user, ready } = useAuth();
  if (!ready)
    return <div className="loading">Đang kiểm tra phiên đăng nhập…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={"/" + user.role} replace />;
  return <Outlet />;
}
