// DiagnosisHistoryList.jsx - Hiển thị các lần chẩn đoán gần nhất của user hiện tại
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { History, Loader2, RefreshCw } from "lucide-react";

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

export function DiagnosisHistoryList({
  enabled,
  authLoading,
  histories,
  selectedHistoryId,
  loading,
  error,
  onSelect,
  onRetry,
}) {
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
              <button
                key={history._id}
                type="button"
                onClick={() => onSelect(history._id)}
                aria-current={isSelected ? "true" : undefined}
                className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border bg-white hover:border-primary/40 hover:bg-muted/30"
                }`}
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
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
