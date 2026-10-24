// PlantList.js - Ghép giao diện và hành động màn chi tiết cây.

import { View, StyleSheet, ScrollView } from "react-native";
import { ActivityIndicator, Button, Text } from "react-native-paper";
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
export default function PlantDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const detail = usePlantDetailScreen(id);
  const diseaseState = usePlantDiseases(typeof id === "string" ? id : null);
  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <PlantDetailHeader
        saved={detail.saved}
        canSave={!detail.loading && !detail.error && Boolean(detail.plant)}
        onBack={() => router.back()}
        onToggleSaved={detail.toggleSaved}
      />
      {detail.loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Đang tải thông tin cây...</Text>
        </View>
      ) : detail.error || !detail.plant ? (
        <View style={styles.centerBox}>
          <Text style={styles.errorText} accessibilityRole="alert">
            {detail.error || "Không tìm thấy cây này."}
          </Text>
          <Button onPress={detail.refetch}>Thử lại</Button>
        </View>
      ) : (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scroll}
          >
            <PlantHero plant={detail.plant} />
            <PlantInformation plant={detail.plant} />
            <PlantCareRequirements
              requirements={detail.plant.care_requirements}
            />
            <PlantDiseases
              diseases={diseaseState.diseases}
              loading={diseaseState.loading}
              error={diseaseState.error}
              onRetry={diseaseState.retry}
            />
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
    backgroundColor: "#FAFCFA",
  },
  // States
  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  errorText: {
    fontSize: 15,
    color: colors.statusError,
    textAlign: "center",
    paddingHorizontal: 32,
    fontWeight: "600",
  },
  scroll: {
    paddingBottom: 124,
  },
});
