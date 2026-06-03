// AdminDashboard.jsx
// Trang tổng quan quản trị với dữ liệu người dùng thật

import { DashboardCard } from "@/components/common/DashboardCard";
import { useAdminUsers } from "@/features/auth/hooks";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard, Shield, UserCheck, UserPlus, Users } from "lucide-react";

const privilegedRoles = ["admin", "business manager", "content manager"];

const mapRoleLabel = (role) => {
  switch (role) {
    case "admin":
      return "Admin";
    case "business manager":
      return "Manager";
    case "content manager":
      return "Sales";
    default:
      return "Customer";
  }
};

const formatDate = (dateValue) => {
  if (!dateValue) {
    return "--";
  }

  return new Date(dateValue).toLocaleDateString("vi-VN");
};

const isThisWeek = (dateValue) => {
  if (!dateValue) {
    return false;
  }

  const createdAt = new Date(dateValue);
  const now = new Date();
  const diffInDays = (now - createdAt) / (1000 * 60 * 60 * 24);

  return diffInDays >= 0 && diffInDays <= 7;
};

function AdminDashboard() {
  const { users, loading, error } = useAdminUsers();

  const totalUsers = users.length;
  const activeUsers = users.filter((user) => user.status === "active").length;
  const newUsersThisWeek = users.filter((user) => isThisWeek(user.createdAt)).length;
  const privilegedUsers = users.filter((user) => privilegedRoles.includes(user.role)).length;
  const recentUsers = [...users].sort(
    (firstUser, secondUser) => new Date(secondUser.createdAt) - new Date(firstUser.createdAt)
  ).slice(0, 5);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Quản trị hệ thống</h1>
        <p className="mt-1 text-sm text-muted-foreground">Tổng quan người dùng trên nền tảng Plantify</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard
          title="Tổng người dùng"
          value={totalUsers.toString()}
          description="Toàn bộ tài khoản hiện có"
          icon={Users}
        />
        <DashboardCard
          title="Đang hoạt động"
          value={activeUsers.toString()}
          description="Tài khoản có trạng thái active"
          icon={UserCheck}
        />
        <DashboardCard
          title="Mới tuần này"
          value={newUsersThisWeek.toString()}
          description="Đăng ký trong 7 ngày gần đây"
          icon={UserPlus}
        />
        <DashboardCard
          title="Nhóm vận hành"
          value={privilegedUsers.toString()}
          description="Admin, manager và sales"
          icon={Shield}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-primary" />
            Hoạt động gần đây
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground">Đang tải dữ liệu người dùng...</div>
          ) : error ? (
            <div className="text-sm text-destructive">{error}</div>
          ) : recentUsers.length === 0 ? (
            <div className="text-sm text-muted-foreground">Chưa có dữ liệu người dùng để hiển thị.</div>
          ) : (
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div
                  key={user._id}
                  className="flex flex-col gap-3 rounded-xl border border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">{user.fullName}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{mapRoleLabel(user.role)}</Badge>
                    <Badge className={user.status === "active" ? "border-transparent bg-green-100 text-green-700" : "border-transparent bg-stone-200 text-stone-700"}>
                      {user.status === "active" ? "Hoạt động" : "Tạm khóa"}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{formatDate(user.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export { AdminDashboard };
