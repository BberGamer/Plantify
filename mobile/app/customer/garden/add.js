import { useLocalSearchParams } from "expo-router";
import useAddGardenPlant from "../../../src/hooks/useAddGardenPlant";
import GardenPlantForm from "../../../src/components/plants/GardenPlantForm";

export default function AddGardenPlantScreen() {
  const params = useLocalSearchParams();
  const value = (input) => (typeof input === "string" ? input : undefined);
  const plantId = value(params.plantId);
  const returnTo = value(params.returnTo);
  const diseaseId = value(params.diseaseId);
  const followUp = plantId && returnTo === "treatmentPreview" && diseaseId
    ? {
        pathname: "/customer/treatments/preview",
        params: {
          diseaseId,
          plantId,
          diagnosisId: value(params.diagnosisId),
          rank: value(params.rank),
          startDate: value(params.startDate),
        },
      }
    : plantId && returnTo === "careGenerate"
      ? {
          pathname: "/customer/care-generate",
          dismissToPreview: true,
          params: {
            plantId,
            diagnosisId: value(params.diagnosisId),
            rank: value(params.rank),
          },
        }
      : undefined;
  const form = useAddGardenPlant(plantId, undefined, followUp);
  return <GardenPlantForm form={form} />;
}
