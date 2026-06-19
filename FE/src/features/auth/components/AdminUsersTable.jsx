import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Loader2,
  MoreHorizontal,
  Trash2,
  UserCheck,
  UserX
} from "lucide-react";
import {
  formatDate,
  getInitials,
  mapRoleLabel,
  mapStatusLabel,
  roleBadgeClassNames,
  roleBadgeVariants,
  statusBadgeClassNames
} from "../hooks/adminUsers.utils";

function AdminUsersTable({
  filteredUsers,
  loading,
  error,
  statusUpdatingUserId,
  deleting,
  deleteTargetUser,
  onStatusChange,
  onDeleteClick
}) {
  return (
    <Card className="admin-users-table-card">
      <CardHeader className="admin-users-table-header">
        <div className="admin-users-table-header-content">
          <div className="admin-users-table-header-copy">
            <CardTitle className="text-xl text-foreground">Danh sách người dùng</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Dữ liệu đang được lấy trực tiếp từ hệ thống tài khoản hiện tại.
            </p>
          </div>
          <Badge className="admin-users-table-badge">
            {filteredUsers.length} tài khoản hiển thị
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {loading ? (
          <div className="admin-users-loading-state">
            Đang tải danh sách người dùng...
          </div>
        ) : error ? (
          <div className="admin-users-loading-state text-destructive">
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
                  <TableCell colSpan={6} className="admin-users-empty-state">
                    Không tìm thấy người dùng phù hợp.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => {
                  const roleLabel = mapRoleLabel(user.role);
                  const statusLabel = mapStatusLabel(user.status);
                  const canUpdateStatus = user.role !== "admin";
                  const isUpdatingStatus = statusUpdatingUserId === user._id;
                  const nextStatus = !user.status;

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
                                disabled={isUpdatingStatus || deleting}
                              >
                                {isUpdatingStatus || (deleting && deleteTargetUser?._id === user._id) ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <MoreHorizontal className="h-4 w-4" />
                                )}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => onStatusChange(user)}
                                variant={!nextStatus ? "destructive" : "default"}
                                disabled={isUpdatingStatus || deleting}
                              >
                                {nextStatus ? (
                                  <UserCheck className="h-4 w-4" />
                                ) : (
                                  <UserX className="h-4 w-4" />
                                )}

                                {nextStatus ? "Kích hoạt" : "Tạm khóa"}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => onDeleteClick(user)}
                                variant="destructive"
                                disabled={isUpdatingStatus || deleting}
                              >
                                <Trash2 className="h-4 w-4" />
                                Xóa người dùng
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
  );
}

export { AdminUsersTable };
