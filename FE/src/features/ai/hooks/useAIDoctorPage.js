// useAIDoctorPage.js - Quản lý trạng thái trang, lịch sử và thao tác AI Doctor
import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import { usePlantDiagnosis } from "@/features/ai/hooks/usePlantDiagnosis";
import { useAuth } from "@/features/auth/hooks";
import { useCartMutations } from "@/features/cart/hooks";
import { useDiagnosisHistory } from "@/features/diagnosis-history";

/**
 * Điều phối upload ảnh, chẩn đoán AI, lịch sử và thao tác thêm sản phẩm vào giỏ.
 * @returns {Object} State trang AI Doctor và các handler chẩn đoán/lịch sử.
 */
export function useAIDoctorPage() {
  const fileInputRef = useRef(null);
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentSearchParamsRef = useRef(searchParams);
  currentSearchParamsRef.current = searchParams;
  const { isAuthenticated, loading: authLoading } = useAuth();
  const historyId = searchParams.get("historyId") || "";
  const currentHistoryIdRef = useRef(historyId);
  currentHistoryIdRef.current = historyId;
  const userPlantId = searchParams.get("userPlantId") || "";
  const diagnosis = usePlantDiagnosis({ userPlantId });
  const diagnosisHistory = useDiagnosisHistory({
    enabled: !authLoading && isAuthenticated,
    historyId,
    userPlantId,
    limit: 8,
  });
  const { addItem } = useCartMutations();

  const updateHistoryId = (nextHistoryId) => {
    const nextSearchParams = new URLSearchParams(currentSearchParamsRef.current);
    if (nextHistoryId) {
      nextSearchParams.set("historyId", nextHistoryId);
    } else {
      nextSearchParams.delete("historyId");
    }
    setSearchParams(nextSearchParams);
  };

  const handleDiagnose = async () => {
    if (!isAuthenticated) {
      toast.warning("Vui lòng đăng nhập để sử dụng tính năng chẩn đoán AI.");
      navigate("/login", { state: { from: "/ai-doctor" } });
      return;
    }

    updateHistoryId("");
    const result = await diagnosis.diagnose();
    if (result?.diagnosisHistoryId) {
      updateHistoryId(result.diagnosisHistoryId);
      diagnosisHistory.refreshHistories();
    }
  };

  const clearFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSelectHistory = (selectedHistoryId) => {
    diagnosis.clear();
    clearFileInput();
    updateHistoryId(selectedHistoryId);
  };

  const handleNewDiagnosis = () => {
    diagnosis.clear();
    clearFileInput();
    updateHistoryId("");
  };

  const handleDeleteHistory = async (historyIdToDelete) => {
    const deletedHistory = await diagnosisHistory.deleteHistory(
      historyIdToDelete
    );
    if (
      isMountedRef.current
      && historyIdToDelete === currentHistoryIdRef.current
    ) {
      handleNewDiagnosis();
    }
    return deletedHistory;
  };

  const handleAddToCart = async (product) => {
    try {
      await addItem({
        productId: product._id,
        quantity: 1,
        selected: true,
      });
      toast.success(`Đã thêm ${product.name} vào giỏ hàng.`);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Không thể thêm sản phẩm vào giỏ hàng."
      );
    }
  };

  return {
    diagnosis,
    diagnosisHistory,
    displayedImageUrl: historyId
      ? diagnosisHistory.selectedHistory?.image?.url
      : diagnosis.previewUrl,
    displayedResult: historyId
      ? diagnosisHistory.selectedResult
      : diagnosis.result,
    fileInputRef,
    handleAddToCart,
    handleDiagnose,
    handleDeleteHistory,
    handleNewDiagnosis,
    handleSelectHistory,
    historyId,
    isAuthenticated,
    authLoading,
  };
}
