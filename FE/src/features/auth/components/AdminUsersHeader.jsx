import { Button } from "@/components/ui/button";
import { Sparkles, UserPlus } from "lucide-react";

function AdminUsersHeader({ onCreateClick }) {
  return (
    <section className="admin-users-hero">
      <div className="admin-users-hero-inner">
        <div className="admin-users-hero-copy">
          <div className="admin-users-hero-badge">
            <Sparkles className="h-4 w-4" />
            <span>Khu vực quản trị người dùng</span>
          </div>
          <div className="space-y-2">
            <h1 className="admin-users-hero-title">
              Quản lý người dùng Plantify
            </h1>
          </div>
        </div>

        <div className="admin-users-actions">
          <Button
            className="bg-gradient-to-r from-primary to-green-600 text-white shadow-lg hover:from-primary hover:to-green-700"
            onClick={onCreateClick}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Thêm người dùng
          </Button>
        </div>
      </div>
    </section>
  );
}

export { AdminUsersHeader };
