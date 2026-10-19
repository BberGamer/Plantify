// app/admin/_layout.js - Layout khu vuc Admin: chi cho phep role admin hoac manager

import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';

// Cac role duoc phep truy cap khu vuc admin
const ALLOWED_ROLES = ['admin', 'manager'];

export default function AdminLayout() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;

    // Chua dang nhap -> ve login
    if (!isAuthenticated) {
      router.replace('/(auth)/login');
      return;
    }

    // Dang nhap nhung khong co quyen -> ve trang chu
    if (!ALLOWED_ROLES.includes(user?.role)) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, user]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F9FAF9' },
      }}
    />
  );
}
