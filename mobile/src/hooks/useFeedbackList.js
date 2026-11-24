import { useCallback, useState } from "react";
import useAuthStore from "../../store/authStore";
import usePaginatedList from "./usePaginatedList";
import { useFinanceSummary } from "./useFinance";
import feedbackService from "../services/feedbackService";

export const emptyFeedbackFilters = {
  type: "",
  status: "",
  email: "",
  from: "",
  to: "",
};

export default function useFeedbackList(manager) {
  const [filters, setFilters] = useState(emptyFeedbackFilters);
  const active = useAuthStore(
    (state) =>
      state.isAuthenticated &&
      state.user?.role === (manager ? "manager" : "customer"),
  );
  const finance = useFinanceSummary(active && !manager);
  const vip =
    finance?.isproaccount && new Date(finance.vip_expires_at) > new Date();
  const fetchPage = useCallback(
    (paging) =>
      feedbackService.list(
        {
          ...paging,
          ...Object.fromEntries(
            Object.entries(filters)
              .filter(([, value]) => value.trim())
              .map(([key, value]) => [key, value.trim()]),
          ),
        },
        manager,
      ),
    [filters, manager],
  );
  const list = usePaginatedList(fetchPage, { limit: 15, enabled: active });
  return { list, finance, vip, applyFilters: setFilters };
}
