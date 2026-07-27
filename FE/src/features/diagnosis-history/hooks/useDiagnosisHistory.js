// useDiagnosisHistory.js - Quản lý danh sách và chi tiết DiagnosisHistory từ backend
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getMyDiagnosisHistories,
  getMyDiagnosisHistoryById,
} from "../api";
import { mapHistoryToDiagnosisResult } from "../diagnosisHistory.utils";

function getErrorMessage(error, fallback) {
  return error.response?.data?.message || error.message || fallback;
}

export function useDiagnosisHistory({
  enabled,
  historyId,
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
          { page: 1, limit },
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
  }, [enabled, limit, listRefreshKey]);

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
