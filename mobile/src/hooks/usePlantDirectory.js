// usePlantDirectory.js - Điều phối tìm kiếm và bộ lọc của danh mục cây.
import { useState } from "react";
import { usePlantCategories, usePlants } from "./usePlants";
import useDebouncedValue from "./useDebouncedValue";

export default function usePlantDirectory() {
  const [inputValue, setInputValue] = useState("");
  const debounced = useDebouncedValue(inputValue.trim());
  const [activeCatId, setActiveCatId] = useState("");
  const list = usePlants(activeCatId, debounced.value, !debounced.pending);
  const categories = usePlantCategories();
  const clearSearch = () => {
    list.invalidate();
    setInputValue("");
    debounced.flush("");
    if (debounced.value === "" && !debounced.pending) list.changePage(1);
  };
  const changeSearch = (value) => {
    setInputValue(value);
    list.invalidate();
    if (value.trim() === debounced.value && !debounced.pending) list.changePage(1);
  };
  const selectCategory = (id) => {
    if (id === activeCatId && !debounced.pending) return;
    list.invalidate();
    debounced.flush();
    setActiveCatId(id);
  };
  return {
    plants: list.plants,
    total: list.total,
    pagination: list.pagination,
    refreshing: list.refreshing,
    error: list.error,
    refetch: list.refetch,
    refresh: list.refresh,
    changePage: list.changePage,
    loading: list.loading || debounced.pending,
    categories: [{ _id: "", category_name: "Tất cả" }, ...categories.categories],
    categoriesLoading: categories.loading,
    categoriesError: categories.error,
    retryCategories: categories.refetch,
    inputValue,
    activeCatId,
    changeSearch,
    clearSearch,
    selectCategory,
  };
}
