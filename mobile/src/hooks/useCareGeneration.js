import { useCallback, useEffect, useRef, useState } from "react";
import careService from "../services/careService";
import getErrorMessage from "../utils/getErrorMessage";
import useCarePlants from "./useCarePlants";
import useScreenScope from "./useScreenScope";

export default function useCareGeneration(plantId, preferredId, generateOnOpen, {
  diagnosisId, candidateRank,
} = {}) {
  const garden = useCarePlants();
  const plants = garden.plants.filter((plant) => plant.plant_id === plantId);
  const [chosenId, setChosenId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const pending = useRef(false);
  const autoAttempt = useRef("");
  const { capture, isActive } = useScreenScope(
    () => setBusy(pending.current),
    undefined,
    `${plantId}:${preferredId}:${diagnosisId}:${candidateRank}`,
  );
  const eligible = plants.filter((plant) => !plant.active_treatment);
  const selectedId = [chosenId, preferredId].find((id) =>
    eligible.some((plant) => plant._id === id),
  ) || (eligible.length === 1 ? eligible[0]._id : "");

  function select(id) {
    if (pending.current) return;
    setChosenId(id);
    setError("");
    setResult(null);
  }

  const generate = useCallback(async () => {
    if (!selectedId || pending.current || !isActive()) return;
    const current = capture();
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      const response = await careService.generate(selectedId, { diagnosisId, candidateRank });
      const { date, created_count: count, schedules = [], sources = [], reference_kind, timing_source } =
        response?.data || {};
      if (!response?.success || !/^\d{4}-\d{2}-\d{2}$/.test(date || "") ||
          !Number.isInteger(count) || count < 0 || !Array.isArray(schedules) ||
          schedules.some((item) => !item?._id || typeof item.title !== "string" ||
            !/^\d{2}:\d{2}$/.test(item.time) || !Number.isInteger(item.repeat_every_days)) ||
          !Array.isArray(sources) || sources.some((source) =>
            typeof source?.title !== "string" || typeof source.url !== "string" ||
            !/^https:\/\/[^\s]+$/.test(source.url)))
        throw new Error("Dữ liệu lịch chăm sóc không hợp lệ.");
      if (current()) setResult({
        date, count, schedules, sources, referenceKind: reference_kind,
        timingSource: timing_source, plantId: selectedId,
      });
    } catch (failure) {
      if (current())
        setError(getErrorMessage(failure, "Không thể tạo lịch chăm sóc."));
    } finally {
      pending.current = false;
      if (isActive()) setBusy(false);
    }
  }, [candidateRank, capture, diagnosisId, isActive, selectedId]);

  useEffect(() => {
    if (!generateOnOpen || garden.plantLoading || garden.plantError || !selectedId ||
        (eligible.length !== 1 && selectedId !== preferredId) ||
        autoAttempt.current === selectedId || !isActive() || pending.current) return;
    autoAttempt.current = selectedId;
    void generate();
  }, [generateOnOpen, garden.plantLoading, garden.plantError, selectedId, eligible.length,
    preferredId, isActive, generate]);

  return {
    ...garden,
    plants,
    selectedId,
    select,
    generate,
    busy,
    error,
    result: result?.plantId === selectedId ? result : null,
  };
}
