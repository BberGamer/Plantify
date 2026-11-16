import { Image, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { useRouter } from "expo-router";
import { colors } from "../../theme/colors";

export default function IdentificationResult({
  photo,
  result,
  onRetake,
  onImageError,
}) {
  const router = useRouter();
  const status = result.result_status;
  const prediction = status === "accepted" ? result.prediction : null;
  return (
    <View style={styles.card}>
      {status !== "invalid_image" && (
        <Image
          source={{ uri: photo.uri }}
          style={styles.image}
          resizeMode="contain"
          onError={onImageError}
          accessibilityLabel="Ảnh cây đã phân tích"
        />
      )}
      <View style={styles.content}>
        <Text variant="headlineSmall">
          {prediction ? prediction.plant_name : "Chưa nhận diện được"}
        </Text>
        <Text accessibilityRole={prediction ? undefined : "alert"}>
          {result.message}
        </Text>
        {prediction?.plant_id ? (
          <Button
            mode="contained"
            onPress={() =>
              router.push({
                pathname: "/plants/PlantList",
                params: { id: prediction.plant_id },
              })
            }
          >
            Xem thông tin cây
          </Button>
        ) : (
          prediction && (
            <Text>Chưa có thông tin cây tương ứng trong danh mục.</Text>
          )
        )}
        <Button mode="contained" icon="camera-outline" onPress={onRetake}>
          {prediction ? "Nhận diện ảnh khác" : "Chụp lại"}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: 24, overflow: "hidden" },
  image: { width: "100%", aspectRatio: 1, backgroundColor: "#10231D" },
  content: { padding: 18, gap: 14 },
});
