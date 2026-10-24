import { useCallback, useRef, useState } from "react";
import diseaseService from "../services/diseaseService";
import getErrorMessage from "../utils/getErrorMessage";
import useScreenScope from "./useScreenScope";

export default function usePlantDiseases(plantId) {
  const [result, setResult] = useState({ plantId: null, diseases: [], loading: true, error: "" });
  const request = useRef(0);
  const { capture, isActive } = useScreenScope(() => retry(), undefined, plantId);

  const retry = useCallback(async () => {
    if (!isActive()) return;
    const requestId = ++request.current;
    const inScope = capture();
    const isCurrent = () => inScope() && requestId === request.current;
    if (!plantId) {
      setResult({ plantId, diseases: [], loading: false, error: "" });
      return;
    }
    setResult({ plantId, diseases: [], loading: true, error: "" });
    try {
      const diseases = [];
      let page = 1;
      let totalPages = 1;
      do {
        const response = await diseaseService.getDiseases({ plantId, page, limit: 100 });
        if (!isCurrent()) return;
        const data = response?.data;
        if (!response?.success || !Array.isArray(data?.diseases) ||
          !Number.isInteger(data.totalPages) || data.totalPages < 0) {
          throw new Error("Dữ liệu bệnh cây không hợp lệ.");
        }
        // Server quyết định quyền truy cập; lọc thêm để UI chỉ hiển thị trạng thái công khai.
        diseases.push(...data.diseases.filter((disease) => disease.status === "active"));
        totalPages = data.totalPages;
        page += 1;
      } while (page <= totalPages);
      if (isCurrent()) setResult({ plantId, diseases, loading: false, error: "" });
    } catch (error) {
      if (isCurrent()) {
        setResult({ plantId, diseases: [], loading: false,
          error: getErrorMessage(error, "Không tải được bệnh thường gặp của cây.") });
      }
    }
  }, [plantId, capture, isActive]);

  // Đổi cây phải ẩn dữ liệu cây cũ ngay cả trước khi effect mới chạy.
  return {
    diseases: result.plantId === plantId ? result.diseases : [],
    loading: result.plantId === plantId ? result.loading : Boolean(plantId),
    error: result.plantId === plantId ? result.error : "",
    retry,
  };
}
