import { componentStyles } from "../../theme/componentStyles";
import { useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { Button, RadioButton, Text } from "react-native-paper";
import { colors, radius, spacing, typography } from "../../theme";
import CatalogReferenceGallery from "./CatalogReferenceGallery";
import { formatConfidence } from "./diagnosisPresentation";

export default function DiagnosisResult({
  photo,
  result,
  onRetake,
  onImageError,
  onCreatePlan,
  onOpenCatalog,
  onOpenHistory,
}) {
  const status = result.result_status;
  const unsupported = status === "unsupported_image";
  const isPlantMode = result.result_kind === "plant";
  const accepted = status === "accepted";
  const candidates = accepted
    ? [result.prediction, ...result.alternatives.slice(1, 3)]
    : [];
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const selected = candidates[selectedIndex];
  const canCreatePlan = (candidate) =>
    Boolean(
      candidate?.plant_id &&
      (isPlantMode ||
        candidate.is_healthy ||
        (candidate.disease_id &&
          candidate.treatment_available &&
          result.diagnosis_id)),
    );

  return (
    <View style={styles.card}>
      {status !== "invalid_image" && (
        <Image
          source={{ uri: photo.uri }}
          style={styles.image}
          resizeMode="contain"
          accessibilityLabel="Ảnh lá cây đã phân tích"
          onError={onImageError}
        />
      )}
      <View style={styles.content}>
        <Text style={styles.title} accessibilityRole="header">
          {accepted
            ? "Gợi ý từ AI"
            : unsupported
              ? "Cần ảnh lá cây"
              : isPlantMode
                ? "Chưa nhận diện được"
                : "Chưa chẩn đoán được"}
        </Text>
        <Text
          style={styles.body}
          accessibilityRole={accepted ? undefined : "alert"}
        >
          {result.message}
        </Text>
        {candidates.map((candidate, index) => {
          const isDisease = !isPlantMode && !candidate.is_healthy;
          const images = isDisease
            ? candidate.disease_details?.reference_images
            : candidate.plant_details?.reference_images;
          const title =
            !isPlantMode && candidate.is_healthy && candidate.plant_name
              ? `${candidate.plant_name} · Chưa phát hiện bệnh`
              : candidate.display_name || candidate.class_name;
          const isSelected = index === selectedIndex;
          return (
            <View
              key={isPlantMode ? candidate.plant_id : candidate.class_id}
              style={[styles.candidate, isSelected && styles.selected]}
            >
              <Text style={styles.name} accessibilityRole="header">
                {title}
              </Text>
              <Text style={styles.score}>
                Độ tin cậy {formatConfidence(candidate.confidence)}
              </Text>
              {images?.length ? (
                <CatalogReferenceGallery images={images} name={title} />
              ) : (
                <Text style={styles.body}>Chưa có ảnh tham khảo.</Text>
              )}
              {!!candidate.plant_id &&
                (!isDisease || !!candidate.disease_id) && (
                  <Button
                    style={componentStyles.buttonShape}
                    contentStyle={componentStyles.button}
                    mode="outlined"
                    icon="information-outline"
                    onPress={() => onOpenCatalog(candidate)}
                  >
                    {isDisease ? "Thông tin bệnh" : "Thông tin cây"}
                  </Button>
                )}
              {!candidate.plant_id && (
                <Text style={styles.body}>
                  Chưa có mục tương ứng trong danh mục.
                </Text>
              )}
              {canCreatePlan(candidate) && (
                <RadioButton.Item
                  value={String(index)}
                  label={
                    isDisease
                      ? "Chọn để tạo phác đồ"
                      : "Chọn để tạo lịch chăm sóc"
                  }
                  accessibilityLabel={`Chọn ${title}`}
                  status={isSelected ? "checked" : "unchecked"}
                  onPress={() => setSelectedIndex(index)}
                  style={styles.choice}
                />
              )}
            </View>
          );
        })}
        {candidates.some(canCreatePlan) && (
          <Button
            style={componentStyles.buttonShape}
            contentStyle={componentStyles.button}
            mode="contained"
            icon={
              selected?.disease_id ? "clipboard-pulse-outline" : "calendar-plus"
            }
            disabled={!selected}
            onPress={() => onCreatePlan(selected, selectedIndex + 1)}
          >
            {selected?.disease_id
              ? "Tạo phác đồ điều trị"
              : selected
                ? "Tạo lịch chăm sóc"
                : "Chọn một kết quả để tiếp tục"}
          </Button>
        )}
        <View style={styles.actions}>
          <Button
            style={componentStyles.buttonShape}
            contentStyle={componentStyles.button}
            mode="outlined"
            icon="camera-outline"
            onPress={onRetake}
          >
            {accepted || unsupported ? "Chụp / chọn ảnh mới" : "Chụp lại"}
          </Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    overflow: "hidden",
    backgroundColor: colors.white,
  },
  image: {
    width: "100%",
    aspectRatio: 1.4,
    backgroundColor: "#10231D",
  },
  content: {
    padding: spacing.xl,
    gap: spacing.md,
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
  },
  candidate: {
    gap: spacing.sm,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  selected: {
    backgroundColor: colors.softMintBg,
    borderColor: colors.primary,
  },
  name: {
    ...typography.section,
    color: colors.textPrimary,
  },
  score: {
    ...typography.label,
    color: colors.primary,
  },
  choice: {
    paddingHorizontal: 0,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.md,
    marginTop: spacing.lg,
  },
});
