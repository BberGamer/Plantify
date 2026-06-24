/**
 * useHomeSearch.js - Hook xử lý logic tìm kiếm trên Home
 * @returns {object} Search state và handlers
 */
import { useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { getCareGuides } from "@/features/care-guides/api";
import { getPlantDiseases } from "@/features/plant-diseases/api";

const DISEASE_KEYWORDS = [
  "bệnh", "lá", "đốm", "vàng", "héo", "thối", "sâu", "nấm", "rệp",
  "triệu chứng", "điều trị", "phòng ngừa"
];

const CARE_GUIDE_KEYWORDS = [
  "chăm sóc", "tưới", "cắt tỉa", "thay chậu", "nhân giống",
  "repot", "pruning", "watering", "propagation"
];

function extractItems(response, arrayKey) {
  const data = response?.data || response?.result || response;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.[arrayKey])) return data[arrayKey];
  return [];
}

function getPlantId(value) {
  if (!value) return null;
  if (typeof value === "string") return value;
  return value._id || value.id || null;
}

function matchesQuery(value, normalizedQuery) {
  return String(value || "").toLocaleLowerCase("vi").includes(normalizedQuery);
}

function detectSearchIntent(query) {
  const normalizedQuery = query.toLocaleLowerCase("vi");

  if (DISEASE_KEYWORDS.some((keyword) => normalizedQuery.includes(keyword))) {
    return "diseases";
  }

  if (CARE_GUIDE_KEYWORDS.some((keyword) => normalizedQuery.includes(keyword))) {
    return "care-guides";
  }

  return "browse";
}

export function useHomeSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const resolveDirectPlantMatch = useCallback(async (query, intent) => {
    const normalizedQuery = query.toLocaleLowerCase("vi");

    if (intent === "diseases") {
      const response = await getPlantDiseases({ page: 1, limit: 200 });
      const diseases = extractItems(response, "diseases");
      const matchedDiseases = diseases.filter((disease) => (
        matchesQuery(disease.name, normalizedQuery)
        || matchesQuery(disease.symptoms, normalizedQuery)
        || matchesQuery(disease.causes, normalizedQuery)
        || matchesQuery(disease.treatment, normalizedQuery)
        || matchesQuery(disease.prevention, normalizedQuery)
        || matchesQuery(disease.plantId?.name, normalizedQuery)
      ));
      const plantIds = [...new Set(
        matchedDiseases.map((disease) => getPlantId(disease.plantId)).filter(Boolean)
      )];
      return plantIds.length === 1 ? plantIds[0] : null;
    }

    if (intent === "care-guides") {
      const response = await getCareGuides({ page: 1, limit: 200 });
      const careGuides = extractItems(response, "careGuides");
      const matchedCareGuides = careGuides.filter((guide) => (
        matchesQuery(guide.watering, normalizedQuery)
        || matchesQuery(guide.pruning, normalizedQuery)
        || matchesQuery(guide.propagation, normalizedQuery)
        || matchesQuery(guide.repotting, normalizedQuery)
        || matchesQuery(guide.plantId?.name, normalizedQuery)
      ));
      const plantIds = [...new Set(
        matchedCareGuides.map((guide) => getPlantId(guide.plantId)).filter(Boolean)
      )];
      return plantIds.length === 1 ? plantIds[0] : null;
    }

    return null;
  }, []);

  const handleSearch = useCallback(async (e) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();

    if (!trimmedQuery) {
      navigate("/browse");
      return;
    }

    const intent = detectSearchIntent(trimmedQuery);

    if (intent === "browse") {
      navigate(`/browse?q=${encodeURIComponent(trimmedQuery)}`);
      return;
    }

    try {
      const plantId = await resolveDirectPlantMatch(trimmedQuery, intent);

      if (plantId) {
        navigate(`/plant/${plantId}?tab=${intent}`);
        return;
      }
    } catch (error) {
      console.error("Không thể resolve kết quả tìm kiếm trực tiếp:", error);
    }

    navigate(`/browse?q=${encodeURIComponent(trimmedQuery)}`);
  }, [searchQuery, navigate, resolveDirectPlantMatch]);

  return {
    searchQuery,
    setSearchQuery,
    handleSearch,
  };
}
