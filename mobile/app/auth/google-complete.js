import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import RegisterForm from "../../src/components/auth/RegisterForm";
import useGoogleRegistration from "../../src/hooks/useGoogleRegistration";
import { colors } from "../../src/theme/colors";

export default function GoogleCompleteScreen() {
  const registration = useGoogleRegistration();
  return <SafeAreaView style={styles.screen}>
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        {registration.expired ? <View><Text accessibilityRole="alert">Phiên đăng ký Google đã hết hạn hoặc không tồn tại. Vui lòng chọn tài khoản Google lại.</Text>
          <Button disabled={registration.loading} onPress={registration.cancel}>Quay lại đăng nhập</Button></View> : <>
          {!!registration.error && <Text accessibilityRole="alert" style={styles.error}>{registration.error}</Text>}
          <RegisterForm googleMode form={registration.form} loading={registration.loading}
            onChange={registration.change} onSubmit={registration.submit} onLogin={registration.cancel} />
        </>}
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  content: { padding: 24, width: "100%", maxWidth: 560, alignSelf: "center", flexGrow: 1 },
  error: { color: colors.statusError, marginBottom: 16 },
});
