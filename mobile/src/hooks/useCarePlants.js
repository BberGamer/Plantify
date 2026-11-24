import { useState } from "react";
import useScreenScope from "./useScreenScope";
import collectGardenPlants from "../services/collectGardenPlants";
import getErrorMessage from "../utils/getErrorMessage";

export default function useCarePlants() {
  const [plants, setPlants] = useState([]);
  const [plantLoading, setPlantLoading] = useState(true);
  const [plantError, setPlantError] = useState("");
  const scope = useScreenScope(loadPlants);
  async function loadPlants() {
    const current = scope.capture();
    setPlantLoading(true);
    setPlantError("");
    try {
      const items = await collectGardenPlants(50, current);
      if (current()) setPlants(items);
    } catch (e) {
      if (current())
        setPlantError(getErrorMessage(e, "Không tải được cây trong vườn."));
    } finally {
      if (current()) setPlantLoading(false);
    }
  }
  return { plants, plantLoading, plantError, loadPlants };
}
