import { StyleSheet, View } from "react-native";
import SearchField from "../common/SearchField";
import { FilterChip, FilterRow } from "../common/FilterControls";
import { layout, spacing } from "../../theme";

export default function PlantDirectoryFilters({
  categories,
  activeCategoryId,
  value,
  onSearchChange,
  onSearchClear,
  onSelectCategory,
}) {
  return (
    <View style={styles.container}>
      <SearchField
        value={value}
        onChangeText={onSearchChange}
        onClear={onSearchClear}
        placeholder="Tìm tên cây hoặc tên khoa học…"
        accessibilityLabel="Tìm cây theo tên thường hoặc tên khoa học"
      />
      <FilterRow accessibilityLabel="Danh mục cây">
        {categories.map((category) => (
          <FilterChip
            key={category._id}
            selected={activeCategoryId === category._id}
            onPress={() => onSelectCategory(category._id)}
          >
            {category.category_name}
          </FilterChip>
        ))}
      </FilterRow>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    width: "100%",
    maxWidth: layout.content,
    alignSelf: "center",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.md,
  },
});
