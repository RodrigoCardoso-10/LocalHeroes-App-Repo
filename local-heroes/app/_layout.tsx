import React from 'react';
import { AuthProvider } from './context/AuthContext';
// import Header from './components/Header'; // Removed as it's only needed in specific screens or via individual options

export default function TabLayout() {
  return (
    <AuthProvider>
      <Tabs tabBar={props => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
        {/* No need to manually list screens */}
      </Tabs>
    </AuthProvider>
  );
}
