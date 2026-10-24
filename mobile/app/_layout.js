// app/_layout.js - Root layout: kiem tra auth va dieu huong theo role

import { useEffect } from 'react';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { useAuthStore } from '../store/authStore';

// === Dinh nghia route tuong ung voi tung role ===
const ROLE_ROUTES = {
  admin: '/admin/users',
  manager: '/manager/plants',
  customer: '/(tabs)',
};

/**
 * Guard component: theo doi trang thai auth va dieu huong tuong ung.
 * Dung useRootNavigationState().key de dam bao Stack da mount truoc khi navigate,
 * tranh loi "Attempted to navigate before mounting the Root Layout".
 *
 * @returns {null} Khong render UI
 */
function AuthGuard() {
  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();
  const { isAuthenticated, isLoading, user, loadUser } = useAuthStore();

  // Load session da luu tu AsyncStorage khi mo app lan dau
  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    // Phai doi ca 2: navigator mount xong (key ton tai) VA auth load xong
    if (!navigationState?.key || isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inAdminGroup = segments[0] === 'admin';
    const inManagerGroup = segments[0] === 'manager';

    if (!isAuthenticated) {
      // Chua dang nhap -> chuyen ve login
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
    } else {
      // Da dang nhap ma dang o trang auth -> chuyen theo role
      if (inAuthGroup) {
        const role = user?.role || 'customer';
        const destination = ROLE_ROUTES[role] || '/(tabs)';
        router.replace(destination);
      }

      // Moi role chi duoc o trong khu vuc route cua chinh minh.
      if (inAdminGroup && user?.role !== 'admin') {
        router.replace(ROLE_ROUTES[user?.role] || '/(tabs)');
      } else if (inManagerGroup && user?.role !== 'manager') {
        router.replace(ROLE_ROUTES[user?.role] || '/(tabs)');
      }
    }
  }, [navigationState?.key, isAuthenticated, isLoading, segments, user]);

  return null;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <StatusBar style="dark" />
        <AuthGuard />
        <Stack screenOptions={{ headerShown: false }} />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
