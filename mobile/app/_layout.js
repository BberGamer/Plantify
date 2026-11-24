// app/_layout.js - Root layout: kiem tra auth va dieu huong theo role

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PaperProvider } from "react-native-paper";
import { paperTheme } from "../src/theme/paperTheme";
import { StyleSheet, View } from "react-native";
import { colors } from "../src/theme/colors";
import WebFocusRing from "../src/theme/WebFocusRing";
import useAuthNavigation from "../src/hooks/useAuthNavigation";
import usePushNotifications from "../src/hooks/usePushNotifications";

function AuthGuard() {
  useAuthNavigation();
  usePushNotifications();
  return null;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <StatusBar style="dark" />
        <AuthGuard />
        <WebFocusRing />
        <View nativeID="plantify-app" style={styles.workspace}>
          <View style={styles.application}>
            <Stack screenOptions={{ headerShown: false, contentStyle: styles.scene }} />
          </View>
        </View>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  workspace: {
    flex: 1,
    backgroundColor: colors.softSproutBg
  },
  application: {
    flex: 1,
    width: "100%",
    maxWidth: 1200,
    alignSelf: "center",
    backgroundColor: colors.background
  },
  scene: {
    backgroundColor: colors.background
  }
});
