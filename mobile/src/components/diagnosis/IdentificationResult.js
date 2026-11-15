import { Image, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { useRouter } from "expo-router";
import { colors } from "../../theme/colors";

export default function IdentificationResult({ photo, result, onBack, onRetake, onImageError }) {
  const router = useRouter();
  const prediction = result.status === "identified" ? result.prediction : null;
  return <View style={styles.card}>
    <Image source={{ uri: photo.uri }} style={styles.image} resizeMode="contain" onError={onImageError} accessibilityLabel="Ảnh cây đã phân tích" />
    <View style={styles.content}>
      <Text variant="headlineSmall">{prediction ? prediction.plant_name : result.status === "uncertain" ? "Chưa đủ chắc chắn" : "Chưa nhận diện được"}</Text>
      <Text>{prediction ? "Tên cây gợi ý từ mô hình. Hãy đối chiếu với hình dáng thực tế của cây." : "Chưa thể gợi ý tên cây đáng tin cậy. Hãy chọn ảnh lá rõ nét, đủ sáng và thử thêm góc chụp khác."}</Text>
      {result.reason === "poor_image_quality" && <Text>Ảnh quá nhỏ, quá tối/sáng hoặc thiếu chi tiết. Vui lòng chụp lại.</Text>}
      {prediction && <Text>Điểm mô hình: {(prediction.confidence * 100).toFixed(1)}%. Điểm này chưa phải xác suất nhận diện đúng.</Text>}
      <Text>Chỉ hỗ trợ các cây trong bộ 78 nhãn cây/bệnh đã huấn luyện. Ảnh cây ngoài bộ hỗ trợ hoặc ảnh không phải cây vẫn có thể bị nhận nhầm.</Text>
      {prediction?.plant_id ? <Button mode="contained" onPress={() => router.push({ pathname: "/plants/PlantList", params: { id: prediction.plant_id } })}>Xem thông tin cây</Button> : prediction && <Text>Chưa có thông tin cây tương ứng trong danh mục.</Text>}
      <Button mode="outlined" onPress={onBack}>Xem lại ảnh</Button>
      <Button mode="contained" onPress={onRetake}>Nhận diện ảnh khác</Button>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: 24, overflow: "hidden" },
  image: { width: "100%", aspectRatio: 1, backgroundColor: "#10231D" },
  content: { padding: 18, gap: 14 },
});
