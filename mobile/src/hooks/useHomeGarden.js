import { useRef, useState } from "react";
import gardenService from "../services/gardenService";
import getErrorMessage from "../utils/getErrorMessage";
import useScreenScope from "./useScreenScope";

export default function useHomeGarden() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const request = useRef(0);
  const scope = useScreenScope(() => { setData(null); reload(); });

  async function reload() {
    const current = scope.capture();
    const version = ++request.current;
    setLoading(true);
    setError("");
    try {
      // Dùng tổng từ server thay vì đếm riêng trang xem trước (tối đa 6 cây).
      const [all, healthy] = await Promise.all([
        gardenService.getPlants({ limit: 6 }),
        gardenService.getPlants({ limit: 1, healthStatus: "healthy" }),
      ]);
      if (current() && version === request.current) {
        const total = all.data.pagination.total;
        const healthyCount = healthy.data.pagination.total;
        setData({ plants: all.data.items, total, healthy: healthyCount,
          treatment: Math.max(0, total - healthyCount),
          healthyRatio: total ? healthyCount / total : 0 });
      }
    } catch (failure) {
      if (current() && version === request.current)
        setError(getErrorMessage(failure, "Không tải được dữ liệu vườn cây."));
    } finally {
      if (current() && version === request.current) setLoading(false);
    }
  }

  return { data, loading, error, reload };
}
