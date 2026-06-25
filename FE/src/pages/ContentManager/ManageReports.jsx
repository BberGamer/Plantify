// ManageReports.jsx - Trang xu ly report cho Content Manager
import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Flag, Inbox, Loader2, RefreshCcw, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import BlogPostDetail from "@/components/common/BlogPostDetail";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getReports, processReport, restoreReportedPost } from "@/features/reports/api";

const REPORT_STATUS_TABS = [
  { value: "pending", label: "Chờ xử lý" },
  { value: "resolved", label: "Đã xử lý" },
];

const REASON_LABELS = {
  spam: "Spam",
  sensitive: "Nội dung nhạy cảm",
  copyright: "Vi phạm bản quyền",
  inappropriate: "Không phù hợp",
  harassment: "Quấy rối",
  misinformation: "Sai thông tin",
  other: "Khác",
};

const ACTION_LABELS = {
  approve: "Giữ bài",
  reject: "Từ chối",
  remove: "Đã gỡ bài",
};

function normalizeReportsPayload(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.reports)) {
    return payload.reports;
  }

  if (Array.isArray(payload?.items)) {
    return payload.items;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
}

function getEntityId(entity) {
  if (!entity) {
    return "";
  }

  if (typeof entity === "string") {
    return entity;
  }

  return entity._id || entity.id || "";
}

function getDisplayName(user) {
  if (!user || typeof user === "string") {
    return "Người dùng";
  }

  return user.fullName || user.name || user.email || "Người dùng";
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getPostTitle(post) {
  if (!post || typeof post === "string") {
    return "Bài viết";
  }

  return post.title || "Bài viết";
}

function StatusBadge({ status }) {
  if (status === "resolved") {
    return (
      <Badge className="border-transparent bg-green-50 text-green-700 hover:bg-green-50">
        Đã xử lý
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
      Chờ xử lý
    </Badge>
  );
}

function ReportsEmptyState({ status }) {
  const isResolved = status === "resolved";

  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
        {isResolved ? <CheckCircle2 className="h-6 w-6" /> : <Flag className="h-6 w-6" />}
      </div>
      <h2 className="text-lg font-semibold">
        {isResolved ? "Chưa có report đã xử lý" : "Chưa có report cần xử lý"}
      </h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {isResolved
          ? "Các report đã xử lý sẽ xuất hiện tại đây để theo dõi và khôi phục khi cần."
          : "Danh sách report sẽ hiển thị tại đây khi có dữ liệu từ hệ thống."}
      </p>
      <div className="mt-6 flex items-center gap-2 rounded-md border border-dashed px-4 py-3 text-sm text-muted-foreground">
        <Inbox className="h-4 w-4" />
        <span>{isResolved ? "Chưa có dữ liệu đã xử lý" : "Đang chờ dữ liệu report"}</span>
      </div>
    </div>
  );
}

function ManageReports() {
  const [activeStatus, setActiveStatus] = useState("pending");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [restoringPostId, setRestoringPostId] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getReports({ status: activeStatus, limit: 100 });
      setReports(normalizeReportsPayload(response.data));
    } catch (err) {
      setReports([]);
      setError(err.response?.data?.message || err.message || "Không thể tải danh sách report");
    } finally {
      setLoading(false);
    }
  }, [activeStatus]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const activeReports = useMemo(
    () => reports.filter((report) => report.status === activeStatus),
    [reports, activeStatus]
  );

  async function handleProcessReport(reportId) {
    setProcessingId(reportId);

    try {
      await processReport(reportId, "remove");
      toast.success("Đã đánh dấu report là đã xử lý");
      await fetchReports();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Không thể xử lý report");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleRestorePost(postId) {
    setRestoringPostId(postId);

    try {
      await restoreReportedPost(postId);
      toast.success("Đã khôi phục bài viết");
      await fetchReports();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Không thể khôi phục bài viết");
    } finally {
      setRestoringPostId(null);
    }
  }

  function handleOpenPostDetail(post) {
    if (!post || typeof post === "string") {
      toast.error("Không tìm thấy dữ liệu bài viết");
      return;
    }

    setSelectedPost(post);
  }

  function renderReportsTable() {
    if (loading) {
      return (
        <div className="flex items-center justify-center gap-2 px-6 py-16 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Đang tải danh sách report...
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <p className="mb-4 text-sm text-destructive">{error}</p>
          <Button type="button" variant="outline" onClick={fetchReports}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Tải lại
          </Button>
        </div>
      );
    }

    if (!activeReports.length) {
      return <ReportsEmptyState status={activeStatus} />;
    }

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Xử lý report</h1>
          <p className="text-sm text-muted-foreground">
            Theo dõi và xử lý các nội dung được người dùng báo cáo.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={fetchReports} disabled={loading}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Làm mới
        </Button>
      </div>

      <Tabs value={activeStatus} onValueChange={setActiveStatus} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:w-fit">
          {REPORT_STATUS_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {REPORT_STATUS_TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-0">
            <Card className="overflow-hidden border border-border">
              <CardContent className="p-0">{renderReportsTable()}</CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {selectedPost && (
        <BlogPostDetail
          post={selectedPost}
          comments={selectedPost.comments || []}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </div>
  );
}

export { ManageReports };
