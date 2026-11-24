import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as DocumentPicker from "expo-document-picker";
import useAuthStore from "../../store/authStore";
import diseaseService from "../services/diseaseService";
import plantService from "../services/plantService";
import treatmentService from "../services/treatmentService";
import getErrorMessage from "../utils/getErrorMessage";

const collectPages = async (fetchPage) => {
  const items = [];
  let page = 1;
  let totalPages = 1;
  do {
    const response = await fetchPage(page);
    const pageItems = response?.data?.items;
    if (response?.success !== true || !Array.isArray(pageItems))
      throw new Error("Dữ liệu phân trang không hợp lệ.");
    items.push(...pageItems);
    totalPages =
      response.data.pagination?.totalPages ?? response.data.totalPages;
    if (!Number.isSafeInteger(totalPages) || totalPages < 0)
      throw new Error("Dữ liệu phân trang không hợp lệ.");
    page += 1;
  } while (page <= totalPages);
  return items;
};

export default function useManagerProtocolGenerator() {
  const sessionVersion = useAuthStore((state) => state.sessionVersion);
  const [diseases, setDiseases] = useState([]);
  const [plants, setPlants] = useState([]);
  const [diseaseId, setDiseaseId] = useState("");
  const [plantIds, setPlantIds] = useState([]);
  const [document, setDocument] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const request = useRef(0);
  const mutation = useRef(false);

  const load = useCallback(async () => {
    const requestId = ++request.current;
    setLoading(true);
    setError("");
    try {
      const [diseaseItems, plantItems] = await Promise.all([
        collectPages((page) =>
          diseaseService.getManagerDiseases({ page, limit: 100 }),
        ),
        collectPages((page) =>
          plantService.getManagerPlants({ page, limit: 100 }),
        ),
      ]);
      if (requestId !== request.current) return;
      setDiseases(diseaseItems);
      setPlants(plantItems);
    } catch (failure) {
      if (requestId === request.current)
        setError(
          getErrorMessage(failure, "Không thể tải danh mục cây và bệnh."),
        );
    } finally {
      if (requestId === request.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    return () => {
      request.current += 1;
    };
  }, [load, sessionVersion]);

  const eligiblePlants = useMemo(() => {
    const disease = diseases.find((item) => item._id === diseaseId);
    const linkedIds = new Set(
      (disease?.plant_ids || disease?.plants || []).map(
        (item) => item._id || item,
      ),
    );
    return linkedIds.size
      ? plants.filter((plant) => linkedIds.has(plant._id))
      : [];
  }, [diseaseId, diseases, plants]);

  const selectDisease = (value) => {
    if (mutation.current) return;
    setDiseaseId(value);
    setPlantIds([]);
    setResult(null);
    setError("");
  };

  const togglePlant = (id) => {
    if (mutation.current) return;
    setPlantIds((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );
    setResult(null);
    setError("");
  };

  const chooseDocument = async () => {
    if (mutation.current) return;
    try {
      const picked = await DocumentPicker.getDocumentAsync({
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        copyToCacheDirectory: true,
        multiple: false,
      });
      const asset = !picked.canceled ? picked.assets?.[0] : null;
      if (!asset) return;
      if (!asset.name?.toLowerCase().endsWith(".docx"))
        return setError("Tài liệu phải là file DOCX.");
      if ((asset.size || 0) > 10 * 1024 * 1024)
        return setError("File DOCX không được vượt quá 10 MB.");
      setDocument(asset);
      setResult(null);
      setError("");
    } catch (failure) {
      setError(getErrorMessage(failure, "Không thể chọn file DOCX."));
    }
  };

  const generate = async () => {
    if (mutation.current) return;
    if (!diseaseId || !plantIds.length || !document) {
      setError("Hãy chọn bệnh, ít nhất một cây áp dụng và một file DOCX.");
      return;
    }
    mutation.current = true;
    setGenerating(true);
    setResult(null);
    setError("");
    try {
      const response = await treatmentService.generateAiDraft({
        disease_id: diseaseId,
        plant_ids: plantIds,
        document,
      });
      if (response?.success !== true || !response.data?._id)
        throw new Error("Dữ liệu phác đồ không hợp lệ.");
      setResult(response.data);
    } catch (failure) {
      setError(
        getErrorMessage(failure, "Không thể tạo phác đồ từ tài liệu DOCX."),
      );
    } finally {
      mutation.current = false;
      setGenerating(false);
    }
  };

  const reset = () => {
    if (mutation.current) return;
    setDiseaseId("");
    setPlantIds([]);
    setDocument(null);
    setResult(null);
    setError("");
  };

  return {
    diseases,
    eligiblePlants,
    diseaseId,
    plantIds,
    document,
    result,
    loading,
    generating,
    error,
    retry: load,
    selectDisease,
    togglePlant,
    chooseDocument,
    generate,
    reset,
  };
}
