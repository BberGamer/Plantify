import { ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Checkbox, RadioButton, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import useManagerProtocolGenerator from "../../src/hooks/useManagerProtocolGenerator";
import { colors, radius, spacing, typography } from "../../src/theme";

export default function ManagerProtocolGeneratorScreen() {
  const generator = useManagerProtocolGenerator();
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.heading}>
          <View style={styles.headingIcon}>
            <Ionicons name="document-text-outline" size={24} color={colors.primary} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.eyebrow}>AI PHÁC ĐỒ</Text>
            <Text style={styles.title}>Tạo phác đồ từ DOCX</Text>
            <Text style={styles.subtitle}>
              AI đọc tài liệu, tạo và kích hoạt phác đồ ngay. Không cần duyệt thủ công.
            </Text>
          </View>
        </View>

        {!!generator.error && (
          <View style={styles.errorBox}>
            <Text style={styles.error} accessibilityRole="alert">{generator.error}</Text>
            {!generator.diseases.length && !generator.generating && (
              <Button onPress={generator.retry}>Thử lại</Button>
            )}
          </View>
        )}

        {generator.loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" />
            <Text>Đang tải danh mục…</Text>
          </View>
        ) : (
          <>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>1. Chọn bệnh</Text>
              <RadioButton.Group value={generator.diseaseId} onValueChange={generator.selectDisease}>
                {generator.diseases.map((disease) => (
                  <RadioButton.Item key={disease._id} value={disease._id}
                    label={disease.disease_name} disabled={generator.generating} />
                ))}
              </RadioButton.Group>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>2. Chọn cây áp dụng</Text>
              {!generator.diseaseId ? (
                <Text style={styles.subtitle}>Chọn bệnh trước để xem các cây đã liên kết.</Text>
              ) : !generator.eligiblePlants.length ? (
                <Text style={styles.error}>Bệnh này chưa được liên kết với cây nào.</Text>
              ) : generator.eligiblePlants.map((plant) => (
                <Checkbox.Item key={plant._id} label={plant.common_name}
                  status={generator.plantIds.includes(plant._id) ? "checked" : "unchecked"}
                  onPress={() => generator.togglePlant(plant._id)}
                  disabled={generator.generating} />
              ))}
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>3. Tải tài liệu DOCX</Text>
              <Text style={styles.subtitle}>
                File tối đa 10 MB. Tài liệu nên ghi rõ lịch ngày, giờ, liều lượng và an toàn.
              </Text>
              <Button mode="outlined" icon="file-word-outline" onPress={generator.chooseDocument}
                disabled={generator.generating}>Chọn file DOCX</Button>
              {!!generator.document && (
                <View style={styles.fileRow}>
                  <Ionicons name="document-attach-outline" size={20} color={colors.primary} />
                  <Text style={styles.fileName}>{generator.document.name}</Text>
                </View>
              )}
              <Button mode="contained" icon="creation" onPress={generator.generate}
                loading={generator.generating} disabled={generator.generating || !generator.document ||
                  !generator.diseaseId || !generator.plantIds.length}>
                Đọc DOCX và tạo phác đồ
              </Button>
            </View>
          </>
        )}

        {!!generator.result && (
          <View style={styles.successCard} accessibilityRole="summary">
            <Ionicons name="checkmark-circle" size={28} color={colors.primary} />
            <Text style={styles.sectionTitle}>Đã tạo và kích hoạt phác đồ</Text>
            <Text style={styles.resultTitle}>{generator.result.protocol_name}</Text>
            <Text style={styles.subtitle}>{generator.result.description}</Text>
            <Text style={styles.meta}>
              {generator.result.duration_days} ngày · {generator.result.stages?.length || 0} công việc
            </Text>
            <Button mode="outlined" onPress={generator.reset}>Tạo phác đồ khác</Button>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { width: "100%", maxWidth: 760, alignSelf: "center", padding: spacing.xl,
    paddingBottom: spacing.xxxl, gap: spacing.lg },
  flex: { flex: 1, minWidth: 0 },
  heading: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md },
  headingIcon: { width: 48, height: 48, borderRadius: radius.md, backgroundColor: colors.lightMint,
    alignItems: "center", justifyContent: "center" },
  eyebrow: { ...typography.caption, fontWeight: "700", letterSpacing: 1.1, color: colors.textMuted },
  title: { fontSize: 28, lineHeight: 38, fontWeight: "700", color: colors.textPrimary },
  subtitle: { ...typography.body, color: colors.textSecondary },
  card: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.card, padding: spacing.lg, gap: spacing.md },
  sectionTitle: { ...typography.section, fontWeight: "700", color: colors.textPrimary },
  fileRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm,
    backgroundColor: colors.softMintBg, borderRadius: radius.md, padding: spacing.md },
  fileName: { ...typography.label, color: colors.textPrimary, flex: 1 },
  center: { minHeight: 240, alignItems: "center", justifyContent: "center", gap: spacing.md },
  errorBox: { padding: spacing.md, backgroundColor: colors.errorBackground,
    borderRadius: radius.md, gap: spacing.sm },
  error: { ...typography.body, color: colors.statusError },
  successCard: { backgroundColor: colors.softMintBg, borderWidth: 1, borderColor: colors.primary,
    borderRadius: radius.card, padding: spacing.lg, gap: spacing.md },
  resultTitle: { ...typography.label, color: colors.textPrimary },
  meta: { ...typography.label, color: colors.primaryLight },
});
