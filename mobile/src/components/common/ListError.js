import { componentStyles } from "../../theme/componentStyles";
import { StyleSheet } from "react-native";
import { Button } from "react-native-paper";
import NoticeBanner from "./NoticeBanner";
import { spacing } from "../../theme";
export default function ListError({ message, onRetry, busy = false }) {
  return <NoticeBanner tone="error" message={message} style={styles.container}>
    {onRetry ? <Button style={componentStyles.buttonShape} contentStyle={componentStyles.button} onPress={onRetry} disabled={busy} loading={busy}>Thử lại</Button> : null}
  </NoticeBanner>;
}
const styles = StyleSheet.create({ container: { margin: spacing.lg } });
