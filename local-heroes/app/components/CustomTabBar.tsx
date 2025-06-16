import { FontAwesome } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React, { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

interface TabIcon {
  name: 'home' | 'briefcase' | 'plus' | 'envelope' | 'user' | 'gear' | 'info-circle';
  label: string;
}

const TAB_ICONS_MAP: Record<string, TabIcon> = {
  index: { name: 'home', label: 'Home' },
  jobs: { name: 'briefcase', label: 'Jobs' },
  post: { name: 'plus', label: 'Post' },
  inbox: { name: 'envelope', label: 'Inbox' },
  about: { name: 'info-circle', label: 'About Us' },
  settings: { name: 'gear', label: 'Settings' },
};

export default function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  // Create animated values for each tab
  const animatedValues = useRef(
    state.routes.map(() => ({
      scale: new Animated.Value(1),
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(0),
    }))
  ).current;

  // Update animations when the active tab changes
  useEffect(() => {
    state.routes.forEach((_, index) => {
      const isActive = state.index === index;
      const animations = [];

      // Scale animation
      animations.push(
        Animated.spring(animatedValues[index].scale, {
          toValue: isActive ? 1.2 : 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        })
      );

      // Opacity animation for label
      animations.push(
        Animated.timing(animatedValues[index].opacity, {
          toValue: isActive ? 1 : 0,
          duration: 200,
          useNativeDriver: true,
        })
      );

      // Translate Y animation
      animations.push(
        Animated.spring(animatedValues[index].translateY, {
          toValue: isActive ? -20 : 0,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        })
      );

      Animated.parallel(animations).start();
    });
  }, [state.index]);

  return (
    <View style={styles.tabBarContainer}>
      {/* Wavy background */}
      <View style={styles.wavyBackground}>
        <View style={styles.wave} />
      </View>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const icon = TAB_ICONS_MAP[route.name] || { name: 'home', label: 'Unknown' };
          const animatedStyle = {
            transform: [{ scale: animatedValues[index].scale }, { translateY: animatedValues[index].translateY }],
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
                  color={isFocused ? '#fff' : '#fff'}
                  style={isFocused ? { color: '#2BB6A3' } : {}}
                />
              </Animated.View>
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
