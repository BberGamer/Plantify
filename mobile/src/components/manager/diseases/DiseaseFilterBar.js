import { StyleSheet, View } from "react-native";
import SearchField from "../../common/SearchField";
import { FilterChip, FilterRow } from "../../common/FilterControls";
import { layout, spacing } from "../../../theme";

const OPTIONS = [
  { value: "", label: "Tất cả" },
  { value: "active", label: "Đang dùng" },
  { value: "inactive", label: "Tạm ẩn" },
];
export default function DiseaseFilterBar({ search, status, onSearchChange, onStatusChange }) {
  return <View style={styles.container}>
    <SearchField value={search} onChangeText={onSearchChange} placeholder="Tìm tên bệnh hoặc triệu chứng…" accessibilityLabel="Tìm bệnh cây" />
    <FilterRow accessibilityLabel="Trạng thái bệnh cây">
      {OPTIONS.map(option => <FilterChip key={option.value || "all"} selected={status === option.value}
        onPress={() => onStatusChange(option.value)}>{option.label}</FilterChip>)}
    </FilterRow>
  </View>;
}
const styles = StyleSheet.create({
  container: { width: "100%", maxWidth: layout.content, alignSelf: "center", paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md, gap: spacing.md },
});
