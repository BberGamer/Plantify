import { Outlet, Link } from "react-router";
import { Leaf } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { ThemeToggle } from "@/components/common/ThemeToggle";

function AuthLayout() {
  return (
    <div className="relative min-h-screen bg-background">
      <div className="absolute right-4 top-4 z-10 flex items-center gap-2 sm:right-6 sm:top-6">
        <ThemeToggle />
        <Link
          to={ROUTES.home}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <Leaf className="h-5 w-5 text-primary" />
          <span className="hidden sm:inline">Plantify</span>
        </Link>
      </div>
      <Outlet />
    </div>
  );
}

export { AuthLayout };
