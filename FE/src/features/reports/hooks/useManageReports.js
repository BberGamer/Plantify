import { useCallback, useEffect, useState } from "react";
import {
  getReports,
  processReport,
  restoreReportedPost,
} from "@/features/reports/api";

function normalizeReportsPayload(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.reports)) return payload.reports;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.reports)) return payload.data.reports;
  return [];
}

export function useManageReports(status) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [restoringPostId, setRestoringPostId] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getReports({ status, limit: 100 });
      setReports(normalizeReportsPayload(response.data));
    } catch (requestError) {
      setReports([]);
      setError(
        requestError.response?.data?.message
        || requestError.message
        || "Không thể tải danh sách report"
      );
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const resolveReport = useCallback(async (reportId) => {
    setProcessingId(reportId);
    try {
      const response = await processReport(reportId, "remove");
      await refetch();
      return response;
    } finally {
      setProcessingId(null);
    }
  }, [refetch]);

  const restorePost = useCallback(async (postId) => {
    setRestoringPostId(postId);
    try {
      const response = await restoreReportedPost(postId);
      await refetch();
      return response;
    } finally {
      setRestoringPostId(null);
    }
  }, [refetch]);

  return {
    reports,
    loading,
    error,
    processingId,
    restoringPostId,
    refetch,
    resolveReport,
    restorePost,
  };
}
