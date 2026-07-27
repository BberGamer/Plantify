// AuthLayout.jsx - Bố trí khung giao diện chung cho các trang xác thực
import { Outlet } from "react-router";

function AuthLayout() {
  return (
    <div className="relative min-h-screen bg-background">
      <Outlet />
    </div>
  );
}

export { AuthLayout };
