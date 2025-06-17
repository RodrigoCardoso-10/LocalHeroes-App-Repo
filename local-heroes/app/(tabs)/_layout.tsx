// app/(tabs)/_layout.tsx

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
      {' '}
      <Tabs.Screen name="index" options={{}} />
      <Tabs.Screen name="jobs" options={{}} />
      <Tabs.Screen name="post" options={{}} />
      <Tabs.Screen name="inbox" options={{}} />
      <Tabs.Screen name="profile" options={{}} />
      
      {/* Add these missing screens */}
      <Tabs.Screen name="about" options={{}} />
      <Tabs.Screen name="contact" options={{}} />
      <Tabs.Screen name="settings" options={{}} />
    </Tabs>
  );
}