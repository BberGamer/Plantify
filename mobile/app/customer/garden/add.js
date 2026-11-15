import { useLocalSearchParams } from "expo-router";
import useAddGardenPlant from "../../../src/hooks/useAddGardenPlant";
import GardenPlantForm from "../../../src/components/plants/GardenPlantForm";

export default function AddGardenPlantScreen() {
  const params = useLocalSearchParams();
  const value = (input) => (typeof input === "string" ? input : undefined);
  const plantId = value(params.plantId);
  const treatmentReturn =
    value(params.returnTo) === "treatmentPreview" &&
    value(params.diseaseId) &&
    plantId
      ? {
          diseaseId: value(params.diseaseId),
          plantId,
          diagnosisId: value(params.diagnosisId),
          startDate: value(params.startDate),
        }
      : undefined;
  const form = useAddGardenPlant(plantId, undefined, treatmentReturn);
  return <GardenPlantForm form={form} />;
}
