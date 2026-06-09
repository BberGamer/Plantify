import { Outlet } from "react-router";

function AuthLayout() {
  return (
    <div className="relative min-h-screen bg-background">
      <Outlet />
    </div>
  );
}

export { AuthLayout };
