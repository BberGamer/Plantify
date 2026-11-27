import ActionNoticeDialog from "../../src/components/common/ActionNoticeDialog";
import LoadingState from "../../src/components/common/LoadingState";
import { componentStyles } from "../../src/theme/componentStyles";
// PlantList.js - Ghép giao diện và hành động màn chi tiết cây.

import { View, StyleSheet, ScrollView } from "react-native";
import { Button, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { colors } from "../../src/theme/colors";
import usePlantDetailScreen from "../../src/hooks/usePlantDetailScreen";
import usePlantDiseases from "../../src/hooks/usePlantDiseases";
import PlantDetailHeader from "../../src/components/plants/PlantDetailHeader";
import PlantHero from "../../src/components/plants/PlantHero";
import PlantInformation from "../../src/components/plants/PlantInformation";
import PlantCareRequirements from "../../src/components/plants/PlantCareRequirements";
import PlantDiseases from "../../src/components/plants/PlantDiseases";
import PlantDetailActions from "../../src/components/plants/PlantDetailActions";
import ListError from "../../src/components/common/ListError";
export default function PlantDetailScreen() {
  const { id, diseaseId } = useLocalSearchParams();
  const router = useRouter();
  const detail = usePlantDetailScreen(id);
  const diseaseState = usePlantDiseases(typeof id === "string" ? id : null);
  const focusedDisease = typeof diseaseId === "string" ? diseaseId : null;
  const diseaseSection = (
    <PlantDiseases
      key={`${id}:${focusedDisease ?? ""}`}
      diseases={diseaseState.diseases}
      loading={diseaseState.loading}
      error={diseaseState.error}
      onRetry={diseaseState.retry}
      initialDiseaseId={focusedDisease}
    />
  );
  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ActionNoticeDialog {...detail.noticeDialog} />
      <PlantDetailHeader
        saved={detail.saved}
        showFavorite={detail.showFavorite}
        busy={detail.favoriteBusy}
        canSave={!detail.loading && !detail.error && Boolean(detail.plant) && !detail.favoriteBusy}
        onBack={() => router.back()}
        onToggleSaved={detail.toggleSaved}
      />
      {!!detail.favoriteError && <ListError message={detail.favoriteError} onRetry={detail.retryFavorite} />}
      {detail.loading ? (
        <LoadingState style={{ flex: 1 }} message="Đang tải thông tin cây..." />
      ) : detail.error || !detail.plant ? (
        <View style={styles.centerBox}>
          <Text style={styles.errorText} accessibilityRole="alert">
            {detail.error || "Không tìm thấy cây này."}
          </Text>
          <Button style={componentStyles.buttonShape} contentStyle={componentStyles.button} onPress={detail.refetch}>Thử lại</Button>
        </View>
      ) : (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scroll}
          >
            {focusedDisease && diseaseSection}
            <PlantHero plant={detail.plant} />
            <PlantInformation plant={detail.plant} />
            <PlantCareRequirements
              requirements={detail.plant.care_requirements}
            />
            {!focusedDisease && diseaseSection}
          </ScrollView>
          <PlantDetailActions onAdd={detail.addToGarden} />
        </>
      )}
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  // States
  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16
  },
  loadingText: {
    fontSize: 14,
    color: colors.textMuted
  },
  errorText: {
    fontSize: 15,
    color: colors.statusError,
    textAlign: "center",
    paddingHorizontal: 32,
    fontWeight: "600"
  },
  scroll: {
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
    paddingBottom: 32
  }
});
