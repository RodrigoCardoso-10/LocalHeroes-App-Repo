import { Tabs } from 'expo-router';
import React from 'react';
import CustomTabBar from '../components/CustomTabBar';
import Header from '../components/Header';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: true,
        header: () => <Header />,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="jobs" />
      <Tabs.Screen name="post" />
      <Tabs.Screen name="inbox" />
      <Tabs.Screen name="about" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}
