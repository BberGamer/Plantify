import { StyleSheet, View } from "react-native";
import { ActivityIndicator, IconButton } from "react-native-paper";
import { colors } from "../../theme/colors";
import ScreenHeader from "../common/ScreenHeader";

export default function PlantDetailHeader({
  saved, showFavorite = false, busy = false, canSave, onBack, onToggleSaved,
}) {
  return <ScreenHeader title="Chi tiết cây" onBack={onBack}>
    {showFavorite ? busy ? <View style={styles.loading}>
      <ActivityIndicator size={20} color={colors.primary} accessibilityLabel="Đang cập nhật yêu thích" />
    </View> : <IconButton icon={saved ? "heart" : "heart-outline"} size={20}
      iconColor={colors.primary} style={saved ? styles.saved : undefined}
      accessibilityLabel={saved ? "Bỏ yêu thích cây" : "Yêu thích cây"}
      accessibilityState={{ disabled: !canSave, selected: saved }}
      onPress={onToggleSaved} disabled={!canSave} /> : null}
  </ScreenHeader>;
}

const styles = StyleSheet.create({
  loading: { width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  saved: { backgroundColor: colors.lightMint },
});
