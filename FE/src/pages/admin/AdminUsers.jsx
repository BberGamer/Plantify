// AdminUsers.jsx
// Giao diện quản lý người dùng cho khu vực quản trị

import { DashboardCard } from "@/components/common/DashboardCard";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  MoreHorizontal,
  Search,
  Shield,
  Sparkles,
  UserCheck,
  UserPlus,
  Users
} from "lucide-react";

const mockUsers = [
  {
    id: 1,
    name: "Nguyễn Minh Anh",
    email: "minhanh@plantify.vn",
    role: "Admin",
    status: "Hoạt động",
    joinedAt: "12/05/2026",
    title: "Quản trị hệ thống"
  },
  {
    id: 2,
    name: "Trần Đức Huy",
    email: "duchuy@plantify.vn",
    role: "Manager",
    status: "Hoạt động",
    joinedAt: "28/05/2026",
    title: "Quản lý nội dung"
  },
  {
    id: 3,
    name: "Lê Thảo Nhi",
    email: "thaonhi@plantify.vn",
    role: "Customer",
    status: "Chờ duyệt",
    joinedAt: "30/05/2026",
    title: "Người dùng mới"
  },
  {
    id: 4,
    name: "Phạm Quốc Bảo",
    email: "quocbao@plantify.vn",
    role: "Manager",
    status: "Hoạt động",
    joinedAt: "19/05/2026",
    title: "Quản lý vận hành"
  },
  {
    id: 5,
    name: "Đặng Hải Yến",
    email: "haiyen@plantify.vn",
    role: "Customer",
    status: "Hoạt động",
    joinedAt: "01/06/2026",
    title: "Người dùng premium"
  },
  {
    id: 6,
    name: "Võ Gia Hân",
    email: "giahan@plantify.vn",
    role: "Admin",
    status: "Hoạt động",
    joinedAt: "21/05/2026",
    title: "Điều phối sản phẩm"
  },
  {
    id: 7,
    name: "Bùi Khánh Linh",
    email: "khanhlinh@plantify.vn",
    role: "Customer",
    status: "Tạm khóa",
    joinedAt: "14/05/2026",
    title: "Tài khoản cần rà soát"
  },
  {
    id: 8,
    name: "Ngô Tuấn Kiệt",
    email: "tuankiet@plantify.vn",
    role: "Customer",
    status: "Hoạt động",
    joinedAt: "02/06/2026",
    title: "Người dùng tích cực"
  }
];

const roleBadgeClassNames = {
  Admin: "border-transparent bg-primary text-primary-foreground",
  Manager: "border-transparent bg-green-100 text-green-800",
  Customer: "border-green-200 bg-white text-green-700"
};

const roleBadgeVariants = {
  Admin: "default",
  Manager: "secondary",
  Customer: "outline"
};

const statusBadgeClassNames = {
  "Hoạt động": "border-transparent bg-green-100 text-green-700",
  "Chờ duyệt": "border-transparent bg-amber-100 text-amber-700",
  "Tạm khóa": "border-transparent bg-stone-200 text-stone-700"
};

