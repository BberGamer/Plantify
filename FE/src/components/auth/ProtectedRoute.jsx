// ProtectedRoute.jsx - Component bảo vệ route yêu cầu đăng nhập và quyền
import { Navigate } from "react-router";
import { useAuth } from "@/features/auth/hooks";
import { isRoleAllowed } from "@/lib/roleMapping";

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !isRoleAllowed(user.role, allowedRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
