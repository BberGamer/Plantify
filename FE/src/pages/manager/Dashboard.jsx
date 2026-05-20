import { DashboardCard } from "@/components/common/DashboardCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  Bug,
  BookOpen,
  Users,
  Search,
  Calendar,
  Leaf
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

const searchTrendData = [
  { month: "T1", searches: 1200 },
  { month: "T2", searches: 1900 },
  { month: "T3", searches: 2400 },
  { month: "T4", searches: 3200 },
  { month: "T5", searches: 4100 },
  { month: "T6", searches: 3800 }
];

const diseaseTrendData = [
  { disease: "Lá vàng", cases: 245 },
  { disease: "Rệp sáp", cases: 189 },
  { disease: "Thối rễ", cases: 156 },
  { disease: "Bệnh nấm", cases: 142 },
  { disease: "Thiếu dinh dưỡng", cases: 98 }
];

const topPlants = [
  { name: "Monstera Deliciosa", views: 12450, growth: "+23%" },
  { name: "Trầu Bà Nam Mỹ", views: 9870, growth: "+18%" },
  { name: "Sen Đá", views: 8650, growth: "+15%" },
  { name: "Kim Tiền", views: 7340, growth: "+12%" },
  { name: "Cây Lưỡi Hổ", views: 6920, growth: "+8%" }
];

function Dashboard() {
  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-5xl font-bold mb-2">Dashboard & Analytics</h1>
          <p className="text-xl text-muted-foreground">Phân tích xu hướng và thống kê nền tảng</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <DashboardCard
            title="Tổng người dùng"
            value="12,450"
            description="Tháng này"
            icon={Users}
            trend={{ value: 18, isPositive: true }}
          />
          <DashboardCard
            title="Lượt tìm kiếm"
            value="45,231"
            description="7 ngày qua"
            icon={Search}
            trend={{ value: 23, isPositive: true }}
          />
          <DashboardCard
            title="Chẩn đoán AI"
            value="2,847"
            description="Tuần này"
            icon={Bug}
            trend={{ value: 15, isPositive: true }}
          />
          <DashboardCard
            title="Bài viết mới"
            value="48"
            description="Tháng này"
            icon={BookOpen}
            trend={{ value: 12, isPositive: false }}
          />
        </div>

        <Tabs defaultValue="trends" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="trends">
              <TrendingUp className="w-4 h-4 mr-2" />
              Xu hướng
            </TabsTrigger>
            <TabsTrigger value="plants">
              <Leaf className="w-4 h-4 mr-2" />
              Cây phổ biến
            </TabsTrigger>
            <TabsTrigger value="diseases">
              <Bug className="w-4 h-4 mr-2" />
              Bệnh thường gặp
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Lượt tìm kiếm theo tháng</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    searches: {
                      label: "Lượt tìm kiếm",
                      color: "hsl(var(--primary))"
                    }
                  }}
                  className="h-80"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={searchTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="searches"
                        stroke="hsl(var(--primary))"
                        strokeWidth={3}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Người dùng hoạt động</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Hôm nay</span>
                      <span className="font-semibold">3,240</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Tuần này</span>
                      <span className="font-semibold">18,765</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Tháng này</span>
                      <span className="font-semibold">56,432</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tương tác</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Câu hỏi AI</span>
                      <span className="font-semibold">8,934</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Lưu cây yêu thích</span>
                      <span className="font-semibold">12,450</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Chia sẻ</span>
                      <span className="font-semibold">2,876</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="plants">
            <Card>
              <CardHeader>
                <CardTitle>Cây được xem nhiều nhất</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topPlants.map((plant, index) => (
                    <div
                      key={plant.name}
                      className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{plant.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {plant.views.toLocaleString()} lượt xem
                        </p>
                      </div>
                      <div className="text-green-600 font-medium">{plant.growth}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="diseases">
            <Card>
              <CardHeader>
                <CardTitle>Bệnh được chẩn đoán nhiều nhất</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    cases: {
                      label: "Số ca",
                      color: "hsl(var(--primary))"
                    }
                  }}
                  className="h-80"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={diseaseTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="disease" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="cases" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Hoạt động gần đây
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  user: "Người dùng #1234",
                  action: "Chẩn đoán bệnh Lá vàng",
                  time: "2 phút trước"
                },
                {
                  user: "Người dùng #5678",
                  action: "Tìm kiếm Monstera Deliciosa",
                  time: "5 phút trước"
                },
                {
                  user: "Người dùng #9101",
                  action: "Lưu cây Sen Đá vào yêu thích",
                  time: "12 phút trước"
                },
                {
                  user: "Người dùng #1121",
                  action: "Đặt nhắc nhở tưới nước",
                  time: "18 phút trước"
                },
                {
                  user: "Người dùng #3141",
                  action: "Xem bài viết về phòng ngừa sâu bệnh",
                  time: "25 phút trước"
                }
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 pb-4 border-b border-border last:border-0"
                >
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div className="flex-1">
                    <p className="font-medium">{activity.user}</p>
                    <p className="text-sm text-muted-foreground">{activity.action}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export { Dashboard };
