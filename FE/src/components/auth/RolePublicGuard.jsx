// RolePublicGuard.jsx - Chặn tài khoản quản lý và quản trị truy cập khu vực công khai
// Khu vực này chỉ dành cho khách (chưa đăng nhập) và customer.
// Manager/Admin đã đăng nhập sẽ bị chuyển về dashboard của role đó.
import { Navigate } from "react-router";
import { useAuth } from "@/features/auth/hooks";
import { getDashboardPath } from "@/lib/roleMapping";

const STAFF_ROLES = new Set(["business manager", "content manager", "admin"]);

const isStaffRole = (role) =>
  !!role && STAFF_ROLES.has(role.toLowerCase().replace(/_/g, " "));

/** Ngăn role quản lý truy cập các trang public không phù hợp. @param {Object} props - Component props. @param {React.ReactNode} props.children - Nội dung public. @returns {JSX.Element} Nội dung hoặc điều hướng dashboard. */
export const RolePublicGuard = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user && isStaffRole(user.role)) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return children;
};

export default RolePublicGuard;
