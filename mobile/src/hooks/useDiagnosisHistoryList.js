import { useCallback, useState } from "react";
import diagnosisService from "../services/diagnosisService";
import usePaginatedList from "./usePaginatedList";

export default function useDiagnosisHistoryList({ limit, enabled = true }) {
  const [kind, setKind] = useState("all");
  const fetchHistory = useCallback(
    (params) =>
      diagnosisService.history({
        ...params,
        result_kind: kind === "all" ? undefined : kind,
      }),
    [kind],
  );
  const history = usePaginatedList(fetchHistory, { limit, enabled });
  return { kind, setKind, history };
}
