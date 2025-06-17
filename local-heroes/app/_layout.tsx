import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Stack, Tabs } from 'expo-router';
import React from 'react';
import CustomTabBar from './components/CustomTabBar';
import { AuthProvider } from './context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="jobs/[id]" options={{ headerShown: false }} />
      </Stack>
      <Tabs tabBar={(props: BottomTabBarProps) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
        <Tabs.Screen name="index" options={{ title: 'Home' }} />
        <Tabs.Screen name="jobs" options={{ title: 'Jobs' }} />
        <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      </Tabs>
    </AuthProvider>
  );
}
