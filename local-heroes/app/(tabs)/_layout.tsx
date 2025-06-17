import { Tabs } from 'expo-router';
import React from 'react';
import CustomTabBar from '../components/CustomTabBar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      {' '}
      <Tabs.Screen name="index" options={{}} />
      <Tabs.Screen name="jobs" options={{}} />
      <Tabs.Screen name="post" options={{}} />
      <Tabs.Screen name="inbox" options={{}} />
      <Tabs.Screen name="about" options={{}} />
      <Tabs.Screen name="settings" options={{}} />
    </Tabs>
  );
}
