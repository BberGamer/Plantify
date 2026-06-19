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
            <p className="admin-users-hero-description">
              Theo dõi tài khoản hệ thống, phân loại vai trò và rà soát trạng thái hoạt động trên cùng một giao diện quản trị.
            </p>
          </div>
        </div>

        <div className="admin-users-actions">
          <Button
            variant="outline"
            className="border-green-200 bg-white/80 text-green-700 shadow-sm hover:bg-green-50"
          >
            Xuất danh sách
          </Button>
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
