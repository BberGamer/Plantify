import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../../theme/colors";

export default function FaqFormModal({ form, draft, error, busy, onClose, onChangeField, onSave, onChangeApproval }) {
  if (!form) return null;
  const review = form.review;
  return <Modal visible animationType="slide" onRequestClose={onClose}>
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text variant="titleLarge">{review ? "Xem xét FAQ" : form.item ? "Sửa FAQ" : "Tạo FAQ"}</Text>
          <Text>Ngôn ngữ: Tiếng Việt · {form.item?.status === "approved" ? "Đã duyệt" : "Bản nháp"}</Text>
          {!review && <Text>Lưu nội dung sẽ chuyển FAQ về bản nháp. Chat chỉ dùng FAQ đã được duyệt.</Text>}
          <TextInput mode="outlined" label="Chủ đề" value={draft.topic} editable={!review && !busy} maxLength={150} onChangeText={value => onChangeField("topic", value)} />
          <TextInput mode="outlined" label="Câu hỏi chính" multiline value={draft.question} editable={!review && !busy} maxLength={1000} onChangeText={value => onChangeField("question", value)} />
          <TextInput mode="outlined" label="Câu hỏi tương đương (mỗi dòng một câu)" multiline value={draft.aliases} editable={!review && !busy} onChangeText={value => onChangeField("aliases", value)} />
          <TextInput mode="outlined" label="Câu trả lời" multiline value={draft.answer} editable={!review && !busy} maxLength={12000} onChangeText={value => onChangeField("answer", value)} />
          {review && <Text>{form.item.status === "approved" ? "Gỡ duyệt sẽ ngừng sử dụng FAQ này trong chat." : "Hãy kiểm tra toàn bộ nội dung trước khi xác nhận duyệt. Chat sẽ trả nguyên câu trả lời này khi khớp câu hỏi."}</Text>}
          {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
          <View style={styles.actions}>
            <Button disabled={busy} onPress={onClose}>Đóng</Button>
            <Button mode="contained" disabled={busy} loading={busy} onPress={review ? onChangeApproval : onSave}>
              {review ? form.item.status === "approved" ? "Xác nhận gỡ duyệt" : "Xác nhận duyệt" : "Lưu"}
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  </Modal>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 18, gap: 16, width: "100%", maxWidth: 760, alignSelf: "center" },
  actions: { flexDirection: "row", justifyContent: "flex-end", flexWrap: "wrap" },
  error: { color: colors.statusError },
});
