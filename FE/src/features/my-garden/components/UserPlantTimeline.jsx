import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Droplets,
  FlaskConical,
  Leaf,
  Loader2,
  Stethoscope,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUserPlantTimeline } from "../api";
import {
  getApiErrorMessage,
  handleUserPlantImageError,
} from "../myGarden.utils";

const TYPE_DETAILS = {
  watering: { label: "Tưới cây", Icon: Droplets },
  fertilizing: { label: "Bón phân", Icon: FlaskConical },
  diagnosis: { label: "Chẩn đoán", Icon: Stethoscope },
  image: { label: "Ảnh album", Icon: Camera },
  pruning: { label: "Cắt tỉa", Icon: Leaf },
  repotting: { label: "Thay chậu", Icon: Leaf },
  treatment: { label: "Điều trị", Icon: Leaf },
  observation: { label: "Quan sát", Icon: Leaf },
};

function TimelineEvent({ event, userPlantId }) {
  const detail = TYPE_DETAILS[event.type] || {
    label: event.type,
    Icon: Leaf,
  };
  const Icon = detail.Icon;
  return (
    <li className="relative pl-9">
      <span className="absolute left-0 top-0 flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <div className="rounded-lg border p-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <p className="font-medium">{detail.label}</p>
          <time className="text-xs text-muted-foreground">
            {new Date(event.occurredAt).toLocaleString("vi-VN")}
          </time>
        </div>
        {event.notes ? (
          <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
            {event.notes}
          </p>
        ) : null}
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.type === "diagnosis" ? "Ảnh chẩn đoán" : "Ảnh cây"}
            onError={handleUserPlantImageError}
            className="mt-3 max-h-56 w-full rounded-lg border object-cover"
          />
        ) : null}
        {event.diagnosis ? (
          <div className="mt-3 rounded-md bg-muted/50 p-3 text-sm">
            <p className="font-medium">{event.diagnosis.diseaseName}</p>
            <p className="text-muted-foreground">
              Trạng thái: {event.diagnosis.matchStatus} • Độ tin cậy:{" "}
              {Math.round(event.diagnosis.confidence * 100)}%
            </p>
            <Button asChild variant="link" className="h-auto px-0 py-1">
              <Link
                to={`/ai-doctor?userPlantId=${encodeURIComponent(
                  userPlantId
                )}&historyId=${encodeURIComponent(
                  event.diagnosis.historyId
                )}`}
              >
                Xem kết quả chẩn đoán
              </Link>
            </Button>
          </div>
        ) : null}
      </div>
    </li>
  );
}

export function UserPlantTimeline({ userPlantId }) {
  const [page, setPage] = useState(1);
  const [timeline, setTimeline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setPage(1);
  }, [userPlantId]);

  useEffect(() => {
    if (!userPlantId) return undefined;
    const controller = new AbortController();
    let cancelled = false;
    setLoading(true);
    setError("");
    getUserPlantTimeline(userPlantId, {
      page,
      limit: 10,
      signal: controller.signal,
    })
      .then((response) => {
        if (!cancelled) setTimeline(response.data);
      })
      .catch((requestError) => {
        if (!cancelled && requestError.code !== "ERR_CANCELED") {
          setError(getApiErrorMessage(
            requestError,
            "Không thể tải timeline của cây."
          ));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [page, userPlantId]);

  return (
    <section className="space-y-3 rounded-xl border p-4">
      <h3 className="font-semibold">Timeline</h3>
      {loading ? (
        <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Đang tải timeline...
        </div>
      ) : error ? (
        <p className="py-4 text-sm text-destructive">{error}</p>
      ) : timeline?.events?.length ? (
        <>
          <ol className="space-y-3 border-l pl-3">
            {timeline.events.map((event) => (
              <TimelineEvent
                key={event._id}
                event={event}
                userPlantId={userPlantId}
              />
            ))}
          </ol>
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={timeline.currentPage <= 1}
              onClick={() => setPage((current) => current - 1)}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Trước
            </Button>
            <span className="text-xs text-muted-foreground">
              Trang {timeline.currentPage}/{timeline.pages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={timeline.currentPage >= timeline.pages}
              onClick={() => setPage((current) => current + 1)}
            >
              Sau
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </>
      ) : (
        <p className="py-4 text-sm text-muted-foreground">
          Chưa có hoạt động nào trong timeline.
        </p>
      )}
    </section>
  );
}
