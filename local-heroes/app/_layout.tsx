import { Tabs } from 'expo-router';
import CustomTabBar from './components/CustomTabBar';
import { AuthProvider } from './context/AuthContext';

export default function TabLayout() {
  return (
    <AuthProvider>
      <Tabs tabBar={props => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
        {/* No need to manually list screens */}
      </Tabs>
    </AuthProvider>
  );
}
