// AdminDashboard.jsx
// Trang tong quan quan tri voi danh sach hoat dong nguoi dung gan day

import { useAdminUsers } from "@/features/auth/hooks";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard } from "lucide-react";

const mapRoleLabel = (role) => {
  switch (role) {
    case "admin":
      return "Admin";
    case "business manager":
      return "Business Manager";
    case "content manager":
      return "Content Manager";
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

function AdminDashboard() {
  const { users, loading, error } = useAdminUsers();
  const recentUsers = [...users]
    .sort((firstUser, secondUser) => new Date(secondUser.createdAt) - new Date(firstUser.createdAt))
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Quan tri he thong</h1>
        <p className="mt-1 text-sm text-muted-foreground">Theo doi hoat dong nguoi dung gan day tren nen tang Plantify</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-primary" />
            Hoat dong gan day
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground">Dang tai du lieu nguoi dung...</div>
          ) : error ? (
            <div className="text-sm text-destructive">{error}</div>
          ) : recentUsers.length === 0 ? (
            <div className="text-sm text-muted-foreground">Chua co du lieu nguoi dung de hien thi.</div>
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
                    <Badge className={user.status ? "border-transparent bg-green-100 text-green-700" : "border-transparent bg-stone-200 text-stone-700"}>
                      {user.status ? "Hoat dong" : "Tam khoa"}
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
