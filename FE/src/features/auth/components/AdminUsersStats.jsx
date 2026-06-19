import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, User, UserCheck, UserPlus } from "lucide-react";

function AdminUsersStats({ totalUsers, activeUsers, managedUsers, newUsersThisWeek }) {
  return (
    <section className="admin-users-stats-grid">
      <Card className="admin-users-stat-card">
        <CardContent className="admin-users-stat-content">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Tổng người dùng</p>
            <p className="text-4xl font-bold text-foreground">{totalUsers}</p>
            <p className="text-sm text-muted-foreground">Toàn bộ tài khoản trong hệ thống</p>
          </div>
          <div className="rounded-full bg-primary/10 p-3 text-primary">
            <User className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      <Card className="admin-users-stat-card">
        <CardContent className="admin-users-stat-content">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Đang hoạt động</p>
            <p className="text-4xl font-bold text-foreground">{activeUsers}</p>
            <p className="text-sm text-muted-foreground">Tài khoản đang ở trạng thái tốt</p>
          </div>
          <div className="rounded-full bg-green-100 p-3 text-green-700">
            <UserCheck className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      <Card className="admin-users-stat-card">
        <CardContent className="admin-users-stat-content">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Admin / Business / Content</p>
            <p className="text-4xl font-bold text-foreground">{managedUsers}</p>
            <p className="text-sm text-muted-foreground">Nhóm có quyền vận hành hệ thống</p>
          </div>
          <div className="rounded-full bg-emerald-100 p-3 text-emerald-700">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      <Card className="admin-users-stat-card">
        <CardContent className="admin-users-stat-content">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Mới tuần này</p>
            <p className="text-4xl font-bold text-foreground">{newUsersThisWeek}</p>
            <p className="text-sm text-muted-foreground">Tài khoản được tạo trong 7 ngày gần đây</p>
          </div>
          <div className="rounded-full bg-primary/10 p-3 text-primary">
            <UserPlus className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

export { AdminUsersStats };
