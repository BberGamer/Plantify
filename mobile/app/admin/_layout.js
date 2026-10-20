// app/admin/_layout.js - Layout khu vuc Admin: chi cho phep role admin hoac manager

import { useEffect } from 'react';
import { Tabs, useRootNavigationState, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';

// Cac role duoc phep truy cap khu vuc admin
const ALLOWED_ROLES = ['admin', 'manager'];

export default function AdminLayout() {
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    // Wait for the root Stack and persisted session before redirecting.
    if (!navigationState?.key || isLoading) return;

    // Chua dang nhap -> ve login
    if (!isAuthenticated) {
      router.replace('/(auth)/login');
      return;
    }

    // Dang nhap nhung khong co quyen -> ve trang chu
    if (!ALLOWED_ROLES.includes(user?.role)) {
      router.replace('/(tabs)');
    }
  }, [navigationState?.key, isAuthenticated, isLoading, user]);

  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#144D37', tabBarInactiveTintColor: '#8A938D', tabBarStyle: { height: 64, paddingTop: 7, paddingBottom: 7, borderTopColor: '#E8ECE9', backgroundColor: '#FFFFFF' }, contentStyle: { backgroundColor: '#F9FAF9' } }}>
      <Tabs.Screen name="plants" options={{ title: 'Plant', tabBarLabel: 'Plant', tabBarIcon: ({ color, size }) => <Ionicons name="leaf-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="diseases" options={{ title: 'Disease', tabBarLabel: 'Disease', tabBarIcon: ({ color, size }) => <Ionicons name="bug-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="treatments" options={{ title: 'Treatment', tabBarLabel: 'Treatment', tabBarIcon: ({ color, size }) => <Ionicons name="medkit-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarLabel: 'Profile', tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="users" options={{ href: null }} />
      <Tabs.Screen name="index" options={{ href: null }} />
    </Tabs>
  );
}
