import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Checkbox, Text, TextInput } from "react-native-paper";
import { colors, spacing } from "../../theme";

export default function CatalogAiPicker({ ai, disabled, plantIds }) {
  const [search, setSearch] = useState("");
  const rows = ai.rows.filter(row =>
    (row.class_name.toLowerCase().includes(search.trim().toLowerCase()) || ai.selected.includes(row.class_id)) &&
    (!plantIds || plantIds.includes(row.plant_id) || ai.selected.includes(row.class_id)),
  );
  const transfers = ai.rows.filter(row => ai.selected.includes(row.class_id) &&
    row[ai.kind === "plant" ? "plant_id" : "disease_id"] &&
    row[ai.kind === "plant" ? "plant_id" : "disease_id"] !== ai.targetId);
  return <View style={styles.section}>
    <Text variant="titleMedium">Nhãn AI nhận diện</Text>
    <Text>Thêm danh mục không làm model học thêm class. Chỉ chọn nhãn đúng với cây/bệnh này. Không chọn nhãn vẫn lưu được danh mục, nhưng AI sẽ không trỏ đến bản ghi mới.</Text>
    {plantIds && <Text>Nhãn bệnh được lọc theo cây liên quan đã chọn. Nhãn chưa có cây cần được gán tại màn quản lý cây trước.</Text>}
    {ai.loading && <ActivityIndicator accessibilityLabel="Đang tải nhãn AI" />}
    {!!ai.error && <View><Text accessibilityRole="alert" style={styles.error}>{ai.error}</Text><Button onPress={ai.retry} disabled={disabled}>Thử lại nhãn AI</Button></View>}
    {ai.ready && <>
      <TextInput label="Tìm nhãn AI" value={search} onChangeText={setSearch} disabled={disabled} mode="outlined" />
      <Text>Đã chọn {ai.selected.length} nhãn</Text>
      {!!transfers.length && <Text accessibilityRole="alert" style={styles.warning}>Khi lưu, {transfers.length} nhãn đã chọn sẽ chuyển từ bản ghi hiện tại sang bản ghi này. Bản ghi cũ vẫn được giữ.</Text>}
      {rows.map(row => <Checkbox.Item key={row.class_id}
        label={`#${row.class_id} ${row.class_name}\n${row.plant_name || "Chưa gán cây"}${row.disease_name ? ` · ${row.disease_name}` : ""}`}
        status={ai.selected.includes(row.class_id) ? "checked" : "unchecked"}
        onPress={() => ai.toggle(row.class_id)} disabled={disabled} />)}
      {!rows.length && <Text>Không có nhãn phù hợp. Bạn vẫn có thể lưu danh mục mà không gán nhãn AI.</Text>}
    </>}
  </View>;
}
const styles = StyleSheet.create({
  section: { gap: spacing.sm, marginVertical: spacing.md },
  error: { color: colors.statusError },
  warning: { color: colors.textPrimary, fontWeight: "600" },
});
