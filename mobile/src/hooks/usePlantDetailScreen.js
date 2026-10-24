// usePlantDetailScreen.js - Điều phối dữ liệu và các hành động màn chi tiết cây.
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { usePlantDetail } from "./usePlants";

export default function usePlantDetailScreen(id) {
  const detail = usePlantDetail(id);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    setSaved(false);
  }, [id]);
  const addToGarden = () => {
    if (!detail.plant) return;
    Alert.alert(
      "Thêm vào vườn",
      `Bạn muốn thêm "${detail.plant.common_name}" vào vườn cây của mình?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Thêm",
          onPress: () =>
            Alert.alert("Thành công", "Cây đã được thêm vào vườn!"),
        },
      ],
    );
  };
  return {
    ...detail,
    saved,
    toggleSaved: () => setSaved((previous) => !previous),
    addToGarden,
  };
}
