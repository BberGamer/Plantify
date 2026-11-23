// app/_layout.js - Root layout: kiem tra auth va dieu huong theo role

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PaperProvider } from "react-native-paper";
import { paperTheme } from "../src/theme/paperTheme";
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
        <Stack screenOptions={{ headerShown: false }} />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
