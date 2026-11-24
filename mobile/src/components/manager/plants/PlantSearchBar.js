import { StyleSheet, View } from "react-native";
import SearchField from "../../common/SearchField";
import { layout, spacing } from "../../../theme";

export default function PlantSearchBar({ value, onChange }) {
  return <View style={styles.container}>
    <SearchField value={value} onChangeText={onChange} placeholder="Tìm cây trồng…" accessibilityLabel="Tìm cây trồng" />
  </View>;
}
const styles = StyleSheet.create({
  container: { width: "100%", maxWidth: layout.content, alignSelf: "center", paddingHorizontal: spacing.xl, paddingBottom: spacing.md },
});
