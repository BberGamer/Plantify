// Dashboard.jsx - Trang dashboard giao diện riêng cho business manager
import { DashboardCard } from "@/components/common/DashboardCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import {
  TrendingUp,
  Wallet,
  ShoppingBag,
  Store,
  CircleDollarSign,
  Target,
  Package,
  Users,
  CalendarClock
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  BarChart,
  Bar
} from "recharts";

const revenueTrendData = [
  { month: "T1", revenue: 420, orders: 280 },
  { month: "T2", revenue: 465, orders: 312 },
  { month: "T3", revenue: 510, orders: 338 },
  { month: "T4", revenue: 590, orders: 376 },
  { month: "T5", revenue: 640, orders: 421 },
  { month: "T6", revenue: 705, orders: 468 }
];

const categoryPerformanceData = [
  { category: "Phân bón", revenue: 185 },
  { category: "Chậu cây", revenue: 142 },
  { category: "Dụng cụ", revenue: 118 },
  { category: "Hạt giống", revenue: 96 },
  { category: "Đất trồng", revenue: 88 }
];

const topPartners = [
  {
    name: "Green Garden Hub",
    region: "TP. Hồ Chí Minh",
    revenue: "128 triệu",
    growth: "+18%"
  },
  {
    name: "Leaf & Soil Market",
    region: "Hà Nội",
    revenue: "104 triệu",
    growth: "+14%"
  },
  {
    name: "Plant Care House",
    region: "Đà Nẵng",
    revenue: "92 triệu",
    growth: "+11%"
  },
  {
    name: "Urban Jungle Store",
    region: "Cần Thơ",
    revenue: "81 triệu",
    growth: "+9%"
  }
];

const priorityTasks = [
  {
    title: "Duyệt 12 yêu cầu mở rộng gian hàng",
    description: "Ưu tiên các đối tác ở khu vực miền Nam trong hôm nay.",
    status: "Cần xử lý"
  },
  {
    title: "Theo dõi chiến dịch mùa mưa",
    description: "Doanh thu nhóm phân bón đang vượt kế hoạch 8%.",
    status: "Đang tốt"
  },
  {
    title: "Rà soát đơn giao chậm",
    description: "Có 7 đơn vượt SLA tại khu vực Hà Nội và Hải Phòng.",
    status: "Cảnh báo"
  }
];

const recentActivities = [
  {
    actor: "Kênh Marketplace",
    action: "Ghi nhận 48 đơn hàng mới trong 2 giờ gần nhất",
    time: "5 phút trước"
  },
  {
    actor: "Đối tác Green Garden Hub",
    action: "Cập nhật tồn kho thêm 120 sản phẩm phân bón hữu cơ",
    time: "18 phút trước"
  },
  {
    actor: "Hệ thống vận hành",
    action: "Hoàn tất đối soát doanh thu cho 6 gian hàng trọng điểm",
    time: "35 phút trước"
  },
  {
    actor: "Nhóm hỗ trợ bán hàng",
    action: "Yêu cầu điều chỉnh phí vận chuyển cho chiến dịch cuối tuần",
    time: "1 giờ trước"
  }
];

function Dashboard() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="rounded-3xl border border-green-100 bg-gradient-to-r from-green-50 via-background to-emerald-50 p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <Badge className="w-fit border-transparent bg-green-100 text-green-700 hover:bg-green-100">
              Business Manager Dashboard
            </Badge>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Tổng quan vận hành kinh doanh
              </h1>
              <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
                Theo dõi doanh thu, đơn hàng, hiệu suất gian hàng và các đầu việc ưu tiên trên nền tảng Plantify.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:min-w-[320px]">
            <div className="rounded-2xl border border-green-100 bg-white/90 p-4">
              <p className="text-sm text-muted-foreground">Mục tiêu tháng</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">82%</p>
              <p className="mt-1 text-xs text-green-600">Đạt 1,23 tỷ / 1,5 tỷ</p>
            </div>
            <div className="rounded-2xl border border-green-100 bg-white/90 p-4">
              <p className="text-sm text-muted-foreground">Tỉ lệ hoàn tất</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">96,4%</p>
              <p className="mt-1 text-xs text-green-600">Tăng 2,1% so với tháng trước</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <DashboardCard
          title="Doanh thu tháng"
          value="1,23 tỷ"
          description="Cập nhật đến hôm nay"
          icon={Wallet}
          trend={{ value: 16, isPositive: true }}
        />
        <DashboardCard
          title="Đơn hàng thành công"
          value="468"
          description="30 ngày gần nhất"
          icon={ShoppingBag}
          trend={{ value: 11, isPositive: true }}
        />
        <DashboardCard
          title="Gian hàng hoạt động"
          value="32"
          description="Đang phát sinh doanh thu"
          icon={Store}
          trend={{ value: 9, isPositive: true }}
        />
        <DashboardCard
          title="Giá trị đơn trung bình"
          value="2,63 triệu"
          description="Theo toàn hệ thống"
          icon={CircleDollarSign}
          trend={{ value: 4, isPositive: false }}
        />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Hiệu suất doanh thu và đơn hàng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                revenue: {
                  label: "Doanh thu (triệu)",
                  color: "hsl(var(--primary))"
                },
                orders: {
                  label: "Đơn hàng",
                  color: "hsl(142 72% 45%)"
                }
              }}
              className="h-80"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 0 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="hsl(142 72% 45%)"
                    strokeWidth={2}
                    dot={{ fill: "hsl(142 72% 45%)", strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Đầu việc ưu tiên
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {priorityTasks.map((task) => (
              <div
                key={task.title}
                className="rounded-2xl border border-border bg-card p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">{task.title}</p>
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-green-200 bg-green-50 text-green-700"
                  >
                    {task.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Top danh mục theo doanh thu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                revenue: {
                  label: "Doanh thu (triệu)",
                  color: "hsl(var(--primary))"
                }
              }}
              className="h-80"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryPerformanceData} layout="vertical" margin={{ left: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis
                    dataKey="category"
                    type="category"
                    width={90}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Gian hàng nổi bật
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPartners.map((partner, index) => (
                <div
                  key={partner.name}
                  className="flex flex-col gap-3 rounded-2xl border border-border bg-card px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{partner.name}</p>
                      <p className="text-sm text-muted-foreground">{partner.region}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{partner.revenue}</Badge>
                    <Badge className="border-transparent bg-green-100 text-green-700 hover:bg-green-100">
                      {partner.growth}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-primary" />
            Hoạt động vận hành gần đây
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div
                key={`${activity.actor}-${activity.time}`}
                className="flex items-start gap-3 border-b border-border pb-4 last:border-0 last:pb-0"
              >
                <div className="mt-2 h-2 w-2 rounded-full bg-primary" />
                <div className="flex-1 space-y-1">
                  <p className="font-medium text-foreground">{activity.actor}</p>
                  <p className="text-sm text-muted-foreground">{activity.action}</p>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export { Dashboard };
