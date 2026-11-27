import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Button, Dialog, Portal, RadioButton, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import CareTaskInstructions from "../../src/components/care/CareTaskInstructions";
import BottomActionBar from "../../src/components/common/BottomActionBar";
import ListError from "../../src/components/common/ListError";
import LoadingState from "../../src/components/common/LoadingState";
import ScreenHeader from "../../src/components/common/ScreenHeader";
import SectionCard from "../../src/components/common/SectionCard";
import useCareGeneration from "../../src/hooks/useCareGeneration";
import useFormBack from "../../src/hooks/useFormBack";
import { colors, layout, spacing } from "../../src/theme";
import { componentStyles } from "../../src/theme/componentStyles";

const stringParam = (value) => (typeof value === "string" ? value : "");

export default function CareGenerateScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const plantId = stringParam(params.plantId);
  const diagnosisId = stringParam(params.diagnosisId);
  const rank = stringParam(params.rank);
  const care = useCareGeneration({
    plantId,
    preferredId: stringParam(params.userPlantId),
    diagnosisId: diagnosisId || undefined,
    candidateRank: rank ? Number(rank) : undefined,
  });
  const [confirming, setConfirming] = useState("");
  const preview = care.preview;
  const showConfirmation = Boolean(preview && confirming && confirming === care.selected?._id);
  const back = () => {
    if (showConfirmation) setConfirming("");
    else if (router.canGoBack()) router.back();
    else router.replace("/customer/garden");
  };
  useFormBack(back, care.applying);

  function addPlant() {
    router.push({
      pathname: "/customer/garden/add",
      params: { plantId, diagnosisId, rank, returnTo: "careGenerate" },
    });
  }

  async function apply() {
    const result = await care.apply();
    if (!result) return;
    setConfirming("");
    router.replace({ pathname: "/customer/care", params: result });
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <ScreenHeader title="Xem trước lịch chăm sóc" onBack={back} disabled={care.applying} />
      {!plantId ? (
        <ListError message="Chưa có thông tin loài cây." />
      ) : care.loading ? (
        <LoadingState style={styles.scroll} message="Đang chuẩn bị lịch chăm sóc…" />
      ) : care.previewError ? (
        <ListError message={care.previewError} onRetry={() => {
          setConfirming("");
          void care.loadPreview();
        }} />
      ) : preview && (
        <>
          <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
            <SectionCard title="Lịch chăm sóc đề xuất" icon="leaf-outline">
              <Text variant="titleMedium">{preview.plant_name}</Text>
              <Text>Chọn cây trong vườn để áp dụng lịch chăm sóc này.</Text>
            </SectionCard>
            <SectionCard title="Chọn cây trong vườn" icon="flower-outline">
              {care.plantLoading ? (
                <Text accessibilityLiveRegion="polite">Đang tải cây trong vườn…</Text>
              ) : care.plantError ? (
                <ListError message={care.plantError} onRetry={care.loadPlants} />
              ) : (
                <>
                  {!!care.plants.length && (
                    <RadioButton.Group value={care.selected?._id || ""} onValueChange={care.select}>
                      {care.plants.map((plant) => (
                        <RadioButton.Item
                          key={plant._id}
                          value={plant._id}
                          label={plant.active_treatment
                            ? plant.plant_nickname + " · Đang điều trị"
                            : plant.plant_nickname}
                          disabled={care.applying || Boolean(plant.active_treatment)}
                        />
                      ))}
                    </RadioButton.Group>
                  )}
                  {!care.eligibleCount && (
                    <>
                      <Text>{care.plants.length
                        ? "Cây cùng loài trong vườn đang điều trị."
                        : "Vườn của bạn chưa có cây cùng loài."}</Text>
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
                </>
              )}
            </SectionCard>
            {preview.tasks.map((task) => (
              <SectionCard key={task.action_type} title={task.title}>
                <Text variant="titleSmall">
                  {task.time} giờ Việt Nam · {task.repeat_every_days === 1
                    ? "Hằng ngày"
                    : "Mỗi " + task.repeat_every_days + " ngày"}
                </Text>
                <CareTaskInstructions task={task} />
              </SectionCard>
            ))}
            <SectionCard title="Tài liệu tham khảo từ hệ thống" icon="book-outline">
              {preview.reference_kind === "general" && (
                <Text>Lịch này dùng hướng dẫn chăm sóc chung. Hãy đối chiếu với điều kiện trồng thực tế.</Text>
              )}
              {preview.timing_source === "default" && (
                <Text>Giờ nhắc được chọn theo khung giờ buổi sáng của hệ thống.</Text>
              )}
              {preview.sources.map((source) => (
                <Link key={source.url} href={source.url} style={styles.source}>
                  {source.title}
                </Link>
              ))}
            </SectionCard>
          </ScrollView>
          {!!care.eligibleCount && !care.plantLoading && !care.plantError && (
            <BottomActionBar>
              <Button
                mode="contained"
                style={componentStyles.buttonShape}
                contentStyle={componentStyles.button}
                disabled={!care.canApply}
                onPress={() => setConfirming(care.selected._id)}
              >
                Áp dụng lịch chăm sóc
              </Button>
            </BottomActionBar>
          )}
        </>
      )}
      <Portal>
        <Dialog
          style={componentStyles.dialog}
          visible={showConfirmation}
          onDismiss={() => !care.applying && setConfirming("")}
          dismissable={!care.applying}
        >
          <Dialog.Title>Áp dụng lịch chăm sóc?</Dialog.Title>
          <Dialog.Content>
            <Text>Thêm các công việc còn thiếu vào lịch chăm sóc hằng ngày của cây {care.selected?.plant_nickname}.</Text>
            {!!care.applyError && <Text style={styles.error} accessibilityRole="alert">{care.applyError}</Text>}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirming("")} disabled={care.applying}>Hủy</Button>
            <Button onPress={apply} loading={care.applying} disabled={!care.canApply}>Áp dụng</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  source: { color: colors.primary, textDecorationLine: "underline" },
  error: { color: colors.statusError, marginTop: spacing.sm },
});
