// DiagnosisHistoryList.jsx - Hiển thị các lần chẩn đoán gần nhất của user hiện tại
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { History, Loader2, RefreshCw, Trash2 } from "lucide-react";

const DEFAULT_IMAGE = "/default-plant.svg";
const MATCH_STATUS_LABELS = {
  matched: "Đã đối chiếu",
  unmatched: "Chưa khớp",
  needs_review: "Cần xem xét",
  low_confidence: "Độ tin cậy thấp",
  unknown: "Chưa xác định",
};

function getDiseaseName(history) {
  return history.diagnosis?.diseaseId?.name
    || history.diagnosis?.rawDiseaseName
    || "Chưa xác định";
}

function formatConfidence(confidence) {
  const value = Number(confidence);
  return Number.isFinite(value) ? `${(value * 100).toFixed(1)}%` : "—";
}

function formatDiagnosisTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Không rõ thời gian";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

/** Hiển thị lịch sử chẩn đoán và cho phép chọn lại một kết quả. @param {Object} props - Component props. @returns {JSX.Element} Danh sách lịch sử chẩn đoán. */
export function DiagnosisHistoryList({
  enabled,
  authLoading,
  histories,
  selectedHistoryId,
  loading,
  error,
  onSelect,
  onRetry,
  onDelete,
  deletingHistoryId = "",
}) {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const deleteTriggerRef = useRef(null);
  const refreshButtonRef = useRef(null);

  const confirmDelete = async (event) => {
    event.preventDefault();
    if (!deleteTarget || !onDelete || deletingHistoryId) return;

    try {
      await onDelete(deleteTarget._id);
      toast.success("Đã xóa lịch sử chẩn đoán.");
      setDeleteTarget(null);
    } catch (deleteError) {
      toast.error(
        deleteError.response?.data?.message
          || deleteError.message
          || "Không thể xóa lịch sử chẩn đoán."
      );
    }
  };

  return (
    <section className="space-y-3" aria-labelledby="diagnosis-history-title">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2
            id="diagnosis-history-title"
            className="flex items-center gap-2 text-lg font-semibold"
          >
            <History className="h-5 w-5 text-primary" />
            Lịch sử chẩn đoán gần đây
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Chọn một kết quả để xem lại mà không gọi AI lần nữa.
          </p>
        </div>
        {enabled && !loading ? (
          <Button
            ref={refreshButtonRef}
            type="button"
            size="icon"
            variant="ghost"
            onClick={onRetry}
            aria-label="Tải lại lịch sử chẩn đoán"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        ) : null}
      </div>

      {authLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center gap-2 p-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang kiểm tra phiên đăng nhập...
          </CardContent>
        </Card>
      ) : null}

      {!authLoading && !enabled ? (
        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">
            Đăng nhập để xem lịch sử chẩn đoán của bạn.
          </CardContent>
        </Card>
      ) : null}

      {!authLoading && enabled && loading ? (
        <Card>
          <CardContent className="flex items-center justify-center gap-2 p-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang tải lịch sử...
          </CardContent>
        </Card>
      ) : null}

      {!authLoading && enabled && !loading && error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="space-y-3 p-4">
            <p className="text-sm text-red-700">{error}</p>
            <Button type="button" size="sm" variant="outline" onClick={onRetry}>
              Thử lại
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {!authLoading && enabled && !loading && !error && histories.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            Bạn chưa có lịch sử chẩn đoán.
          </CardContent>
        </Card>
      ) : null}

      {!authLoading && enabled && !loading && !error && histories.length > 0 ? (
        <div className="max-h-[28rem] space-y-2 overflow-y-auto pr-1">
          {histories.map((history) => {
            const isSelected = history._id === selectedHistoryId;
            const matchStatus = history.diagnosis?.matchStatus;

            return (
              <div
                key={history._id}
                className={`flex w-full items-center rounded-xl border transition-colors ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border bg-white hover:border-primary/40 hover:bg-muted/30"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelect(history._id)}
                  aria-current={isSelected ? "true" : undefined}
                  className="flex min-w-0 flex-1 items-center gap-3 rounded-l-xl p-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <img
                    src={history.image?.url || DEFAULT_IMAGE}
                    alt=""
                    className="h-16 w-16 flex-shrink-0 rounded-lg bg-muted object-cover"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">
                      {getDiseaseName(history)}
                    </span>
                    <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                      <span>{MATCH_STATUS_LABELS[matchStatus] || "Chưa xác định"}</span>
                      <span>•</span>
                      <span>{formatConfidence(history.diagnosis?.confidence)}</span>
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {formatDiagnosisTime(history.createdAt)}
                    </span>
                  </span>
                </button>
                {onDelete ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="mr-2 h-11 w-11 shrink-0 px-0 text-destructive hover:bg-destructive/10 hover:text-destructive sm:h-8 sm:w-auto sm:px-2"
                    disabled={Boolean(deletingHistoryId)}
                    onClick={(event) => {
                      deleteTriggerRef.current = event.currentTarget;
                      setDeleteTarget(history);
                    }}
                    aria-label={`Xóa lịch sử chẩn đoán ${getDiseaseName(history)}`}
                  >
                    {deletingHistoryId === history._id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 sm:mr-1" />
                    )}
                    <span className="hidden sm:inline">
                      {deletingHistoryId === history._id ? "Đang xóa..." : "Xóa"}
                    </span>
                  </Button>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && !deletingHistoryId) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            const deleteTrigger = deleteTriggerRef.current;
            if (deleteTrigger?.isConnected) {
              deleteTrigger.focus();
            } else {
              refreshButtonRef.current?.focus();
            }
            deleteTriggerRef.current = null;
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa lịch sử chẩn đoán?</AlertDialogTitle>
            <AlertDialogDescription>
              Kết quả “{deleteTarget ? getDiseaseName(deleteTarget) : ""}” và ảnh
              chẩn đoán liên quan sẽ bị xóa vĩnh viễn. Hành động này không thể
              hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={Boolean(deletingHistoryId)}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={Boolean(deletingHistoryId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingHistoryId ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                "Xóa lịch sử"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
