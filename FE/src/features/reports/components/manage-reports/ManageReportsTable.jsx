// ManageReportsTable.jsx - Hiển thị bảng báo cáo và các thao tác xử lý
import { CheckCircle2, Loader2, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function ManageReportsTable({
  ACTION_LABELS,
  REASON_LABELS,
  StatusBadge,
  activeReports,
  activeStatus,
  formatDate,
  getDisplayName,
  getEntityId,
  getPostTitle,
  handleOpenPostDetail,
  handleProcessReport,
  handleRestorePost,
  processingId,
  restoringPostId,
}) {
  return (
<Table>
        <TableHeader>
          <TableRow className="border-green-100 bg-green-50/50 hover:bg-green-50/50">
            <TableHead className="px-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Bài viết
            </TableHead>
            <TableHead className="px-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Người báo cáo
            </TableHead>
            <TableHead className="px-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Lý do
            </TableHead>
            <TableHead className="px-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Trạng thái
            </TableHead>
            <TableHead className="px-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Thời gian
            </TableHead>
            <TableHead className="px-4 text-right text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Thao tác
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activeReports.map((report) => {
            const post = report.postId;
            const postId = getEntityId(post);
            const canRestore = activeStatus === "resolved" && Boolean(postId && post?.deletedAt);

            return (
              <TableRow key={report._id || report.id} className="border-green-100/80 hover:bg-green-50/30">
                <TableCell className="max-w-[320px] px-4 py-4 align-top">
                  <div className="min-w-0">
                    <button
                      type="button"
                      className="max-w-full truncate text-left font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
                      onClick={() => handleOpenPostDetail(post)}
                    >
                      {getPostTitle(post)}
                    </button>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {post?.category || "Chưa phân loại"}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4 align-top text-sm text-muted-foreground">
                  {getDisplayName(report.userId)}
                </TableCell>
                <TableCell className="px-4 py-4 align-top">
                  <Badge variant="outline">{REASON_LABELS[report.reason] || report.reason}</Badge>
                </TableCell>
                <TableCell className="px-4 py-4 align-top">
                  <div className="flex flex-col gap-2">
                    <StatusBadge status={report.status} />
                    {report.action && (
                      <span className="text-xs text-muted-foreground">
                        {ACTION_LABELS[report.action] || report.action}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4 align-top text-sm text-muted-foreground">
                  <div className="space-y-1">
                    <p>{formatDate(report.createdAt)}</p>
                    {report.processedAt && <p>XL: {formatDate(report.processedAt)}</p>}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4 text-right align-top">
                  {activeStatus === "pending" ? (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleProcessReport(report._id || report.id)}
                      disabled={processingId === (report._id || report.id)}
                    >
                      {processingId === (report._id || report.id) ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                      )}
                      Đánh dấu đã xử lý
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleRestorePost(postId)}
                      disabled={!canRestore || restoringPostId === postId}
                    >
                      {restoringPostId === postId ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <RotateCcw className="mr-2 h-4 w-4" />
                      )}
                      Khôi phục
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
  );
}

export { ManageReportsTable };
