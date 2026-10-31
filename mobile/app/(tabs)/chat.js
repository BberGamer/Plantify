import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import ChatHeader from "../../src/components/chat/ChatHeader";
import ChatWelcome from "../../src/components/chat/ChatWelcome";
import ChatComposerPreview from "../../src/components/chat/ChatComposerPreview";
import { colors, spacing } from "../../src/theme";

export default function ChatScreen() {
  const router = useRouter();

  function handleBack() {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)");
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ChatHeader onBack={handleBack} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ChatWelcome />
      </ScrollView>
      <ChatComposerPreview />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, justifyContent: "center", padding: spacing.xl, paddingVertical: spacing.xxxl },
});
