import { useLocalSearchParams } from "expo-router";
import useAddGardenPlant from "../../../src/hooks/useAddGardenPlant";
import GardenPlantForm from "../../../src/components/plants/GardenPlantForm";

export default function EditGardenPlantScreen() {
  const params = useLocalSearchParams();
  const gardenPlantId = typeof params.plantId === "string" ? params.plantId : "";
  const form = useAddGardenPlant(undefined, gardenPlantId);
  return <GardenPlantForm form={form} />;
}
