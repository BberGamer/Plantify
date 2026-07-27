// useBlogDetail.js - Quản lý trạng thái và vòng đời modal chi tiết bài viết trên trang chủ
import { useState, useEffect, useCallback } from "react";
import { usePostDetail } from "@/features/posts/hooks";

/** Quản lý bài viết đang chọn và trạng thái modal chi tiết tại trang chủ. @returns {Object} State và handler chi tiết blog. */
export function useBlogDetail() {
  const [selectedPostHome, setSelectedPostHome] = useState(null);
  const [showDetailHome, setShowDetailHome] = useState(false);

  const {
    post: detailPostHome,
    comments: detailCommentsHome,
    loading: detailLoadingHome,
    error: detailErrorHome,
  } = usePostDetail(
    showDetailHome ? selectedPostHome?._id || selectedPostHome?.id : null
  );

  const handleOpenPostHome = useCallback((post) => {
    setSelectedPostHome(post);
    setShowDetailHome(true);
  }, []);

  const handleClosePostHome = useCallback(() => {
    setShowDetailHome(false);
  }, []);

  useEffect(() => {
    if (!showDetailHome) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        handleClosePostHome();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showDetailHome, handleClosePostHome]);

  return {
    selectedPostHome,
    showDetailHome,
    detailPostHome,
    detailCommentsHome,
    detailLoadingHome,
    detailErrorHome,
    activePostHome: detailPostHome || selectedPostHome,
    activeCommentsHome: detailPostHome ? detailCommentsHome : selectedPostHome?.comments || [],
    handleOpenPostHome,
    handleClosePostHome,
  };
}
