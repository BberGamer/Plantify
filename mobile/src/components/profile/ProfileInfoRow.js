import { StyleSheet } from "react-native";
import { DetailRow } from "../common/DetailField";
import { colors } from "../../theme";
export default function InfoRow({ icon, label, value, last, action }) {
  return <DetailRow icon={icon} label={label} value={value} action={action} style={!last && styles.divider} />;
}
const styles = StyleSheet.create({ divider: { borderBottomWidth: 1, borderBottomColor: colors.borderLight } });
