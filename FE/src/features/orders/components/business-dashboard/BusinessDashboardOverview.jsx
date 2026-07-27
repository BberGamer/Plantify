import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import { Wallet, Package, Tags, TrendingUp, Boxes, FolderTree, ChevronLeft, ChevronRight } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  LabelList
} from "recharts";

function BusinessDashboardOverview({ categories, error, formatRevenueValue, isLoading, productCategoryData, revenueBadge, revenueData, statsError, statsLoading }) {
  return (
<section className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Doanh thu theo tháng
              </CardTitle>
              <Badge variant="outline" className="w-fit border-green-200 bg-green-50 text-green-700">
                {revenueBadge}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="flex h-80 items-center justify-center text-sm text-muted-foreground">
                Đang tải dữ liệu doanh thu...
              </div>
            ) : statsError ? (
              <div className="flex h-80 items-center justify-center text-sm text-destructive">
                {statsError}
              </div>
            ) : (
              <ChartContainer
                config={{
                  revenue: {
                    label: "Doanh thu",
                    color: "#16a34a"
                  }
                }}
                className="h-80"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => formatRevenueValue(value)} width={80} />
                    <ChartTooltip
                      content={<ChartTooltipContent formatter={(value) => formatRevenueValue(value)} />}
                    />
                    <Line
                      type="linear"
                      dataKey="revenue"
                      stroke="#16a34a"
                      strokeWidth={4}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      dot={{ fill: "#16a34a", stroke: "#16a34a", strokeWidth: 1, r: 4 }}
                      activeDot={{ r: 6, fill: "#16a34a", stroke: "#16a34a" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden xl:col-span-2">
          <CardHeader>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="flex items-center gap-2">
                <FolderTree className="h-5 w-5 text-primary" />
                Loại sản phẩm
              </CardTitle>
              <Badge variant="outline" className="w-fit border-green-200 bg-green-50 text-green-700">
                {categories.length} danh mục
              </Badge>
            </div>
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
                <BarChart
                  data={productCategoryData}
                  layout="vertical"
                  margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
                  barCategoryGap={14}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tickMargin={8} axisLine={false} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={110}
                    tickMargin={10}
                    axisLine={false}
                    tickLine={false}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        labelFormatter={(_, payload) => payload?.[0]?.payload?.name || "Loại sản phẩm"}
                      />
                    }
                  />
                  <Bar dataKey="total" fill="var(--color-total)" radius={[0, 10, 10, 0]} maxBarSize={34}>
                    <LabelList
                      dataKey="total"
                      position="right"
                      className="fill-foreground text-xs font-medium"
                    />
                  </Bar>
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </section>
  );
}

export { BusinessDashboardOverview };