function AdminUsers() {
  const totalUsers = mockUsers.length;
  const activeUsers = mockUsers.filter((user) => user.status === "Hoạt động").length;
  const privilegedUsers = mockUsers.filter(
    (user) => user.role === "Admin" || user.role === "Manager"
  ).length;
  const newUsersThisWeek = mockUsers.filter((user) => ["30/05/2026", "01/06/2026", "02/06/2026"].includes(user.joinedAt)).length;

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white/95 via-green-50/90 to-white/95" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(45,106,79,0.08),transparent_42%)]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_18%,rgba(82,183,136,0.1),transparent_36%)]" />
      <div
        className="absolute inset-0 -z-10 opacity-35"
        style={{
          backgroundImage: "radial-gradient(circle at 2px 2px, rgba(45, 106, 79, 0.14) 1px, transparent 0)",
          backgroundSize: "32px 32px"
        }}
      />

      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-green-200/60 bg-white/80 p-6 shadow-xl backdrop-blur-sm sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/80 px-4 py-2 text-sm font-medium text-primary shadow-sm backdrop-blur-sm">
                <Sparkles className="h-4 w-4" />
                <span>Khu vực quản trị người dùng</span>
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl bg-gradient-to-r from-primary via-green-600 to-green-700 bg-clip-text text-transparent">
                  Quản lý người dùng Plantify
                </h1>
                <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
                  Theo dõi tài khoản hệ thống, phân loại vai trò và rà soát trạng thái hoạt động trên cùng một giao diện quản trị.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                className="border-green-200 bg-white/80 text-green-700 shadow-sm hover:bg-green-50"
              >
                Xuất danh sách
              </Button>
              <Button className="bg-gradient-to-r from-primary to-green-600 text-white shadow-lg hover:from-primary hover:to-green-700">
                <UserPlus className="mr-2 h-4 w-4" />
                Thêm người dùng
              </Button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardCard
            title="Tổng người dùng"
            value={totalUsers.toString()}
            description="Toàn bộ tài khoản trong hệ thống"
            icon={Users}
            trend={{ value: 18, isPositive: true }}
          />
          <DashboardCard
            title="Đang hoạt động"
            value={activeUsers.toString()}
            description="Tài khoản đang ở trạng thái tốt"
            icon={UserCheck}
            trend={{ value: 9, isPositive: true }}
          />
          <DashboardCard
            title="Admin / Manager"
            value={privilegedUsers.toString()}
            description="Nhóm có quyền vận hành"
            icon={Shield}
            trend={{ value: 6, isPositive: true }}
          />
          <DashboardCard
            title="Mới tuần này"
            value={newUsersThisWeek.toString()}
            description="Tài khoản vừa tham gia"
            icon={UserPlus}
            trend={{ value: 24, isPositive: true }}
          />
        </section>

        <section className="rounded-[1.75rem] border border-green-200/60 bg-white/90 p-4 shadow-lg backdrop-blur-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full max-w-xl">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm theo tên, email hoặc vai trò"
                className="h-11 rounded-xl border-green-200 bg-white pl-11 shadow-sm focus-visible:ring-primary/30"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button className="rounded-full bg-gradient-to-r from-primary to-green-600 text-white hover:from-primary hover:to-green-700">
                Tất cả
              </Button>
              <Button variant="outline" className="rounded-full border-green-200 bg-white text-green-700 hover:bg-green-50">
                Admin
              </Button>
              <Button variant="outline" className="rounded-full border-green-200 bg-white text-green-700 hover:bg-green-50">
                Manager
              </Button>
              <Button variant="outline" className="rounded-full border-green-200 bg-white text-green-700 hover:bg-green-50">
                Khách hàng
              </Button>
            </div>
          </div>
        </section>

        <Card className="overflow-hidden border-green-200/60 bg-white/95 shadow-xl backdrop-blur-sm">
          <CardHeader className="border-b border-green-100 bg-gradient-to-r from-white to-green-50/80">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-xl text-foreground">Danh sách người dùng</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Giao diện mẫu cho quản trị viên theo dõi tài khoản, quyền hạn và trạng thái xử lý.
                </p>
              </div>
              <Badge className="border-transparent bg-primary/10 px-3 py-1 text-primary hover:bg-primary/10">
                {totalUsers} tài khoản hiển thị
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-green-100 bg-green-50/50 hover:bg-green-50/50">
                  <TableHead className="px-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Người dùng
                  </TableHead>
                  <TableHead className="px-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Email
                  </TableHead>
                  <TableHead className="px-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Vai trò
                  </TableHead>
                  <TableHead className="px-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Trạng thái
                  </TableHead>
                  <TableHead className="px-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Ngày tham gia
                  </TableHead>
                  <TableHead className="px-4 text-right text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Hành động
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockUsers.map((user) => (
                  <TableRow key={user.id} className="border-green-100/80 hover:bg-green-50/40">
                    <TableCell className="px-4 py-4 align-top">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-11 w-11 ring-2 ring-green-100">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-green-600 text-sm font-semibold text-white">
                            {user.name
                              .split(" ")
                              .map((part) => part[0])
                              .join("")
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <p className="font-semibold text-foreground">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.title}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-4 text-sm text-muted-foreground">
                      {user.email}
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <Badge
                        variant={roleBadgeVariants[user.role]}
                        className={roleBadgeClassNames[user.role]}
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <Badge className={statusBadgeClassNames[user.status]}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-4 text-sm text-muted-foreground">
                      {user.joinedAt}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full text-muted-foreground hover:bg-green-50 hover:text-primary"
                        aria-label={`Tùy chọn cho ${user.name}`}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export { AdminUsers };
