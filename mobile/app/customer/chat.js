import { useRef } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import ChatHeader from "../../src/components/chat/ChatHeader";
import ChatWelcome from "../../src/components/chat/ChatWelcome";
import ChatComposer from "../../src/components/chat/ChatComposer";
import useChat from "../../src/hooks/useChat";
import { colors, spacing } from "../../src/theme";

export default function ChatScreen() {
  const router = useRouter();
  const scroll = useRef(null);
  const chat = useChat();

  function handleBack() {
    if (router.canGoBack()) router.back();
    else router.replace("/customer/home");
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ChatHeader onBack={handleBack} />
      <View style={styles.tools}>
        <Button onPress={chat.newConversation} disabled={chat.sending}>Cuộc trò chuyện mới</Button>
        <Button onPress={chat.reloadHistory} disabled={chat.sending || chat.loadingHistory}>Tải lịch sử</Button>
      </View>
      <KeyboardAvoidingView style={styles.body} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView ref={scroll} contentContainerStyle={[styles.content, !chat.messages.length && styles.empty]}
          keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })}>
          {chat.loadingHistory && <ActivityIndicator accessibilityLabel="Đang tải lịch sử" />}
          {!!chat.historyError && <Text style={styles.pending}>{chat.historyError}</Text>}
          {chat.hasOlder && <Text style={styles.pending}>Đang hiển thị các lượt gần nhất. Lịch sử đầy đủ vẫn được lưu trên máy chủ.</Text>}
          {!chat.messages.length && !chat.loadingHistory ? <ChatWelcome onSelect={chat.changeDraft} /> :
            <View style={styles.thread}>
              {chat.messages.map((message, index) => <View key={message.id || index}
                onLayout={message.role === "assistant" ? () => chat.markDisplayed(message.id) : undefined}
                style={[styles.bubble, message.role === "user" ? styles.user : styles.assistant]}>
                <Text style={styles.speaker}>{message.role === "user" ? "Bạn" : "Trợ lý AI"}</Text>
                <Text selectable style={styles.message}>{message.content}</Text>
                {message.role === "assistant" && Number.isFinite(message.client_response_ms) &&
                  <Text style={styles.timing}>Thời gian trả lời: {(message.client_response_ms / 1000).toFixed(2)} giây</Text>}
                {message.timing_error && <Text style={styles.timing}>Chưa lưu được thời gian đo; bạn có thể ghi lại thủ công.</Text>}
              </View>)}
            </View>}
          {chat.sending && <View style={styles.thread} accessibilityLiveRegion="polite">
            <Text style={styles.pending}>{chat.draft}</Text>
            <Text style={styles.pending}>AI đang trả lời…</Text>
          </View>}
        </ScrollView>
        <ChatComposer draft={chat.draft} onChange={chat.changeDraft} onSend={chat.send}
          sending={chat.sending || chat.loadingHistory} error={chat.error} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1 },
  tools: { flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap" },
  content: { flexGrow: 1, padding: spacing.xl, paddingVertical: spacing.xxxl },
  empty: { justifyContent: "center" },
  thread: { width: "100%", maxWidth: 560, alignSelf: "center", gap: spacing.md },
  bubble: { padding: spacing.lg, borderRadius: 16, marginBottom: spacing.md, maxWidth: "95%" },
  user: { alignSelf: "flex-end", backgroundColor: colors.lightMint },
  assistant: { alignSelf: "flex-start", backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  speaker: { fontSize: 12, fontWeight: "700", color: colors.primary, marginBottom: spacing.xs },
  message: { fontSize: 15, lineHeight: 23, color: colors.textPrimary },
  pending: { color: colors.textSecondary, marginVertical: spacing.sm },
  timing: { color: colors.textSecondary, fontSize: 12, marginTop: spacing.sm },
});
