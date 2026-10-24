// usePlantDetailScreen.js - Điều phối dữ liệu và các hành động màn chi tiết cây.
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { usePlantDetail } from "./usePlants";
import useScreenScope from "./useScreenScope";

export default function usePlantDetailScreen(id) {
  const detail = usePlantDetail(id);
  const { capture, isActive } = useScreenScope(undefined, undefined, id);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    setSaved(false);
  }, [id]);
  const addToGarden = () => {
    if (!detail.plant || !isActive()) return;
    const isCurrent = capture();
    Alert.alert(
      "Thêm vào vườn",
      `Bạn muốn thêm "${detail.plant.common_name}" vào vườn cây của mình?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Thêm",
          onPress: () => {
            if (isCurrent()) Alert.alert("Chưa hỗ trợ", "Tính năng lưu cây vào vườn chưa được kết nối.");
          },
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
