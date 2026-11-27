import { StyleSheet, View } from "react-native";
import LoadingState from "../common/LoadingState";
import EmptyState from "../common/EmptyState";
import ListError from "../common/ListError";
export default function TreatmentStateView({
  loading,
  error,
  empty,
  onRetry,
  loadingMessage = "Đang tải thông tin điều trị...",
}) {
  return <View style={styles.container}>{loading ? <LoadingState message={loadingMessage} />
    : error ? <ListError message={error} onRetry={onRetry} /> : <EmptyState title={empty} />}</View>;
}
const styles = StyleSheet.create({ container: { flex: 1, minHeight: 280, justifyContent: "center" } });
