import { useCallback, useState } from "react";
import gardenService from "../services/gardenService";
import useDebouncedValue from "./useDebouncedValue";
import usePaginatedList from "./usePaginatedList";

export default function useGarden() {
  const [search, setSearch] = useState("");
  const [healthStatus, setHealthStatus] = useState("all");
  const debounced = useDebouncedValue(search.trim());
  const fetchPage = useCallback(
    (params) => gardenService.getPlants({ ...params, search: debounced.value, healthStatus }),
    [debounced.value, healthStatus],
  );
  const list = usePaginatedList(fetchPage, { limit: 50, enabled: !debounced.pending });
  const changeSearch = (value) => {
    setSearch(value);
    list.invalidate();
    if (value.trim() === debounced.value && !debounced.pending) list.load(1);
  };
  const selectHealthStatus = (value) => {
    if (value === healthStatus) return;
    setHealthStatus(value);
    list.invalidate();
    debounced.flush();
  };
  return {
    plants: list.items,
    pagination: list.pagination,
    loading: list.loading,
    refreshing: list.refreshing,
    error: list.error,
    search,
    healthStatus,
    changeSearch,
    clearSearch: () => changeSearch(""),
    selectHealthStatus,
    refresh: list.refresh,
    retry: list.retry,
  };
}
