import { LayoutDashboard, Users, Leaf } from "lucide-react";
import { DashboardCard } from "@/components/common/DashboardCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function AdminDashboard() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Quản trị hệ thống</h1>
        <p className="text-muted-foreground mt-1 text-sm">Tổng quan nền tảng Plantify</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          title="Người dùng"
          value="12.4K"
          icon={Users}
          trend={{ value: 8, isPositive: true }}
        />
        <DashboardCard
          title="Cây trong CSDL"
          value="3.2K"
          icon={Leaf}
          trend={{ value: 12, isPositive: true }}
        />
        <DashboardCard
          title="Phiên AI hôm nay"
          value="1.8K"
          icon={LayoutDashboard}
          trend={{ value: 5, isPositive: true }}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hoạt động gần đây</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Khu vực quản trị — kết nối API backend để hiển thị log thực tế.
        </CardContent>
      </Card>
    </div>
  );
}

export { AdminDashboard };
