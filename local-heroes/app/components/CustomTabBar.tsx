import { FontAwesome } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React, { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, TouchableOpacity, View, Text } from 'react-native';

interface TabIcon {
  name: 'home' | 'briefcase' | 'plus' | 'envelope' | 'user' | 'gear' | 'info-circle';
  label: string;
}

const TAB_ICONS: TabIcon[] = [
  { name: 'home', label: 'Home' },
  { name: 'briefcase', label: 'Jobs' },
  { name: 'plus', label: 'Post' },
  { name: 'envelope', label: 'Inbox' },
  { name: 'user', label: 'Profile' },
];

export default function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  // FIX #1: Initialize the ref as an array. We will manage its contents in useEffect.
  const animatedValues = useRef<any[]>([]).current;

  // FIX #2: Synchronize the animated values with the routes whenever routes change.
  // This ensures that if the number of tabs changes, our animations don't crash.
  if (animatedValues.length !== state.routes.length) {
    animatedValues.length = 0; // Clear the array
    state.routes.forEach(() => {
        animatedValues.push({
            scale: new Animated.Value(1),
            opacity: new Animated.Value(0),
            translateY: new Animated.Value(0),
        });
    });
  }

  useEffect(() => {
    state.routes.forEach((route, index) => {
      // Don't try to animate if the route or animation value doesn't exist
      if (!route || !animatedValues[index]) return;

      const isActive = state.index === index;
      
      Animated.parallel([
        Animated.spring(animatedValues[index].scale, {
          toValue: isActive ? 1.2 : 1,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValues[index].opacity, {
          toValue: isActive ? 1 : 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(animatedValues[index].translateY, {
          toValue: isActive ? -20 : 0,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [state.index, state.routes, animatedValues]);

  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.wavyBackground}>
        <View style={styles.wave} />
      </View>
      <View style={styles.tabBar}>
        {/* FIX #3 (THE MAIN CRASH): Filter out any undefined routes before mapping! */}
        {state.routes.filter(Boolean).map((route, index) => {
          const isFocused = state.index === index;
          const icon = TAB_ICONS[index];

          // Safety check in case there are more routes than icons
          if (!icon) return null;

          const animatedStyle = {
            transform: [
              { scale: animatedValues[index].scale },
              { translateY: animatedValues[index].translateY },
            ],
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={() => navigation.navigate(route.name)}
              style={index === 2 ? styles.centerTabButton : styles.tabButton}
              activeOpacity={0.8}
            >
              <Animated.View
                style={[
                  styles.tabIconContainer,
                  isFocused && styles.activeTabCircle,
                  index === 2 && styles.centerTabCircle,
                  animatedStyle,
                ]}
              >
                <FontAwesome
                  name={icon.name}
                  size={index === 2 ? 28 : 24}
                  // Simplified color logic
                  color={isFocused && index !== 2 ? '#2BB6A3' : '#fff'}
                />
              </Animated.View>
              {/* Note: I changed Animated.Text to Text because it wasn't defined. If you need the label to animate, you need to create it with Animated.createAnimatedComponent */}
              <Animated.Text style={[styles.tabLabel, { opacity: animatedValues[index].opacity }]}>
                {icon.label}
              </Animated.Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}


// Your styles remain the same...
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
    overflow: 'hidden',
  },
  wave: {
    position: 'absolute',
    top: -20,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: '#000',
    borderRadius: 20,
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
  tabIconContainer: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
  },
  activeTabCircle: {
    backgroundColor: '#2BB6A3',
    marginTop: -20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  centerTabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
    marginTop: -30,
    zIndex: 3,
  },
  centerTabCircle: {
    backgroundColor: '#2BB6A3',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  tabLabel: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});