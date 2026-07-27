// useMarketplaceSearch.js - Quản lý trạng thái tìm kiếm và gợi ý sản phẩm
import { useEffect, useState } from "react";

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
