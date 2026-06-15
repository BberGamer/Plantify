// Team.jsx - Trang giao diện quản lý đơn hàng cho business manager
import { DashboardCard } from "@/components/common/DashboardCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Search,
  Filter,
  ShoppingBag,
  Clock3,
  PackageCheck,
  Ban
} from "lucide-react";

const orderStats = [
  {
    title: "Tổng đơn hàng",
    value: "128",
    description: "Dữ liệu mô phỏng",
    icon: ShoppingBag,
    trend: { value: 10, isPositive: true }
  },
  {
    title: "Đơn chờ xử lý",
    value: "24",
    description: "Cần theo dõi",
    icon: Clock3,
    trend: { value: 6, isPositive: false }
  },
  {
    title: "Đơn hoàn thành",
    value: "86",
    description: "Trạng thái mô phỏng",
    icon: PackageCheck,
    trend: { value: 9, isPositive: true }
  }
];

const orders = [
  {
    id: "ORD-1024",
    customer: "Nguyễn Minh Anh",
    total: "1.250.000đ",
    payment: "Đã thanh toán",
    status: "Chờ xác nhận",
    date: "15/06/2026"
  },
  {
    id: "ORD-1025",
    customer: "Trần Khánh Linh",
    total: "890.000đ",
    payment: "COD",
    status: "Đang giao",
    date: "15/06/2026"
  },
  {
    id: "ORD-1026",
    customer: "Lê Quốc Bảo",
    total: "2.430.000đ",
    payment: "Đã thanh toán",
    status: "Hoàn thành",
    date: "14/06/2026"
  },
  {
    id: "ORD-1027",
    customer: "Phạm Ngọc Hà",
    total: "640.000đ",
    payment: "COD",
    status: "Đã hủy",
    date: "14/06/2026"
  }
];

function getStatusClassName(status) {
  switch (status) {
    case "Chờ xác nhận":
      return "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50";
    case "Đang giao":
      return "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-50";
    case "Hoàn thành":
      return "border-green-200 bg-green-50 text-green-700 hover:bg-green-50";
    case "Đã hủy":
      return "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-50";
    default:
      return "border-border bg-muted text-muted-foreground hover:bg-muted";
  }
}

function Team() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-3xl border border-green-100 bg-gradient-to-r from-green-50 via-background to-emerald-50 p-6 shadow-sm sm:p-8">
        <div className="space-y-3">
          <Badge className="w-fit border-transparent bg-green-100 text-green-700 hover:bg-green-100">
            Order Management UI
          </Badge>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Quản lý đơn hàng
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground sm:text-base">
              Giao diện mô phỏng để business manager theo dõi đơn hàng, tìm kiếm, lọc và cập nhật trạng thái đơn.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Tất cả dữ liệu, filter, search và nút thao tác hiện chỉ là giao diện hiển thị.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {orderStats.map((stat) => (
          <DashboardCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            description={stat.description}
            icon={stat.icon}
            trend={stat.trend}
          />
        ))}
      </section>

      <Card className="border-green-200/60 bg-white/95 shadow-sm">
        <CardHeader className="border-b border-green-100">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-xl">Bộ lọc đơn hàng</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Chỉ hiển thị giao diện search và filter, chưa có xử lý dữ liệu.
              </p>
            </div>
            <Badge variant="outline" className="w-fit border-green-200 bg-green-50 text-green-700">
              UI mô phỏng
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
            <div className="relative lg:col-span-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                disabled
                placeholder="Tìm kiếm theo mã đơn hoặc khách hàng"
                className="pl-10"
              />
            </div>
            <Button disabled variant="outline" className="justify-start">
              <Filter className="mr-2 h-4 w-4" />
              Trạng thái: Tất cả
            </Button>
            <Button disabled variant="outline" className="justify-start">
              <Filter className="mr-2 h-4 w-4" />
              Thanh toán: Tất cả
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-green-200/60 bg-white/95 shadow-sm">
        <CardHeader className="border-b border-green-100 bg-gradient-to-r from-white to-green-50/80">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-xl text-foreground">Danh sách đơn hàng</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Dữ liệu mẫu để minh họa giao diện quản lý đơn hàng.
              </p>
            </div>
            <Badge className="border-transparent bg-primary/10 text-primary hover:bg-primary/10">
              {orders.length} đơn hàng
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-green-100 bg-green-50/50 hover:bg-green-50/50">
                <TableHead className="px-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Mã đơn
                </TableHead>
                <TableHead className="px-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Khách hàng
                </TableHead>
                <TableHead className="px-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Tổng tiền
                </TableHead>
                <TableHead className="px-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Thanh toán
                </TableHead>
                <TableHead className="px-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Trạng thái
                </TableHead>
                <TableHead className="px-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Ngày đặt
                </TableHead>
                <TableHead className="px-4 text-right text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Hành động
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} className="border-green-100/80 hover:bg-green-50/30">
                  <TableCell className="px-4 py-4 font-medium text-foreground">
                    {order.id}
                  </TableCell>
                  <TableCell className="px-4 py-4">{order.customer}</TableCell>
                  <TableCell className="px-4 py-4">{order.total}</TableCell>
                  <TableCell className="px-4 py-4">
                    <Badge variant="outline">{order.payment}</Badge>
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <Badge className={getStatusClassName(order.status)}>{order.status}</Badge>
                  </TableCell>
                  <TableCell className="px-4 py-4 text-muted-foreground">
                    {order.date}
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <Button disabled size="sm" variant="outline">
                        <PackageCheck className="mr-2 h-4 w-4" />
                        Cập nhật trạng thái
                      </Button>
                      <Button disabled size="sm" variant="outline" className="text-rose-600">
                        <Ban className="mr-2 h-4 w-4" />
                        Hủy đơn
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export { Team };
