import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  ActivityIndicator,
  Button,
  Checkbox,
  Chip,
  RadioButton,
  Text,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import FormField from "../../src/components/common/FormField";
import useManagerTreatments from "../../src/hooks/useManagerTreatments";
import { colors, radius, spacing, typography } from "../../src/theme";

const statusText = {
  draft: "Bản nháp",
  approved: "Đã phê duyệt",
  deprecated: "Ngừng sử dụng",
};

function ProtocolCard({ item, busy, onEdit, onDeprecate }) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.flex}>
          <Text style={styles.cardTitle}>{item.protocol_name}</Text>
          <Text style={styles.muted}>{item.disease_id?.disease_name}</Text>
        </View>
        <Chip compact>{statusText[item.status] || item.status}</Chip>
      </View>
      <Text style={styles.body}>{item.description}</Text>
      <Text style={styles.meta}>
        {item.duration_days} ngày · {item.stages?.length || 0} giai đoạn · Phiên bản {item.version}
      </Text>
      <Text style={styles.muted}>
        Cây áp dụng: {(item.plant_ids || []).map((plant) => plant.common_name).join(", ")}
      </Text>
      <View style={styles.actions}>
        <Button mode="outlined" onPress={() => onEdit(item)} disabled={busy}>Chỉnh sửa</Button>
        {item.status !== "deprecated" && (
          <Button
            textColor={colors.statusError}
            onPress={() => onDeprecate(item._id)}
            disabled={busy}
            loading={busy}
          >
            Ngừng dùng
          </Button>
        )}
      </View>
    </View>
  );
}

