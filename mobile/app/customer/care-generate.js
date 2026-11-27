import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, StyleSheet } from "react-native";
import { Button, RadioButton, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomActionBar from "../../src/components/common/BottomActionBar";
import ListError from "../../src/components/common/ListError";
import LoadingState from "../../src/components/common/LoadingState";
import ScreenHeader from "../../src/components/common/ScreenHeader";
import SectionCard from "../../src/components/common/SectionCard";
import useCareGeneration from "../../src/hooks/useCareGeneration";
import useFormBack from "../../src/hooks/useFormBack";
import { colors, layout, spacing } from "../../src/theme";
import { componentStyles } from "../../src/theme/componentStyles";

export default function CareGenerateScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const plantId = typeof params.plantId === "string" ? params.plantId : "";
  const preferredId = typeof params.userPlantId === "string" ? params.userPlantId : "";
  const diagnosisId = typeof params.diagnosisId === "string" ? params.diagnosisId : undefined;
  const rank = typeof params.rank === "string" && params.rank ? params.rank : undefined;
  const care = useCareGeneration(plantId, preferredId, params.generateOnOpen === "1", {
    diagnosisId, candidateRank: rank === undefined ? undefined : Number(rank),
  });
  const back = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/customer/garden");
  };
  useFormBack(back, care.busy);

  function addPlant() {
    router.push({
      pathname: "/customer/garden/add",
      params: { plantId, diagnosisId, rank, returnTo: "careGenerate" },
    });
  }

  function openSchedule() {
    router.replace({
      pathname: "/customer/care",
      params: { plantId: care.result.plantId, date: care.result.date },
    });
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <ScreenHeader title="Tạo lịch chăm sóc" onBack={back} disabled={care.busy} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {!plantId ? (
          <Text accessibilityRole="alert">Kết quả nhận diện chưa có thông tin loài cây.</Text>
        ) : care.plantLoading ? (
          <LoadingState message="Đang tải cây trong vườn..." />
        ) : care.plantError ? (
          <ListError message={care.plantError} onRetry={care.loadPlants} />
        ) : (
          <SectionCard title="Chọn cây trong vườn" icon="leaf-outline">
            <Text>Ứng dụng tự lập lịch tưới nước, kiểm tra nhu cầu bón phân và ánh sáng từ tài liệu chăm sóc.</Text>
            {care.plants.length ? (
              <RadioButton.Group value={care.selectedId} onValueChange={care.select}>
                {care.plants.map((plant) => (
                  <RadioButton.Item
                    key={plant._id}
                    value={plant._id}
                    label={plant.active_treatment
                      ? `${plant.plant_nickname} · Đang điều trị`
                      : plant.plant_nickname}
                    disabled={care.busy || Boolean(plant.active_treatment)}
                  />
                ))}
              </RadioButton.Group>
            ) : (
              <>
                <Text>Vườn của bạn chưa có cây cùng loài với kết quả nhận diện.</Text>
                <Button
                  style={componentStyles.buttonShape}
                  contentStyle={componentStyles.button}
                  mode="outlined"
                  icon="plus"
                  onPress={addPlant}
                >
                  Thêm cây vào vườn
                </Button>
              </>
            )}
            {!!care.error && <Text style={styles.error} accessibilityRole="alert">{care.error}</Text>}
            {care.busy && (
              <Text accessibilityLiveRegion="polite">Đang tạo lịch từ tài liệu chăm sóc…</Text>
            )}
            {care.result && (
              <Text accessibilityLiveRegion="polite">
                {care.result.count
                  ? `Đã tạo thêm ${care.result.count} lịch chăm sóc.`
                  : "Cây đã có đủ các loại lịch chăm sóc."}
              </Text>
            )}
          </SectionCard>
        )}
        {care.result?.schedules.map((schedule) => (
          <SectionCard key={schedule._id} title={schedule.title}>
            <Text variant="titleSmall">
              {schedule.time} giờ Việt Nam · {schedule.repeat_every_days === 1
                ? "Hằng ngày"
                : `Mỗi ${schedule.repeat_every_days} ngày`}
            </Text>
            {!!schedule.notes && <Text style={styles.notes}>{schedule.notes}</Text>}
          </SectionCard>
        ))}
        {!!care.result?.sources.length && (
          <SectionCard title="Nguồn tham khảo cho lịch tự động" icon="book-outline">
            {care.result.referenceKind === "general" && (
              <Text>Loài này đang dùng hướng dẫn chung. Hãy đối chiếu với điều kiện trồng thực tế.</Text>
            )}
            {care.result.timingSource === "default" && (
              <Text>Lịch mới dùng giờ nhắc buổi sáng mặc định.</Text>
            )}
            {care.result.sources.map((source) => (
              <Link key={source.url} href={source.url} style={styles.source}>
                {source.title}
              </Link>
            ))}
          </SectionCard>
        )}
      </ScrollView>
      {!!care.selectedId && !care.plantLoading && !care.plantError && (
        <BottomActionBar>
          <Button
            mode="contained"
            style={componentStyles.buttonShape}
            contentStyle={componentStyles.button}
            loading={care.busy}
            disabled={care.busy}
            onPress={care.result ? openSchedule : care.generate}
          >
            {care.result ? "Xem lịch chăm sóc" : "Tự động tạo lịch chăm sóc"}
          </Button>
        </BottomActionBar>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: {
    width: "100%",
    maxWidth: layout.detail,
    alignSelf: "center",
    padding: spacing.xl,
    gap: spacing.md,
  },
  notes: { lineHeight: 22, color: colors.textSecondary },
  source: { color: colors.primary, textDecorationLine: "underline" },
  error: { color: colors.statusError },
});
