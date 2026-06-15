// Dashboard.jsx
// Trang dashboard UI dành cho Content Manager quản lý nội dung và sản phẩm hiển thị trên Plantify.

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  Eye,
  FileText,
  ImagePlus,
  Leaf,
  MessageSquareText,
  Package,
  PencilLine,
  Plus,
  Search,
  Sparkles
} from "lucide-react";
import { motion } from "motion/react";

const contentStats = [
  {
    title: "Bài viết đang hiển thị",
    value: "42",
    description: "Tăng 6 bài trong tháng này",
    icon: FileText
  },
  {
    title: "Sản phẩm cần rà soát",
    value: "18",
    description: "Ảnh, mô tả và danh mục",
    icon: Package
  },
  {
    title: "Lượt xem nội dung",
    value: "24.8K",
    description: "Từ blog và marketplace",
    icon: Eye
  },
  {
    title: "Bình luận chờ duyệt",
    value: "9",
    description: "Ưu tiên phản hồi trong ngày",
    icon: MessageSquareText
  }
];

const reviewQueue = [
  {
    title: "Cách chăm sóc monstera khi thiếu sáng",
    type: "Blog",
    owner: "Nguyễn Minh Anh",
    status: "Chờ duyệt",
    dueDate: "15/06/2026"
  },
  {
    title: "Bộ dụng cụ làm vườn mini",
    type: "Sản phẩm",
    owner: "Green Garden Store",
    status: "Cần chỉnh ảnh",
    dueDate: "16/06/2026"
  },
  {
    title: "Lịch tưới cây theo mùa mưa",
    type: "Kiến thức",
    owner: "Plantify Editorial",
    status: "Đang biên tập",
    dueDate: "17/06/2026"
  },
  {
    title: "Phân bón hữu cơ NPK",
    type: "Sản phẩm",
    owner: "Urban Plant Shop",
    status: "Cần kiểm tra",
    dueDate: "18/06/2026"
  }
];

const publishingPlan = [
  {
    label: "Blog chăm sóc cây",
    progress: 76,
    note: "8/11 nội dung đã hoàn tất"
  },
  {
    label: "Hình ảnh marketplace",
    progress: 58,
    note: "29/50 sản phẩm đạt chuẩn"
  },
  {
    label: "Bộ tag phân loại",
    progress: 84,
    note: "21/25 tag đã rà soát"
  }
];

const activityItems = [
  "Cập nhật mô tả cho 6 sản phẩm chăm sóc cây",
  "Duyệt 3 bài viết mới trong chuyên mục Blog",
  "Gắn tag mới cho nhóm cây nội thất",
  "Ẩn 2 bình luận không phù hợp khỏi marketplace"
];

const getStatusClassName = (status) => {
  switch (status) {
    case "Chờ duyệt":
      return "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50";
    case "Cần chỉnh ảnh":
      return "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-50";
    case "Đang biên tập":
      return "border-green-200 bg-green-50 text-green-700 hover:bg-green-50";
    default:
      return "border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-50";
  }
};

function ContentDashboard() {
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="grid gap-6 p-6 lg:grid-cols-[1fr_320px] lg:p-8">
          <div className="space-y-4">
            <Badge className="w-fit border-transparent bg-primary/10 text-primary hover:bg-primary/10">
              Content Manager Dashboard
            </Badge>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Quản lý nội dung Plantify
              </h1>
              <p className="max-w-3xl text-sm text-muted-foreground sm:text-base">
                Theo dõi bài viết, nội dung sản phẩm, hình ảnh marketplace và hàng chờ duyệt trên cùng một giao diện.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button className="bg-gradient-to-r from-primary to-green-600">
                <Plus className="h-4 w-4" />
                Tạo nội dung
              </Button>
              <Button variant="outline">
                <Search className="h-4 w-4" />
                Rà soát nội dung
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-green-100 bg-green-50/60 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Leaf className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Chuẩn nội dung tuần này</p>
                <p className="text-xs text-muted-foreground">Tập trung chất lượng ảnh và mô tả</p>
              </div>
            </div>
            <div className="mt-5 space-y-4">
              {publishingPlan.map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="text-sm text-muted-foreground">{item.progress}%</span>
                  </div>
                  <Progress value={item.progress} />
                  <p className="text-xs text-muted-foreground">{item.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {contentStats.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-semibold">{stat.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Hàng chờ duyệt</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Nội dung cần kiểm tra trước khi hiển thị công khai.
                </p>
              </div>
              <Button variant="outline" size="sm">
                <CalendarClock className="h-4 w-4" />
                Lịch xuất bản
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nội dung</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Người phụ trách</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Hạn xử lý</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviewQueue.map((item) => (
                  <TableRow key={item.title}>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.type}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{item.owner}</TableCell>
                    <TableCell>
                      <Badge className={getStatusClassName(item.status)}>{item.status}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{item.dueDate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activityItems.map((item) => (
              <div key={item} className="flex gap-3 rounded-lg border border-border p-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                <p className="text-sm text-muted-foreground">{item}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <Tabs defaultValue="editorial" className="space-y-4">
        <TabsList>
          <TabsTrigger value="editorial">
            <BookOpen className="h-4 w-4" />
            Editorial
          </TabsTrigger>
          <TabsTrigger value="media">
            <ImagePlus className="h-4 w-4" />
            Media
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="editorial">
          <Card>
            <CardContent className="grid gap-4 p-5 md:grid-cols-3">
              <ManagerActionCard
                icon={PencilLine}
                title="Biên tập bài viết"
                description="Kiểm tra tiêu đề, mô tả, tag và trạng thái xuất bản."
              />
              <ManagerActionCard
                icon={Package}
                title="Chuẩn hóa sản phẩm"
                description="Rà soát ảnh đại diện, mô tả và phân loại sản phẩm."
              />
              <ManagerActionCard
                icon={Sparkles}
                title="Tối ưu nội dung"
                description="Ưu tiên nội dung có lượt xem cao và tỷ lệ tương tác tốt."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media">
          <Card>
            <CardContent className="p-5 text-sm text-muted-foreground">
              Khu vực media dùng để rà soát ảnh sản phẩm, ảnh blog và ảnh minh họa trước khi public.
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardContent className="p-5 text-sm text-muted-foreground">
              Khu vực analytics hiển thị hiệu quả nội dung, lượt xem và nhóm chủ đề đang tăng trưởng.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ManagerActionCard({ icon: Icon, title, description }) {
  return (
    <div className="rounded-lg border border-border p-4">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export { ContentDashboard };
