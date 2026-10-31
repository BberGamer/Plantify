import { StyleSheet, TextInput, View } from "react-native";
import { ActivityIndicator, Button, IconButton, Text } from "react-native-paper";
import { colors, radius, spacing, typography } from "../../theme";

export default function ChatComposer({ draft, onChange, onSend, sending, error }) {
  return (
    <View style={styles.footer}>
      <View style={styles.content}>
        {!!error && <View accessibilityLiveRegion="polite">
          <Text style={styles.error}>{error}</Text>
          {!!draft.trim() && <Button onPress={onSend} disabled={sending}>Thử lại</Button>}
        </View>}
        <View style={styles.composer}>
          <TextInput style={styles.input} placeholder="Hỏi về cây của bạn…"
            placeholderTextColor={colors.textSecondary} accessibilityLabel="Nội dung tin nhắn"
            value={draft} onChangeText={onChange} editable={!sending} maxLength={2000} multiline />
          {sending ? <ActivityIndicator style={styles.loader} accessibilityLabel="AI đang trả lời" /> :
            <IconButton icon="arrow-up" mode="contained" containerColor={colors.lightMint}
              iconColor={colors.primary} accessibilityLabel="Gửi tin nhắn"
              disabled={!draft.trim()} onPress={onSend} />}
        </View>
        <Text style={styles.caption}>AI có thể nhầm lẫn. Hội thoại chỉ được giữ tạm trên màn hình này.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md, backgroundColor: colors.background },
  content: { width: "100%", maxWidth: 560, alignSelf: "center" },
  composer: { flexDirection: "row", alignItems: "center", paddingLeft: spacing.lg, borderRadius: radius.pill, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  input: { ...typography.body, flex: 1, color: colors.textPrimary, minHeight: 50, maxHeight: 140, paddingVertical: spacing.md },
  loader: { margin: spacing.lg },
  error: { ...typography.body, color: colors.statusError },
  caption: { ...typography.caption, textAlign: "center", color: colors.textSecondary, marginTop: spacing.sm },
});
