import React from 'react';
import { Image as RNImage, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Images } from '../constants/Images';

interface HeaderProps {
  showAuthButtons?: boolean;
}

export default function Header({ showAuthButtons = true }: HeaderProps) {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerLeft}>
        <Image source={Images.logo} style={styles.headerLogo} />
      <TouchableOpacity style={styles.headerLeft} onPress={() => router.push('/')}>
        <RNImage source={Images.logo} style={styles.headerLogo} />
        <Text style={styles.headerTitle}>LocalHeroes</Text>
      </View>
      {showAuthButtons && (
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.loginButton}>
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.registerButton}>
            <Text style={styles.registerText}>Register</Text>
          </TouchableOpacity>
        </View>
      )}
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
    backgroundColor: '#fff',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginButton: {
    marginRight: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: '#e0e0e0',
  },
  loginText: {
    color: '#222',
    fontWeight: '500',
  },
  registerButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: '#2bb6a3',
  },
  registerText: {
    color: '#fff',
    fontWeight: '500',
  },
  headerLogo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
}); 