// useDiagnosisHistory.js - Quản lý danh sách và chi tiết DiagnosisHistory từ backend
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getMyDiagnosisHistories,
  getMyDiagnosisHistoryById,
} from "../api";
import { mapHistoryToDiagnosisResult } from "../diagnosisHistory.utils";

/** Lấy thông báo lỗi từ response hoặc dùng fallback. @param {Object} error - Lỗi request. @param {string} fallback - Thông báo dự phòng. @returns {string} Thông báo lỗi. */
function getErrorMessage(error, fallback) {
  return error.response?.data?.message || error.message || fallback;
}

/**
 * Tải lịch sử chẩn đoán theo user, cây liên kết và phân trang.
 * @param {Object} options - Bộ lọc lịch sử.
 * @param {boolean} options.enabled - Có cho phép tải dữ liệu không.
 * @param {string} [options.historyId] - ID lịch sử cần mở.
 * @param {string} [options.userPlantId=""] - ID cây cần lọc.
 * @param {number} [options.limit=8] - Số lịch sử mỗi lần tải.
 * @returns {Object} Danh sách, phân trang và trạng thái request.
 */
export function useDiagnosisHistory({
  enabled,
  historyId,
  userPlantId = "",
  limit = 8,
}) {
  const [histories, setHistories] = useState([]);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [listLoading, setListLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [listError, setListError] = useState("");
  const [detailError, setDetailError] = useState("");
  const [listRefreshKey, setListRefreshKey] = useState(0);
  const [detailRefreshKey, setDetailRefreshKey] = useState(0);

  const refreshHistories = useCallback(() => {
    setListRefreshKey((currentKey) => currentKey + 1);
  }, []);

  const refreshSelectedHistory = useCallback(() => {
    setDetailRefreshKey((currentKey) => currentKey + 1);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setHistories([]);
      setListLoading(false);
      setListError("");
      return;
    }

    const controller = new AbortController();
    let cancelled = false;

    async function loadHistories() {
      setListLoading(true);
      setListError("");

      try {
        const data = await getMyDiagnosisHistories(
          { page: 1, limit, ...(userPlantId ? { userPlantId } : {}) },
          controller.signal
        );
        if (!cancelled) {
          setHistories(data?.histories || []);
        }
      } catch (error) {
        if (!cancelled && error.code !== "ERR_CANCELED") {
          setListError(getErrorMessage(
            error,
            "Không thể tải lịch sử chẩn đoán."
          ));
        }
      } finally {
        if (!cancelled) setListLoading(false);
      }
    }

    loadHistories();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [enabled, limit, listRefreshKey, userPlantId]);

  useEffect(() => {
    if (!enabled || !historyId) {
      setSelectedHistory(null);
      setDetailLoading(false);
      setDetailError("");
      return;
    }

    const controller = new AbortController();
    let cancelled = false;

    async function loadHistoryDetail() {
      setDetailLoading(true);
      setDetailError("");
      setSelectedHistory(null);

      try {
        const history = await getMyDiagnosisHistoryById(
          historyId,
          controller.signal
        );
        if (!cancelled) setSelectedHistory(history);
      } catch (error) {
        if (!cancelled && error.code !== "ERR_CANCELED") {
          setDetailError(getErrorMessage(
            error,
            "Không thể tải kết quả chẩn đoán đã chọn."
          ));
        }
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    }

    loadHistoryDetail();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [detailRefreshKey, enabled, historyId]);

  const selectedResult = useMemo(
    () => mapHistoryToDiagnosisResult(selectedHistory),
    [selectedHistory]
  );

  return {
    histories,
    selectedHistory,
    selectedResult,
    listLoading,
    detailLoading,
    listError,
    detailError,
    refreshHistories,
    refreshSelectedHistory,
  };
}
