import { componentStyles } from "../../theme/componentStyles";
import { radius } from "../../theme";
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
        {!!result.history_id && (
          <Button style={componentStyles.buttonShape} contentStyle={componentStyles.button}
            mode="outlined"
            icon="history"
            onPress={() =>
              router.push({
                pathname: "/customer/diagnosis-detail",
                params: { diagnosisId: result.history_id },
              })
            }
          >
            Xem lần nhận diện đã lưu
          </Button>
        )}
        {prediction?.plant_id ? (
          <Button style={componentStyles.buttonShape} contentStyle={componentStyles.button}
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
        <Button style={componentStyles.buttonShape} contentStyle={componentStyles.button} mode="contained" icon="camera-outline" onPress={onRetake}>
          {prediction ? "Nhận diện ảnh khác" : "Chụp lại"}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.card,
    overflow: "hidden"
  },
  image: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#10231D"
  },
  content: {
    padding: 18,
    gap: 14
  }
});
