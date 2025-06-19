import React from 'react';
import { Text, View, StyleSheet, Image, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import Header from './components/Header';

export default function AboutScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'About Us', headerShown: true }} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.title}>About LocalHeroes</Text>
          <View style={styles.heroImageContainer}>
            <Image source={require('../assets/images/localheroeslogo.png')} style={styles.logo} resizeMode="contain" />
          </View>
        </View>

        {/* Mission Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <FontAwesome5 name="bullseye" size={20} color="#2A9D8F" />
            <Text style={styles.sectionTitle}>Our Mission</Text>
          </View>
          <Text style={styles.cardText}>
            At LocalHeroes, we're dedicated to building stronger communities by connecting skilled individuals with
            local opportunities. Our platform makes it easy to find reliable professionals in your area or showcase your
            talents to those who need them.
          </Text>
        </View>

        {/* Vision Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <FontAwesome5 name="eye" size={20} color="#2A9D8F" />
            <Text style={styles.sectionTitle}>Our Vision</Text>
          </View>
          <Text style={styles.cardText}>
            We envision a world where communities thrive through local collaboration and mutual support. By empowering
            local talent and making quality services accessible to everyone, we're building a more connected and
            resilient society.
          </Text>
        </View>

        {/* Values Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <FontAwesome5 name="heart" size={20} color="#2A9D8F" />
            <Text style={styles.sectionTitle}>Our Values</Text>
          </View>

          <View style={styles.valueItem}>
            <View style={styles.valueIconContainer}>
              <FontAwesome5 name="handshake" size={16} color="#2A9D8F" />
            </View>
            <View style={styles.valueContent}>
              <Text style={styles.valueTitle}>Community First</Text>
              <Text style={styles.valueText}>We prioritize the needs of local communities in everything we do.</Text>
            </View>
          </View>

          <View style={styles.valueItem}>
            <View style={styles.valueIconContainer}>
              <FontAwesome5 name="shield-alt" size={16} color="#2A9D8F" />
            </View>
            <View style={styles.valueContent}>
              <Text style={styles.valueTitle}>Trust & Quality</Text>
              <Text style={styles.valueText}>
                We ensure reliable, high-quality services through our vetted professionals.
              </Text>
            </View>
          </View>

          <View style={styles.valueItem}>
            <View style={styles.valueIconContainer}>
              <FontAwesome5 name="users" size={16} color="#2A9D8F" />
            </View>
            <View style={styles.valueContent}>
              <Text style={styles.valueTitle}>Inclusivity</Text>
              <Text style={styles.valueText}>
                We welcome and support diverse talents and needs within our communities.
              </Text>
            </View>
          </View>
        </View>

        {/* Team Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <FontAwesome5 name="users" size={20} color="#2A9D8F" />
            <Text style={styles.sectionTitle}>Our Team</Text>
          </View>
          <Text style={styles.cardText}>
            LocalHeroes was founded by a passionate team of community advocates and tech innovators who believe in the
            power of local connections. Our diverse team brings together expertise in technology, community building,
            and service delivery.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8', // Light neutral background from design system
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 16,
    color: '#2A9D8F', // Primary color from design system
    textAlign: 'center',
  },
  heroImageContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginVertical: 16,
  },
  logo: {
    width: 200,
    height: 200,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#2A9D8F', // Primary color from design system
    width: '100%',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2A9D8F', // Primary color from design system
    marginLeft: 10,
  },
  cardText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#555',
  },
  valueItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  valueIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(42, 157, 143, 0.1)', // Primary color with opacity
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  valueContent: {
    flex: 1,
  },
  valueTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  valueText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
});
