/**
 * useHomeSearch.js - Hook xử lý logic tìm kiếm trên Home
 * @returns {object} Search state và handlers
 */
import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router";
import { getPlants } from "@/features/plants/api";

function mapSuggestion(plant) {
  const difficultyLabel = { low: "Dễ", medium: "Trung bình", high: "Khó" };
  const levelLabel = { low: "Ít", medium: "Trung bình", high: "Nhiều" };

  return {
    id: plant._id || plant.id,
    name: plant.name || "",
    label: plant.name || "",
    scientificName: plant.scientificName || "",
    difficulty: difficultyLabel[plant.difficultyLevel] || plant.difficultyLevel,
    humidity: plant.humidity,
    light: levelLabel[plant.sunlight] || plant.sunlight,
    indoor: plant.isIndoor,
    imageUrl: plant.thumbnail || plant.images?.[0],
  };
}

export function useHomeSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const navigate = useNavigate();
  const trimmedQuery = searchQuery.trim();
  const shouldShowSuggestions = trimmedQuery.length > 0;

  useEffect(() => {
    if (!trimmedQuery) {
      setSuggestions([]);
      setLoadingSuggestions(false);
      return;
    }

    let cancelled = false;
    const timeoutId = window.setTimeout(async () => {
      setLoadingSuggestions(true);

      try {
        const response = await getPlants({ search: trimmedQuery, limit: 5 });

        if (cancelled) {
          return;
        }

        const nextSuggestions = (response.data?.plants || [])
          .map(mapSuggestion)
          .filter((item) => item.label);

        setSuggestions(nextSuggestions);
        setLoadingSuggestions(false);
      } catch {
        if (cancelled) {
          return;
        }

        setSuggestions([]);
        setLoadingSuggestions(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [trimmedQuery]);

  const navigateToBrowse = useCallback((query) => {
    const nextQuery = query.trim();

    if (!nextQuery) {
      navigate("/browse");
      return;
    }

    navigate(`/browse?q=${encodeURIComponent(nextQuery)}`);
  }, [navigate]);

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    navigateToBrowse(searchQuery);
  }, [navigateToBrowse, searchQuery]);

  const handleSelectSuggestion = useCallback((value) => {
    setSearchQuery(value);
    setSuggestions([]);
    navigateToBrowse(value);
  }, [navigateToBrowse]);

  return {
    searchQuery,
    setSearchQuery,
    handleSearch,
    suggestions,
    loadingSuggestions,
    shouldShowSuggestions,
    handleSelectSuggestion,
  };
}
