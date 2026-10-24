// usePlantDirectory.js - Điều phối tìm kiếm và bộ lọc của danh mục cây.
import { useEffect, useState } from "react";
import { usePlantCategories, usePlants } from "./usePlants";

export default function usePlantDirectory() {
  const [inputValue, setInputValue] = useState("");
  const [search, setSearch] = useState("");
  const [activeCatId, setActiveCatId] = useState("");
  const list = usePlants(activeCatId, search);
  const categories = usePlantCategories();
  useEffect(() => {
    const timer = setTimeout(() => setSearch(inputValue.trim()), 500);
    return () => clearTimeout(timer);
  }, [inputValue]);
  const clearSearch = () => {
    setInputValue("");
    setSearch("");
  };
  return {
    ...list,
    loading: list.loading || inputValue.trim() !== search,
    categories: categories.categories,
    categoriesLoading: categories.loading,
    categoriesError: categories.error,
    retryCategories: categories.refetch,
    inputValue,
    activeCatId,
    changeSearch: setInputValue,
    clearSearch,
    selectCategory: setActiveCatId,
  };
}
