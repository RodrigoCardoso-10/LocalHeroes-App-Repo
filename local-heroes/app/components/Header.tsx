import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Constants from 'expo-constants';

export default function Header() {
  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity style={styles.logoContainer} onPress={() => router.push('/(tabs)')}>
        <Image source={require('../../assets/images/logo.jpg')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.headerTitle}>LocalHero</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.settingsIcon} onPress={() => router.push('/(tabs)/settings')}>
        <Ionicons name="settings-outline" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Constants.statusBarHeight,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: '#000',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 28,
    height: 28,
    marginRight: 8,
    borderRadius: 6,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  settingsIcon: {
    padding: 8,
  },
});
