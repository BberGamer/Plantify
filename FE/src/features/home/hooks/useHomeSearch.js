/**
 * useHomeSearch.js - Hook xử lý logic tìm kiếm trên Home
 * @returns {object} Search state và handlers
 */
import { useState, useCallback } from "react";
import { useNavigate } from "react-router";

export function useHomeSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();

    if (!trimmedQuery) {
      navigate("/browse");
      return;
    }

    navigate(`/browse?q=${encodeURIComponent(trimmedQuery)}`);
  }, [searchQuery, navigate]);

  return {
    searchQuery,
    setSearchQuery,
    handleSearch,
  };
}
