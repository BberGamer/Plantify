// ManageReports.jsx - Trang xu ly report cho Content Manager
import { useMemo, useState } from "react";
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
import { useManageReports } from "@/features/reports/hooks";
import { ManageReportsTable } from "@/features/reports/components/manage-reports/ManageReportsTable";

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
  const [selectedPost, setSelectedPost] = useState(null);
  const {
    error,
    loading,
    processingId,
    refetch: fetchReports,
    reports,
    resolveReport,
    restorePost,
    restoringPostId,
  } = useManageReports(activeStatus);

  const activeReports = useMemo(
    () => reports.filter((report) => report.status === activeStatus),
    [reports, activeStatus]
  );

  async function handleProcessReport(reportId) {
    try {
      await resolveReport(reportId);
      toast.success("Đã đánh dấu report là đã xử lý");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Không thể xử lý report");
    }
  }

  async function handleRestorePost(postId) {
    try {
      await restorePost(postId);
      toast.success("Đã khôi phục bài viết");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Không thể khôi phục bài viết");
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
      <ManageReportsTable ACTION_LABELS={ACTION_LABELS} REASON_LABELS={REASON_LABELS} StatusBadge={StatusBadge} activeReports={activeReports} activeStatus={activeStatus} formatDate={formatDate} getDisplayName={getDisplayName} getEntityId={getEntityId} getPostTitle={getPostTitle} handleOpenPostDetail={handleOpenPostDetail} handleProcessReport={handleProcessReport} handleRestorePost={handleRestorePost} processingId={processingId} restoringPostId={restoringPostId} />
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
