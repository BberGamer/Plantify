import { StyleSheet } from "react-native";
import { IconButton } from "react-native-paper";
import ListHeader from "../../common/ListHeader";
import { colors } from "../../../theme";
export default function UserHeader({ totalUsers = 0, onAdd }) {
  return <ListHeader title="Người dùng" count={totalUsers} subtitle="Kết quả trong danh sách · tài khoản">
    <IconButton icon="plus" onPress={onAdd} accessibilityLabel="Thêm người dùng" iconColor={colors.white} style={styles.add} />
  </ListHeader>;
}
const styles = StyleSheet.create({ add: { backgroundColor: colors.primary, borderRadius: 12 } });
