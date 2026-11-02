// usePlantDetailScreen.js - Điều phối dữ liệu và các hành động màn chi tiết cây.
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { usePlantDetail } from "./usePlants";
import useScreenScope from "./useScreenScope";

export default function usePlantDetailScreen(id) {
  const detail = usePlantDetail(id);
  const router = useRouter();
  const { isActive } = useScreenScope(undefined, undefined, id);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    setSaved(false);
  }, [id]);
  const addToGarden = () => {
    if (!detail.plant || !isActive()) return;
    router.push({ pathname: "/customer/garden/add", params: { plantId: detail.plant._id } });
  };
  return {
    ...detail,
    saved,
    toggleSaved: () => setSaved((previous) => !previous),
    addToGarden,
  };
}
