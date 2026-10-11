import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="plant/[id]" options={{ headerShown: false, presentation: 'modal' }} />
    </Stack>
  );
}
