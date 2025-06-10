import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

const HomePage = () => {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <ProtectedRoute>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.logo}>LocalHero</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity onPress={handleLogout}>
              <Text style={styles.headerButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Welcome, {user?.firstName || 'User'}!</Text>
            <Text style={styles.subtitle}>You are now connected to the server.</Text>
          </View>
          
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Your Profile</Text>
            <View style={styles.profileInfo}>
              <Text style={styles.infoLabel}>Name:</Text>
              <Text style={styles.infoValue}>{user?.firstName} {user?.lastName}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{user?.email}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.infoLabel}>Role:</Text>
              <Text style={styles.infoValue}>{user?.role || 'User'}</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(tabs)')}>
            <Text style={styles.actionButtonText}>Explore App</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </ProtectedRoute>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F8F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButtonText: {
    fontSize: 16,
    marginHorizontal: 10,
    color: '#1ABC9C',
  },
  content: {
    padding: 20,
  },
  welcomeSection: {
    marginBottom: 30,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  profileInfo: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  infoLabel: {
    width: 80,
    fontWeight: 'bold',
  },
  infoValue: {
    flex: 1,
  },
  actionButton: {
    backgroundColor: '#1ABC9C',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomePage;