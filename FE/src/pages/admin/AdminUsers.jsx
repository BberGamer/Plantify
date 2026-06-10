// AdminUsers.jsx
// Giao diện quản lý người dùng cho khu vực quản trị

import { useState } from "react";
import { useAdminUsers } from "@/features/auth/hooks";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  User,
  UserCheck,
  UserPlus,
  UserX,
} from "lucide-react";

const roleBadgeClassNames = {
  Admin: "border-transparent bg-primary text-primary-foreground",
  "Business Manager": "border-transparent bg-green-100 text-green-800",
  "Content Manager": "border-transparent bg-emerald-100 text-emerald-800",
  Customer: "border-green-200 bg-white text-green-700"
};

const roleBadgeVariants = {
  Admin: "default",
  "Business Manager": "secondary",
  "Content Manager": "secondary",
  Customer: "outline"
};

const statusBadgeClassNames = {
  "Hoạt động": "border-transparent bg-green-100 text-green-700",
  "Tạm khóa": "border-transparent bg-stone-200 text-stone-700"
};

const initialCreateUserForm = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  password: "",
  confirmPassword: "",
  role: "",
};

const mapRoleLabel = (role) => {
  switch (role) {
    case "admin":
      return "Admin";
    case "business manager":
      return "Business Manager";
    case "content manager":
      return "Content Manager";
    default:
      return "Customer";
  }
};

const mapStatusLabel = (status) => {
  return status === "active" ? "Hoạt động" : "Tạm khóa";
};

const formatDate = (dateValue) => {
  if (!dateValue) {
    return "--";
  }

  return new Date(dateValue).toLocaleDateString("vi-VN");
};

const getInitials = (fullName) => {
  return (fullName || "ND")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

function AdminUsers() {
  const { users, loading, error, createUser, updateUserStatus } = useAdminUsers();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createUserForm, setCreateUserForm] = useState(initialCreateUserForm);
  const [submitting, setSubmitting] = useState(false);
  const [statusUpdatingUserId, setStatusUpdatingUserId] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const totalUsers = users.length;
  const activeUsers = users.filter((user) => user.status === "active").length;
  const managedUsers = users.filter((user) => user.role !== "customer").length;
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const newUsersThisWeek = users.filter((user) => {
    if (!user.createdAt) {
      return false;
    }

    return new Date(user.createdAt) >= weekAgo;
  }).length;
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const filteredUsers = users.filter((user) => {
    const matchesSearch = !normalizedSearchTerm || (user.fullName || "").toLowerCase().includes(normalizedSearchTerm);
    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const resetCreateUserForm = () => {
    setCreateUserForm(initialCreateUserForm);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleCreateDialogChange = (open) => {
    setIsCreateDialogOpen(open);

    if (!open) {
      resetCreateUserForm();
    }
  };

  const handleCreateUserFormChange = (event) => {
    const { name, value } = event.target;

    setCreateUserForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  const handleCreateUserSubmit = async (event) => {
    event.preventDefault();

    const { fullName, email, phone, address, password, confirmPassword, role } = createUserForm;

    if (!fullName || !email || !password || !role) {
      toast.error("Vui lòng điền đầy đủ các thông tin bắt buộc");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Email không đúng định dạng");
      return;
    }

    if (phone && phone.trim() !== "") {
      const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
      if (!phoneRegex.test(phone.trim())) {
        toast.error("Số điện thoại không hợp lệ (phải bắt đầu bằng 03, 05, 07, 08, 09 và gồm 10 chữ số)");
        return;
      }
    }

    if (password.length < 8) {
      toast.error("Mật khẩu phải chứa tối thiểu 8 ký tự");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không trùng khớp");
      return;
    }

    setSubmitting(true);

    try {
      await createUser({
        fullName,
        email,
        phone,
        address,
        password,
        role,
      });
      toast.success("Tạo tài khoản người dùng thành công");
      resetCreateUserForm();
      setIsCreateDialogOpen(false);
    } catch (submitError) {
      const errorMessage = submitError.response?.data?.message || submitError.message || "Không thể tạo tài khoản người dùng";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (user) => {
    const nextStatus = user.status === "active" ? "inactive" : "active";
    setStatusUpdatingUserId(user._id);

    try {
      await updateUserStatus(user._id, nextStatus);
      toast.success(nextStatus === "active" ? "Kích hoạt tài khoản thành công" : "Tạm khóa tài khoản thành công");
    } catch (statusError) {
      const errorMessage = statusError.response?.data?.message || statusError.message || "Không thể cập nhật trạng thái người dùng";
      toast.error(errorMessage);
    } finally {
      setStatusUpdatingUserId("");
    }
  };

  return (
    <>
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
                  <h1 className="bg-gradient-to-r from-primary via-green-600 to-green-700 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
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
                <Button
                  className="bg-gradient-to-r from-primary to-green-600 text-white shadow-lg hover:from-primary hover:to-green-700"
                  onClick={() => setIsCreateDialogOpen(true)}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Thêm người dùng
                </Button>
              </div>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card className="border-green-200/60 bg-white/95 shadow-lg backdrop-blur-sm">
              <CardContent className="flex items-start justify-between gap-4 p-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Tổng người dùng</p>
                  <p className="text-4xl font-bold text-foreground">{totalUsers}</p>
                  <p className="text-sm text-muted-foreground">Toàn bộ tài khoản trong hệ thống</p>
                </div>
                <div className="rounded-full bg-primary/10 p-3 text-primary">
                  <User className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200/60 bg-white/95 shadow-lg backdrop-blur-sm">
              <CardContent className="flex items-start justify-between gap-4 p-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Đang hoạt động</p>
                  <p className="text-4xl font-bold text-foreground">{activeUsers}</p>
                  <p className="text-sm text-muted-foreground">Tài khoản đang ở trạng thái tốt</p>
                </div>
                <div className="rounded-full bg-green-100 p-3 text-green-700">
                  <UserCheck className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200/60 bg-white/95 shadow-lg backdrop-blur-sm">
              <CardContent className="flex items-start justify-between gap-4 p-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Admin / Business / Content</p>
                  <p className="text-4xl font-bold text-foreground">{managedUsers}</p>
                  <p className="text-sm text-muted-foreground">Nhóm có quyền vận hành hệ thống</p>
                </div>
                <div className="rounded-full bg-emerald-100 p-3 text-emerald-700">
                  <ShieldCheck className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200/60 bg-white/95 shadow-lg backdrop-blur-sm">
              <CardContent className="flex items-start justify-between gap-4 p-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Mới tuần này</p>
                  <p className="text-4xl font-bold text-foreground">{newUsersThisWeek}</p>
                  <p className="text-sm text-muted-foreground">Tài khoản được tạo trong 7 ngày gần đây</p>
                </div>
                <div className="rounded-full bg-primary/10 p-3 text-primary">
                  <UserPlus className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="rounded-[1.75rem] border border-green-200/60 bg-white/90 p-4 shadow-lg backdrop-blur-sm sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full max-w-xl">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Tìm theo họ và tên"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="h-11 rounded-xl border-green-200 bg-white pl-11 shadow-sm focus-visible:ring-primary/30"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  onClick={() => setRoleFilter("all")}
                  className={`rounded-full ${roleFilter === "all" ? "bg-gradient-to-r from-primary to-green-600 text-white hover:from-primary hover:to-green-700" : "border-green-200 bg-white text-green-700 hover:bg-green-50"}`}
                >
                  Tất cả
                </Button>
                <Button
                  variant={roleFilter === "admin" ? "default" : "outline"}
                  onClick={() => setRoleFilter("admin")}
                  className={`rounded-full ${roleFilter === "admin" ? "bg-gradient-to-r from-primary to-green-600 text-white hover:from-primary hover:to-green-700" : "border-green-200 bg-white text-green-700 hover:bg-green-50"}`}
                >
                  Admin
                </Button>
                <Button
                  variant={roleFilter === "business manager" ? "default" : "outline"}
                  onClick={() => setRoleFilter("business manager")}
                  className={`rounded-full ${roleFilter === "business manager" ? "bg-gradient-to-r from-primary to-green-600 text-white hover:from-primary hover:to-green-700" : "border-green-200 bg-white text-green-700 hover:bg-green-50"}`}
                >
                  Business Manager
                </Button>
                <Button
                  variant={roleFilter === "content manager" ? "default" : "outline"}
                  onClick={() => setRoleFilter("content manager")}
                  className={`rounded-full ${roleFilter === "content manager" ? "bg-gradient-to-r from-primary to-green-600 text-white hover:from-primary hover:to-green-700" : "border-green-200 bg-white text-green-700 hover:bg-green-50"}`}
                >
                  Content Manager
                </Button>
                <Button
                  variant={roleFilter === "customer" ? "default" : "outline"}
                  onClick={() => setRoleFilter("customer")}
                  className={`rounded-full ${roleFilter === "customer" ? "bg-gradient-to-r from-primary to-green-600 text-white hover:from-primary hover:to-green-700" : "border-green-200 bg-white text-green-700 hover:bg-green-50"}`}
                >
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
                    Dữ liệu đang được lấy trực tiếp từ hệ thống tài khoản hiện tại.
                  </p>
                </div>
                <Badge className="border-transparent bg-primary/10 px-3 py-1 text-primary hover:bg-primary/10">
                  {filteredUsers.length} tài khoản hiển thị
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {loading ? (
                <div className="px-6 py-10 text-center text-sm text-muted-foreground">
                  Đang tải danh sách người dùng...
                </div>
              ) : error ? (
                <div className="px-6 py-10 text-center text-sm text-destructive">
                  {error}
                </div>
              ) : (
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
                    {filteredUsers.length === 0 ? (
                      <TableRow className="border-green-100/80 hover:bg-transparent">
                        <TableCell colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">
                          Không tìm thấy người dùng phù hợp.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => {
                        const roleLabel = mapRoleLabel(user.role);
                        const statusLabel = mapStatusLabel(user.status);
                        const canUpdateStatus = user.role !== "admin";
                        const isUpdatingStatus = statusUpdatingUserId === user._id;
                        const nextStatus = user.status === "active" ? "inactive" : "active";

                        return (
                          <TableRow key={user._id} className="border-green-100/80 hover:bg-green-50/40">
                            <TableCell className="px-4 py-4 align-top">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-11 w-11 ring-2 ring-green-100">
                                  <AvatarFallback className="bg-gradient-to-br from-primary to-green-600 text-sm font-semibold text-white">
                                    {getInitials(user.fullName)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="space-y-1">
                                  <p className="font-semibold text-foreground">{user.fullName}</p>
                                  <p className="text-sm text-muted-foreground">{roleLabel}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="px-4 py-4 text-sm text-muted-foreground">
                              {user.email}
                            </TableCell>
                            <TableCell className="px-4 py-4">
                              <Badge
                                variant={roleBadgeVariants[roleLabel]}
                                className={roleBadgeClassNames[roleLabel]}
                              >
                                {roleLabel}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-4 py-4">
                              <Badge className={statusBadgeClassNames[statusLabel]}>
                                {statusLabel}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-4 py-4 text-sm text-muted-foreground">
                              {formatDate(user.createdAt)}
                            </TableCell>
                            <TableCell className="px-4 py-4 text-right">
                              {canUpdateStatus ? (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="rounded-full text-muted-foreground hover:bg-green-50 hover:text-primary"
                                      aria-label={`Tùy chọn cho ${user.fullName}`}
                                      disabled={isUpdatingStatus}
                                    >
                                      {isUpdatingStatus ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <MoreHorizontal className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => handleStatusChange(user)}
                                      variant={nextStatus === "inactive" ? "destructive" : "default"}
                                      disabled={isUpdatingStatus}
                                    >
                                      {nextStatus === "active" ? (
                                        <UserCheck className="h-4 w-4" />
                                      ) : (
                                        <UserX className="h-4 w-4" />
                                      )}
                                      {nextStatus === "active" ? "Kích hoạt" : "Tạm khóa"}
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              ) : (
                                <span className="text-sm text-muted-foreground">--</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={handleCreateDialogChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Thêm người dùng mới</DialogTitle>
            <DialogDescription>
              Tạo nhanh tài khoản vận hành với vai trò manager hoặc sales.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleCreateUserSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="admin-fullName">
                  Họ và tên <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="admin-fullName"
                    name="fullName"
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={createUserForm.fullName}
                    onChange={handleCreateUserFormChange}
                    className="pl-10"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="admin-email"
                    name="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={createUserForm.email}
                    onChange={handleCreateUserFormChange}
                    className="pl-10"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-phone">Số điện thoại</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="admin-phone"
                    name="phone"
                    type="tel"
                    placeholder="0xxx xxx xxx"
                    value={createUserForm.phone}
                    onChange={handleCreateUserFormChange}
                    className="pl-10"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-role">
                  Vai trò <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={createUserForm.role}
                  onValueChange={(value) => setCreateUserForm((previousForm) => ({ ...previousForm, role: value }))}
                  disabled={submitting}
                >
                  <SelectTrigger id="admin-role">
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="business manager">Business Manager</SelectItem>
                    <SelectItem value="content manager">Content Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-address">Địa chỉ nhà</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="admin-address"
                  name="address"
                  type="text"
                  placeholder="123 Đường ABC, Quận X, TP.HCM"
                  value={createUserForm.address}
                  onChange={handleCreateUserFormChange}
                  className="pl-10"
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="admin-password">
                  Mật khẩu <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="admin-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={createUserForm.password}
                    onChange={handleCreateUserFormChange}
                    className="pl-10 pr-10"
                    disabled={submitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((currentValue) => !currentValue)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                    tabIndex="-1"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">Tối thiểu 8 ký tự</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-confirmPassword">
                  Xác nhận mật khẩu <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="admin-confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={createUserForm.confirmPassword}
                    onChange={handleCreateUserFormChange}
                    className="pl-10 pr-10"
                    disabled={submitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((currentValue) => !currentValue)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                    tabIndex="-1"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleCreateDialogChange(false)}
                disabled={submitting}
              >
                Hủy
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-primary to-green-600" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Tạo người dùng
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export { AdminUsers };
