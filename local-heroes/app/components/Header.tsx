import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Header() {
  const router = useRouter();

  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity style={styles.headerLeft} onPress={() => router.push('/')}>
        <Image source={Images.logo} style={styles.headerLogo} />
        <Text style={styles.headerTitle}>LocalHeroes</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/settings')}>
      <Ionicons name="settings-outline" size={24} color="white" />
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
    backgroundColor: '#000',
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
}); 