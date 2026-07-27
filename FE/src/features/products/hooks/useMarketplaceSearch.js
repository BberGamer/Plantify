// useMarketplaceSearch.js - Quản lý trạng thái tìm kiếm và gợi ý sản phẩm
import { useEffect, useState } from "react";

/** Debounce từ khóa marketplace và đưa phân trang về trang đầu khi tìm kiếm. @param {string} searchQuery - Từ khóa hiện tại. @param {Function} setPage - Setter phân trang. @returns {Object} Từ khóa đã debounce và handler submit. */
export function useMarketplaceSearch(searchQuery, setPage) {
  const [searchParam, setSearchParam] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchParam(searchQuery);
      setPage(1);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchQuery, setPage]);

  const submitSearch = (event) => {
    event?.preventDefault();
    setSearchParam(searchQuery);
    setPage(1);
  };

  return { searchParam, submitSearch };
}
