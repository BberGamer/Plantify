import { useLocalSearchParams } from "expo-router";
import useAddGardenPlant from "../../../src/hooks/useAddGardenPlant";
import GardenPlantForm from "../../../src/components/plants/GardenPlantForm";

export default function AddGardenPlantScreen() {
  const params = useLocalSearchParams();
  const plantId = typeof params.plantId === "string" ? params.plantId : undefined;
  const form = useAddGardenPlant(plantId);
  return <GardenPlantForm form={form} />;
}
