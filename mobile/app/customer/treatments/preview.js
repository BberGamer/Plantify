import { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Button, Dialog, Portal, Text } from "react-native-paper";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors, radius, spacing, typography } from "../../../src/theme";
import { useTreatmentPreview } from "../../../src/hooks/useTreatment";
import {
  TreatmentHeader,
  TreatmentSafetyNotice,
  TreatmentStageCard,
  TreatmentStateView,
  TreatmentStatusBadge,
} from "../../../src/components/treatments";

export default function TreatmentPreviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const value = (input) => (typeof input === "string" ? input : "");
  const treatment = useTreatmentPreview({
    diseaseId: value(params.diseaseId),
    plantId: value(params.plantId),
    userPlantId: value(params.userPlantId),
    diagnosisId: value(params.diagnosisId) || undefined,
    startDate: value(params.startDate) || undefined,
  });
  const [confirming, setConfirming] = useState(false);
  const data = treatment.data;
  const selectedProtocol = treatment.protocols.find(
    (protocol) => protocol._id === treatment.selectedProtocolId,
  );

  function addDetectedPlant() {
    router.push({
      pathname: "/customer/garden/add",
      params: {
        plantId: value(params.plantId),
        diseaseId: value(params.diseaseId),
        diagnosisId: value(params.diagnosisId),
        startDate: value(params.startDate),
        returnTo: "treatmentPreview",
      },
    });
  }

  async function apply() {
    const activeTreatment = await treatment.apply();
    if (activeTreatment) {
      setConfirming(false);
      router.replace({
        pathname: "/customer/treatments/TreatmentList",
        params: { treatmentId: activeTreatment._id },
      });
    }
  }

  return <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
    <TreatmentHeader title="Xem trước phác đồ" onBack={() => router.back()} />
    {treatment.loading || treatment.error ? (
      <TreatmentStateView loading={treatment.loading} error={treatment.error} onRetry={treatment.retry} />
    ) : !data ? <>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Chọn cây trong vườn</Text>
          <Text style={styles.body}>
            Chỉ những cây cùng loài với kết quả AI mới được hiển thị.
          </Text>
          {treatment.gardenPlants.map((plant) => {
            const selected = treatment.selectedUserPlantId === plant._id;
            const disabled = Boolean(plant.active_treatment);
            return (
              <Pressable
                key={plant._id}
                onPress={() => !disabled && treatment.selectGardenPlant(plant._id)}
                disabled={disabled}
                accessibilityRole="radio"
                accessibilityState={{ selected, disabled }}
                style={[
                  styles.plantOption,
                  selected && styles.protocolSelected,
                  disabled && styles.disabled,
                ]}
              >
                <View style={styles.protocolHeader}>
                  <View style={styles.summaryText}>
                    <Text style={styles.protocolName}>{plant.plant_nickname}</Text>
                    <Text style={styles.protocolMeta}>
                      {plant.species_name || "Cây trong vườn"}
                    </Text>
                  </View>
                  <View style={[styles.radio, selected && styles.radioSelected]} />
                </View>
                {disabled && (
                  <Text style={styles.error}>Cây đang có đợt điều trị hoạt động.</Text>
                )}
              </Pressable>
            );
          })}
          {!treatment.gardenPlants.length && (
            <View style={styles.missingPlant}>
              <Text style={styles.error}>
                Vườn của bạn chưa có cây cùng loài với kết quả AI. Cần thêm cây này
                vào vườn để tạo và áp dụng lịch điều trị.
              </Text>
              <Button mode="outlined" icon="plus" onPress={addDetectedPlant}>
                Thêm cây đã nhận diện vào vườn
              </Button>
            </View>
          )}
        </View>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Phác đồ AI vừa tạo</Text>
          <Text style={styles.body}>Phác đồ này chưa được lưu. Hệ thống chỉ lưu khi bạn chọn cây trong vườn và tạo lịch điều trị.</Text>
        </View>
        {treatment.protocols.length ? treatment.protocols.map((protocol) => {
          const selected = treatment.selectedProtocolId === protocol._id;
          return <Pressable
            key={protocol._id}
            onPress={() => treatment.selectProtocol(protocol._id)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            style={[styles.protocolCard, selected && styles.protocolSelected]}
          >
            <View style={styles.protocolHeader}>
              <Text style={styles.protocolName}>{protocol.protocol_name}</Text>
              <View style={[styles.radio, selected && styles.radioSelected]} />
            </View>
            <Text style={styles.body}>{protocol.description}</Text>
            <Text style={styles.protocolMeta}>{protocol.duration_days} ngày · Phiên bản {protocol.version}</Text>
          </Pressable>;
        }) : <TreatmentStateView empty="Chưa tạo được phác đồ cho bệnh này." />}
        {!!selectedProtocol && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chi tiết phác đồ</Text>
            {!!selectedProtocol.approved_instructions?.length && (
              <View style={styles.card}>
                <Text style={styles.protocolName}>Hướng dẫn đã được phê duyệt</Text>
                {selectedProtocol.approved_instructions.map((instruction, index) => (
                  <Text key={`${selectedProtocol._id}-instruction-${index}`} style={styles.body}>
                    • {instruction}
                  </Text>
                ))}
              </View>
            )}
            {selectedProtocol.stages?.map((stage, index) => (
              <TreatmentStageCard
                key={stage._id || `${selectedProtocol._id}-stage-${stage.order}`}
                stage={{ ...stage, _id: stage._id || `${selectedProtocol._id}-${stage.order}` }}
                initiallyExpanded={index === 0}
              />
            ))}
            {!!selectedProtocol.safety_guidelines?.length && (
              <TreatmentSafetyNotice>
                {selectedProtocol.safety_guidelines.join(" ")}
              </TreatmentSafetyNotice>
            )}
            {!!selectedProtocol.reference_notice && (
              <Text style={styles.referenceNotice} accessibilityRole="alert">
                {selectedProtocol.reference_notice}
              </Text>
            )}
          </View>
        )}
        {!!treatment.generateError && <Text style={styles.error} accessibilityRole="alert">{treatment.generateError}</Text>}
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        {treatment.gardenPlants.length ? (
          <Button mode="contained" onPress={treatment.generate} loading={treatment.generating} disabled={!treatment.canGenerate || treatment.generating} contentStyle={styles.buttonContent}>Tạo lịch điều trị</Button>
        ) : (
          <Button mode="contained" icon="plus" onPress={addDetectedPlant} contentStyle={styles.buttonContent}>Thêm cây để áp dụng</Button>
        )}
      </View>
    </> : <>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.summary}>
          <Image source={{ uri: data.plant.image_url }} style={styles.image} accessibilityLabel={`Ảnh cây ${data.plant.plant_nickname}`} />
          <View style={styles.summaryText}>
            <TreatmentStatusBadge status={data.status} />
            <Text style={styles.plant}>{data.plant.plant_nickname}</Text>
            <Text style={styles.disease}>{data.disease.disease_name}</Text>
          </View>
        </View>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Thông tin bệnh</Text>
          <Text style={styles.body}>{data.disease.description}</Text>
        </View>
        <View style={styles.metrics}>
          <View style={styles.metric}><Text style={styles.metricValue}>{data.protocol.standard_duration_days}</Text><Text style={styles.metricLabel}>Ngày</Text></View>
          <View style={styles.metric}><Text style={styles.metricValue}>{data.stages.length}</Text><Text style={styles.metricLabel}>Giai đoạn</Text></View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Các giai đoạn điều trị</Text>
          {data.stages.map((stage, index) => <TreatmentStageCard key={stage._id} stage={stage} initiallyExpanded={index === 0} />)}
        </View>
        <TreatmentSafetyNotice>{data.protocol.safety_note}</TreatmentSafetyNotice>
        {!!data.protocol.reference_notice && (
          <Text style={styles.referenceNotice} accessibilityRole="alert">
            {data.protocol.reference_notice}
          </Text>
        )}
        {!!treatment.applyError && <Text style={styles.error} accessibilityRole="alert">{treatment.applyError}</Text>}
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <Button mode="contained" onPress={() => setConfirming(true)} disabled={!treatment.canApply || treatment.applying} contentStyle={styles.buttonContent}>Áp dụng phác đồ điều trị</Button>
      </View>
    </>}
    <Portal>
      <Dialog visible={confirming} onDismiss={() => !treatment.applying && setConfirming(false)} dismissable={!treatment.applying}>
        <Dialog.Title>Bắt đầu điều trị?</Dialog.Title>
        <Dialog.Content><Text>Lịch chăm sóc thường ngày của cây sẽ tạm dừng trong thời gian điều trị.</Text></Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setConfirming(false)} disabled={treatment.applying}>Hủy</Button>
          <Button onPress={apply} loading={treatment.applying} disabled={treatment.applying}>Bắt đầu điều trị</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { width: "100%", maxWidth: 560, alignSelf: "center", padding: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.lg },
  summary: { flexDirection: "row", gap: spacing.lg, backgroundColor: colors.white, padding: spacing.md, borderRadius: radius.card },
  image: { width: 92, height: 104, borderRadius: radius.md, backgroundColor: colors.lightMint },
  summaryText: { flex: 1, minWidth: 0, justifyContent: "center", gap: spacing.xs },
  plant: { ...typography.section, color: colors.textPrimary },
  disease: { ...typography.body, color: colors.textSecondary },
  card: { backgroundColor: colors.white, borderRadius: radius.card, padding: spacing.lg, gap: spacing.sm },
  section: { gap: spacing.md },
  sectionTitle: { ...typography.section, color: colors.textPrimary },
  body: { ...typography.body, color: colors.textSecondary },
  metrics: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  metric: { flexGrow: 1, flexBasis: 130, alignItems: "center", padding: spacing.lg, backgroundColor: colors.white, borderRadius: radius.card },
  metricValue: { ...typography.title, color: colors.primary },
  metricLabel: { ...typography.caption, color: colors.textSecondary },
  protocolCard: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: radius.card, padding: spacing.lg, gap: spacing.sm },
  plantOption: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, gap: spacing.xs },
  disabled: { opacity: 0.55 },
  protocolSelected: { borderColor: colors.primaryLight, backgroundColor: colors.softMintBg },
  protocolHeader: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  protocolName: { ...typography.label, flex: 1, color: colors.textPrimary },
  protocolMeta: { ...typography.caption, color: colors.primaryLight, fontWeight: "600" },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.inputBorder },
  radioSelected: { borderWidth: 6, borderColor: colors.primaryLight },
  error: { ...typography.body, color: colors.statusError, textAlign: "center" },
  referenceNotice: { ...typography.body, color: "#946017", backgroundColor: colors.warmPeachBg, borderRadius: radius.md, padding: spacing.md },
  missingPlant: { gap: spacing.md },
  footer: { backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.border, paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  buttonContent: { minHeight: 48 },
});
