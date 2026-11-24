import { StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../../theme";
import ScreenHeader from "../common/ScreenHeader";

export default function ChatHeader({ onBack }) {
  return <ScreenHeader title="Trợ lý AI" subtitle="Người bạn chăm cây" onBack={onBack}>
    <View style={styles.avatar} accessible={false}>
      <MaterialCommunityIcons name="robot-happy-outline" size={23} color={colors.primary} />
    </View>
  </ScreenHeader>;
}

const styles = StyleSheet.create({
  avatar: { width: 44, height: 44, margin: 2, borderRadius: 16, backgroundColor: colors.lightMint,
    alignItems: "center", justifyContent: "center" },
});
