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
  Wallet,
  Package,
  Tags,
  TrendingUp,
  Boxes,
  FolderTree
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

const revenueData = [
  { month: "T1", revenue: 120 },
  { month: "T2", revenue: 148 },
  { month: "T3", revenue: 172 },
  { month: "T4", revenue: 196 },
  { month: "T5", revenue: 214 },
  { month: "T6", revenue: 238 }
];

const productCategoryData = [
  { name: "Phân bón", total: 18 },
  { name: "Chậu cây", total: 12 },
  { name: "Dụng cụ", total: 9 },
  { name: "Đất trồng", total: 7 }
];

const productItems = [
  {
    name: "Phân bón hữu cơ",
    category: "Phân bón",
    stock: "Còn hàng",
    price: "320.000đ"
  },
  {
    name: "Chậu sứ mini",
    category: "Chậu cây",
    stock: "Sắp hết",
    price: "180.000đ"
  },
  {
    name: "Bộ dụng cụ làm vườn",
    category: "Dụng cụ",
    stock: "Còn hàng",
    price: "450.000đ"
  }
];

function Dashboard() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-3xl border border-green-100 bg-gradient-to-r from-green-50 via-background to-emerald-50 p-6 shadow-sm sm:p-8">
        <Badge className="mb-3 w-fit border-transparent bg-green-100 text-green-700 hover:bg-green-100">
          Business Manager Dashboard
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Quản lý doanh thu, sản phẩm và loại sản phẩm
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground sm:text-base">
          Giao diện tổng quan ngắn gọn dành cho business manager, tập trung vào theo dõi doanh thu và danh mục sản phẩm.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        <DashboardCard
          title="Doanh thu tổng quan"
          value="238 triệu"
          description="Dữ liệu mô phỏng tháng hiện tại"
          icon={Wallet}
          trend={{ value: 12, isPositive: true }}
        />
        <DashboardCard
          title="Sản phẩm đang quản lý"
          value="46"
          description="Tổng số sản phẩm mô phỏng"
          icon={Package}
          trend={{ value: 8, isPositive: true }}
        />
        <DashboardCard
          title="Loại sản phẩm"
          value="4"
          description="Nhóm danh mục đang hiển thị"
          icon={Tags}
          trend={{ value: 0, isPositive: true }}
        />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Doanh thu theo tháng
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
                <LineChart data={revenueData}>
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
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderTree className="h-5 w-5 text-primary" />
              Loại sản phẩm
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                total: {
                  label: "Số sản phẩm",
                  color: "hsl(var(--primary))"
                }
              }}
              className="h-80"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productCategoryData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="total" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Boxes className="h-5 w-5 text-primary" />
            Sản phẩm đang quản lý
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {productItems.map((item) => (
              <div
                key={item.name}
                className="flex flex-col gap-3 rounded-2xl border border-border bg-card px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-foreground">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{item.category}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{item.price}</Badge>
                  <Badge className="border-transparent bg-green-100 text-green-700 hover:bg-green-100">
                    {item.stock}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export { Dashboard };