function ProtocolForm({ manager }) {
  const locked = manager.saving || manager.generatingAi;
  return (
    <Modal
      visible={manager.visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={manager.close}
    >
      <SafeAreaView style={styles.safe}>
        <View style={styles.formHeader}>
          <Button onPress={manager.close} disabled={locked}>Hủy</Button>
          <Text style={styles.sectionTitle}>
            {manager.editing ? "Cập nhật phác đồ" : "Tạo phác đồ"}
          </Text>
          <Button onPress={manager.save} loading={locked} disabled={locked}>Lưu</Button>
        </View>
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          {!!manager.formError && <Text style={styles.error}>{manager.formError}</Text>}
          <Text style={styles.eyebrow}>THÔNG TIN PHÁC ĐỒ</Text>
          <FormField
            label="Tên phác đồ *"
            value={manager.form.protocol_name}
            onChangeText={(value) => manager.changeField("protocol_name", value)}
            disabled={locked}
            maxLength={200}
          />
          <FormField
            label="Mô tả *"
            value={manager.form.description}
            onChangeText={(value) => manager.changeField("description", value)}
            disabled={locked}
            multiline
            maxLength={5000}
          />
          <FormField
            label="Thời lượng (ngày) *"
            value={manager.form.duration_days}
            onChangeText={(value) => manager.changeField("duration_days", value.replace(/\D/g, ""))}
            disabled={locked}
            keyboardType="number-pad"
          />

          <Text style={styles.sectionTitle}>Bệnh mục tiêu</Text>
          <RadioButton.Group
            value={manager.form.disease_id}
            onValueChange={(value) => manager.changeField("disease_id", value)}
          >
            {manager.diseases.map((disease) => (
              <RadioButton.Item
                key={disease._id}
                value={disease._id}
                label={disease.disease_name}
                disabled={locked || Boolean(manager.editing)}
              />
            ))}
          </RadioButton.Group>

          <Text style={styles.sectionTitle}>Cây áp dụng *</Text>
          <Text style={styles.muted}>Chỉ chọn cây đã liên kết với bệnh trong danh mục.</Text>
          {manager.eligiblePlants.map((plant) => (
            <Checkbox.Item
              key={plant._id}
              label={plant.common_name}
              status={manager.form.plant_ids.includes(plant._id) ? "checked" : "unchecked"}
              onPress={() => manager.togglePlant(plant._id)}
              disabled={locked || !manager.form.disease_id}
            />
          ))}

          {!manager.editing && (
            <View style={styles.aiBox}>
              <Text style={styles.sectionTitle}>Tạo phác đồ từ DOCX bằng AI</Text>
              <Text style={styles.muted}>DOCX là tùy chọn. AI ưu tiên tài liệu nếu có; nếu không có, phác đồ được tạo từ dữ liệu cây/bệnh và sẽ có cảnh báo chưa kiểm chứng.</Text>
              <Button mode="outlined" icon="file-word-outline" onPress={manager.chooseDocument}
                disabled={locked}>Chọn file DOCX</Button>
              {!!manager.form.document && <Text style={styles.body}>{manager.form.document.name}</Text>}
              <Button mode="contained-tonal" icon="creation" onPress={manager.generateAiDraft}
                loading={manager.generatingAi} disabled={locked}>Tạo phác đồ</Button>
            </View>
          )}

          <Text style={styles.sectionTitle}>Các giai đoạn điều trị</Text>
          {manager.form.stages.map((stage, index) => (
            <View key={`stage-${index}`} style={styles.stage}>
              <View style={styles.row}>
                <Text style={[styles.cardTitle, styles.flex]}>Giai đoạn {index + 1}</Text>
                <Button
                  compact
                  onPress={() => manager.moveStage(index, -1)}
                  disabled={locked || index === 0}
                >
                  Lên
                </Button>
                <Button
                  compact
                  onPress={() => manager.moveStage(index, 1)}
                  disabled={locked || index === manager.form.stages.length - 1}
                >
                  Xuống
                </Button>
                {manager.form.stages.length > 1 && (
                  <Button
                    compact
                    textColor={colors.statusError}
                    onPress={() => manager.removeStage(index)}
                    disabled={locked}
                  >
                    Xóa
                  </Button>
                )}
              </View>
              <FormField
                label="Tên giai đoạn *"
                value={stage.title}
                onChangeText={(value) => manager.changeStage(index, "title", value)}
                disabled={locked}
              />
              <FormField
                label="Giờ thông báo (HH:mm) *"
                value={stage.time}
                onChangeText={(value) => manager.changeStage(index, "time", value)}
                disabled={locked}
                placeholder="08:00"
              />
              <View style={styles.days}>
                <FormField
                  containerStyle={styles.flex}
                  label="Từ ngày *"
                  value={stage.start_day}
                  onChangeText={(value) => manager.changeStage(index, "start_day", value.replace(/\D/g, ""))}
                  disabled={locked}
                  keyboardType="number-pad"
                />
                <FormField
                  containerStyle={styles.flex}
                  label="Đến ngày *"
                  value={stage.end_day}
                  onChangeText={(value) => manager.changeStage(index, "end_day", value.replace(/\D/g, ""))}
                  disabled={locked}
                  keyboardType="number-pad"
                />
              </View>
              <FormField
                label="Nhiệm vụ (mỗi dòng một bước) *"
                value={stage.instructions}
                onChangeText={(value) => manager.changeStage(index, "instructions", value)}
                disabled={locked}
                multiline
              />
            </View>
          ))}
          <Button mode="outlined" icon="plus" onPress={manager.addStage} disabled={locked}>
            Thêm giai đoạn
          </Button>
          <FormField
            label="Hướng dẫn an toàn (mỗi dòng một mục) *"
            value={manager.form.safety_guidelines}
            onChangeText={(value) => manager.changeField("safety_guidelines", value)}
            disabled={locked}
            multiline
          />
          <Text style={styles.sectionTitle}>Trạng thái</Text>
          <RadioButton.Group
            value={manager.form.status}
            onValueChange={(value) => manager.changeField("status", value)}
          >
            <RadioButton.Item value="draft" label="Lưu bản nháp" disabled={locked} />
            <RadioButton.Item value="approved" label="Phê duyệt và kích hoạt" disabled={locked} />
          </RadioButton.Group>
          <Button mode="contained" onPress={manager.save} loading={locked} disabled={locked}>
            {manager.form.status === "approved" ? "Phê duyệt phác đồ" : "Lưu bản nháp"}
          </Button>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

export default function ManagerTreatmentsScreen() {
  const manager = useManagerTreatments();
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <View style={styles.flex}>
          <Text style={styles.eyebrow}>QUẢN LÝ</Text>
          <Text style={styles.title}>Phác đồ điều trị</Text>
          <Text style={styles.muted}>Chỉ phác đồ đã xác minh mới được cung cấp cho khách hàng.</Text>
        </View>
        <Button mode="contained" icon="plus" onPress={manager.openCreate}>Thêm</Button>
      </View>
      {!!manager.error && (
        <View style={styles.errorBox}>
          <Text style={styles.error}>{manager.error}</Text>
          <Button onPress={manager.refresh}>Thử lại</Button>
        </View>
      )}
      {manager.loading ? (
        <View style={styles.center}><ActivityIndicator size="large" /><Text>Đang tải phác đồ…</Text></View>
      ) : (
        <FlatList
          data={manager.items}
          keyExtractor={(item) => item._id}
          contentContainerStyle={[styles.list, !manager.items.length && styles.empty]}
          renderItem={({ item }) => (
            <ProtocolCard
              item={item}
              busy={manager.deprecatingId === item._id}
              onEdit={manager.openEdit}
              onDeprecate={manager.deprecate}
            />
          )}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.sectionTitle}>Chưa có phác đồ</Text>
              <Text style={styles.muted}>Hãy tạo phác đồ đúng cặp cây–bệnh.</Text>
            </View>
          }
        />
      )}
      <ProtocolForm manager={manager} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1, minWidth: 0 },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.xl },
  eyebrow: { ...typography.caption, color: colors.textMuted, fontWeight: "800", letterSpacing: 1.2 },
  title: { ...typography.title, color: colors.textPrimary },
  sectionTitle: { ...typography.section, color: colors.textPrimary },
  cardTitle: { ...typography.label, color: colors.textPrimary },
  body: { ...typography.body, color: colors.textSecondary },
  muted: { ...typography.caption, color: colors.textSecondary },
  meta: { ...typography.label, color: colors.primaryLight },
  list: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.md },
  empty: { flexGrow: 1 },
  card: { backgroundColor: colors.white, borderRadius: radius.card, padding: spacing.lg, gap: spacing.sm, borderWidth: 1, borderColor: colors.border },
  stage: { backgroundColor: colors.softMintBg, borderRadius: radius.card, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
  aiBox: { backgroundColor: "#F1F7F2", borderRadius: radius.card, padding: spacing.lg, gap: spacing.md, borderWidth: 1, borderColor: colors.border },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  days: { flexDirection: "row", gap: spacing.md },
  actions: { flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-end", gap: spacing.sm },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md, padding: spacing.xl },
  errorBox: { marginHorizontal: spacing.xl, padding: spacing.md, backgroundColor: colors.errorBackground, borderRadius: radius.md },
  error: { ...typography.body, color: colors.statusError },
  formHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  form: { width: "100%", maxWidth: 720, alignSelf: "center", padding: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.md },
});
