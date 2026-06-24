/**
 * useBlogDetail.js - Hook quản lý modal chi tiết blog trên Home
 * @returns {object} Blog detail state và handlers
 */
import { useState, useEffect, useCallback } from "react";
import { usePostDetail } from "@/features/posts/hooks";

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
