import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image as RNImage, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Header() {
  const router = useRouter();

  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity
        style={styles.headerLeft}
        onPress={() => {
          console.log('Logo pressed');
          router.push('/');
        }}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <RNImage source={require('../../assets/images/logo.jpg')} style={styles.headerLogo} />
        <Text style={styles.headerTitle}>LocalHero</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.settingsIcon} onPress={() => router.push('/settings')} activeOpacity={0.7}>
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
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  settingsIcon: {
    padding: 8,
  },
  headerLogo: {
    width: 40,
    height: 40,
    marginRight: 10,
    borderRadius: 8,
  },
}); 