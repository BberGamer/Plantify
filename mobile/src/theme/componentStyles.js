import { StyleSheet } from "react-native";
import { colors } from "./colors";
import { control, radius } from "./tokens";

// Kích thước dùng chung; workflow sở hữu trạng thái và hành động.
export const componentStyles = StyleSheet.create({
  button: { minHeight: control.touchSize },
  buttonShape: { borderRadius: radius.input },
  dialog: { width: "90%", maxWidth: 560, alignSelf: "center", borderRadius: radius.sheet, backgroundColor: colors.white },
});
