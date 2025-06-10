import { FontAwesome } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TabIcon {
  name: 'home' | 'briefcase' | 'plus' | 'envelope' | 'user';
  label: string;
}

const TAB_ICONS: TabIcon[] = [
  { name: 'home', label: 'Home' },
  { name: 'briefcase', label: 'Job' },
  { name: 'plus', label: 'Post a Job' },
  { name: 'envelope', label: 'Inbox' },
  { name: 'user', label: 'Profile' },
];

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.wavyBackground} />
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const icon = TAB_ICONS[index];

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={() => navigation.navigate(route.name)}
              style={index === 2 ? styles.centerTabButton : styles.tabButton}
              activeOpacity={0.8}
            >
              <View style={isFocused ? styles.activeTabCircle : null}>
                <FontAwesome
                  name={icon.name}
                  size={index === 2 ? 28 : 24}
                  color={isFocused ? '#fff' : '#fff'}
                  style={isFocused ? { color: '#2BB6A3' } : {}}
                />
              </View>
              {isFocused && icon.label ? (
                <Text style={styles.tabLabel}>{icon.label}</Text>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{}} />
      <Tabs.Screen name="jobs" options={{}} />
      <Tabs.Screen name="post" options={{}} />
      <Tabs.Screen name="inbox" options={{}} />
      <Tabs.Screen name="profile" options={{}} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 80,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  wavyBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 80,
    backgroundColor: '#000',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    width: '100%',
    height: 80,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    zIndex: 2,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
  },
  activeTabCircle: {
    backgroundColor: '#2BB6A3',
    borderRadius: 28,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
    marginTop: -20,
    zIndex: 2,
  },
  tabLabel: {
    color: '#fff',
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  centerTabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
    marginTop: -30,
    zIndex: 3,
  },
});
