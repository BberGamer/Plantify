// Dashboard.jsx - Trang dashboard giao diện riêng cho business manager
import { useMemo } from "react";
import { DashboardCard } from "@/components/common/DashboardCard";
import { useCategories, useProducts } from "@/features/products/hooks";
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

function getStockLabel(stock) {
  if (stock <= 0) {
    return {
      label: "Hết hàng",
      className: "border-transparent bg-rose-100 text-rose-700 hover:bg-rose-100"
    };
  }

  if (stock <= 10) {
    return {
      label: "Sắp hết",
      className: "border-transparent bg-amber-100 text-amber-700 hover:bg-amber-100"
    };
  }

  return {
    label: "Còn hàng",
    className: "border-transparent bg-green-100 text-green-700 hover:bg-green-100"
  };
}

function Dashboard() {
  const {
    products,
    total,
    loading: productsLoading,
    error: productsError
  } = useProducts({ limit: 1000, sortBy: "newest" });
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError
  } = useCategories();

  const productItems = useMemo(() => products.slice(0, 3), [products]);

  const productCategoryData = useMemo(() => {
    const productCountMap = products.reduce((accumulator, product) => {
      const categoryName = product.categoryId?.name || "Chưa phân loại";
      accumulator[categoryName] = (accumulator[categoryName] || 0) + 1;
      return accumulator;
    }, {});

    return categories.map((category) => ({
      name: category.name,
      total: productCountMap[category.name] || 0
    }));
  }, [categories, products]);

  const isLoading = productsLoading || categoriesLoading;
  const error = productsError || categoriesError;

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
          Dashboard đang lấy dữ liệu thật cho sản phẩm và loại sản phẩm từ hệ thống hiện tại.
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
          value={productsLoading ? "..." : total.toString()}
          description={productsError ? productsError : "Dữ liệu thật từ hệ thống"}
          icon={Package}
          trend={{ value: 8, isPositive: true }}
        />
        <DashboardCard
          title="Loại sản phẩm"
          value={categoriesLoading ? "..." : categories.length.toString()}
          description={categoriesError ? categoriesError : "Dữ liệu thật từ hệ thống"}
          icon={Tags}
          trend={{ value: 0, isPositive: true }}
        />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Doanh thu theo tháng
              </CardTitle>
              <Badge variant="outline" className="w-fit border-amber-200 bg-amber-50 text-amber-700">
                Dữ liệu mô phỏng
              </Badge>
            </div>
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
            <p className="mt-4 text-sm text-muted-foreground">
              Chức năng theo dõi doanh thu thực tế đang được phát triển.
            </p>
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
            {isLoading ? (
              <div className="flex h-80 items-center justify-center text-sm text-muted-foreground">
                Đang tải dữ liệu danh mục...
              </div>
            ) : error ? (
              <div className="flex h-80 items-center justify-center text-sm text-destructive">
                {error}
              </div>
            ) : (
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
            )}
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
          {productsLoading ? (
            <div className="text-sm text-muted-foreground">Đang tải danh sách sản phẩm...</div>
          ) : productsError ? (
            <div className="text-sm text-destructive">{productsError}</div>
          ) : (
            <div className="space-y-4">
              {productItems.map((item) => {
                const stockStatus = getStockLabel(item.stock);

                return (
                  <div
                    key={item._id}
                    className="flex flex-col gap-3 rounded-2xl border border-border bg-card px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-semibold text-foreground">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.categoryId?.name || "Chưa phân loại"}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{Number(item.price || 0).toLocaleString("vi-VN")}đ</Badge>
                      <Badge className={stockStatus.className}>{stockStatus.label}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export { Dashboard };
