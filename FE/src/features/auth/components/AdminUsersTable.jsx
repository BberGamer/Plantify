import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
                          <div>
                            <p className="font-semibold text-foreground">{user.fullName}</p>
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
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-9 w-9 rounded-full border-green-200 text-green-700 hover:bg-green-50"
                              aria-label={nextStatus ? `Kích hoạt ${user.fullName}` : `Tạm khóa ${user.fullName}`}
                              title={nextStatus ? "Kích hoạt" : "Tạm khóa"}
                              onClick={() => onStatusChange(user)}
                              disabled={isUpdatingStatus || deleting}
                            >
                              {isUpdatingStatus ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : nextStatus ? (
                                <UserCheck className="h-4 w-4" />
                              ) : (
                                <UserX className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-9 w-9 rounded-full border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                              aria-label={`Xóa ${user.fullName}`}
                              title="Xóa người dùng"
                              onClick={() => onDeleteClick(user)}
                              disabled={isUpdatingStatus || deleting}
                            >
                              {deleting && deleteTargetUser?._id === user._id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
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
