// AdminDashboard.jsx
// Trang tổng quan quản trị với thống kê, biểu đồ tăng trưởng và hoạt động gần đây

import { useMemo } from "react";
import { useAdminUsers } from "@/features/auth/hooks";
import { AdminUsersStats } from "@/features/auth/components/AdminUsersStats";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Activity, TrendingUp } from "lucide-react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

const mapRoleLabel = (role) => {
  switch (role) {
    case "admin":
      return "Admin";
    case "business manager":
      return "Business Manager";
    case "content manager":
      return "Content Manager";
    default:
      return "Khách hàng";
  }
};

const formatDate = (dateValue) => {
  if (!dateValue) {
    return "--";
  }

  return new Date(dateValue).toLocaleString("vi-VN");
};

function AdminDashboard() {
  const { users, loading, error } = useAdminUsers();

  const totalUsers = users.length;
  const activeUsers = users.filter((user) => user.status).length;
  const managedUsers = users.filter((user) => user.role !== "customer").length;

  const weekAgo = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date;
  }, []);

  const newUsersThisWeek = users.filter((user) => {
    if (!user.createdAt) {
      return false;
    }

    return new Date(user.createdAt) >= weekAgo;
  }).length;

  const recentUsers = useMemo(
    () =>
      [...users]
        .sort((firstUser, secondUser) => new Date(secondUser.createdAt) - new Date(firstUser.createdAt))
        .slice(0, 5),
    [users]
  );

  const userGrowthData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return Array.from({ length: 7 }, (_, index) => {
      const day = new Date(today);
      day.setDate(today.getDate() - (6 - index));

      const nextDay = new Date(day);
      nextDay.setDate(day.getDate() + 1);

      const total = users.filter((user) => {
        if (!user.createdAt) {
          return false;
        }

        const createdAt = new Date(user.createdAt);
        return createdAt >= day && createdAt < nextDay;
      }).length;

      return {
        label: day.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
        }),
        total,
      };
    });
  }, [users]);

  const userGrowthSummary = useMemo(() => {
    const totalNewUsers = userGrowthData.reduce((sum, item) => sum + item.total, 0);
    const peakDay = userGrowthData.reduce(
      (currentPeak, item) => (item.total > currentPeak.total ? item : currentPeak),
      userGrowthData[0] || { label: "--", total: 0 }
    );

    return {
      totalNewUsers,
      peakDay,
    };
  }, [userGrowthData]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-3xl border border-green-100 bg-gradient-to-r from-green-50 via-background to-emerald-50 p-6 shadow-sm sm:p-8">
        <Badge className="mb-3 w-fit border-transparent bg-green-100 text-green-700 hover:bg-green-100">
          Admin Dashboard
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Quản trị hệ thống
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground sm:text-base">
          Theo dõi nhanh số lượng người dùng, mức tăng trưởng tài khoản và hoạt động gần đây trên nền tảng Plantify.
        </p>
      </section>

      <AdminUsersStats
        totalUsers={totalUsers}
        activeUsers={activeUsers}
        managedUsers={managedUsers}
        newUsersThisWeek={newUsersThisWeek}
      />

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <Card className="overflow-hidden border-green-200/60 bg-white/95 shadow-sm xl:col-span-3">
          <CardHeader className="border-b border-green-100 bg-gradient-to-r from-white to-green-50/80">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Số lượng người dùng gia tăng
              </CardTitle>
              <Badge variant="outline" className="w-fit border-green-200 bg-green-50 text-green-700">
                7 ngày gần đây
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-green-100 bg-gradient-to-r from-green-50 to-white p-4">
                <p className="text-sm font-medium text-muted-foreground">Người dùng mới trong 7 ngày</p>
                <p className="mt-2 text-3xl font-bold text-foreground">{userGrowthSummary.totalNewUsers}</p>
                <p className="mt-1 text-sm text-muted-foreground">Tổng số tài khoản được tạo trong tuần gần nhất</p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-white p-4">
                <p className="text-sm font-medium text-muted-foreground">Ngày tăng mạnh nhất</p>
                <p className="mt-2 text-3xl font-bold text-foreground">{userGrowthSummary.peakDay.total}</p>
                <p className="mt-1 text-sm text-muted-foreground">Cao nhất vào ngày {userGrowthSummary.peakDay.label}</p>
              </div>
            </div>

            <ChartContainer
              config={{
                total: {
                  label: "Người dùng mới",
                  color: "hsl(var(--primary))",
                },
              }}
              className="h-80 rounded-2xl border border-green-100 bg-gradient-to-b from-white to-green-50/40 p-4"
            >
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={userGrowthData} margin={{ top: 12, right: 12, left: -12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="adminUserGrowthBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#16a34a" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="#86efac" stopOpacity={0.45} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(34, 197, 94, 0.18)" />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    width={40}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="total"
                    fill="url(#adminUserGrowthBar)"
                    stroke="#16a34a"
                    strokeOpacity={0.2}
                    radius={[12, 12, 4, 4]}
                    barSize={34}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartContainer>
            <p className="text-sm text-muted-foreground">
              Biểu đồ thể hiện số tài khoản được tạo mới theo từng ngày.
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-green-200/60 bg-white/95 shadow-sm xl:col-span-2">
          <CardHeader className="border-b border-green-100 bg-gradient-to-r from-white to-green-50/80">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Hoạt động gần đây
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
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
                    className="rounded-2xl border border-green-100 bg-gradient-to-r from-white to-green-50/40 p-4 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-lg font-semibold text-primary">
                          {user.fullName?.trim()?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold text-foreground">{user.fullName}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <p className="text-xs text-muted-foreground">Tài khoản vừa phát sinh hoạt động trên hệ thống.</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 lg:max-w-[220px] lg:justify-end">
                        <Badge variant="outline" className="border-green-200 bg-white text-foreground">
                          {mapRoleLabel(user.role)}
                        </Badge>
                        <Badge
                          className={
                            user.status
                              ? "border-transparent bg-green-100 text-green-700"
                              : "border-transparent bg-stone-200 text-stone-700"
                          }
                        >
                          {user.status ? "Hoạt động" : "Tạm khóa"}
                        </Badge>
                        <span className="w-full text-sm text-muted-foreground lg:text-right">{formatDate(user.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

export { AdminDashboard };
