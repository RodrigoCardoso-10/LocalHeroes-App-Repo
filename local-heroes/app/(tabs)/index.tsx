import { router } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Header from '../components/Header';
import { Images } from '../constants/Images';
import { AuthProvider, useAuth } from '../context/AuthContext';

export default function HomeScreen() {
  const { isLoggedIn } = useAuth();

  return (
    <AuthProvider>
      <View style={styles.container}>
        <Header isLoggedIn={isLoggedIn} />
        <ScrollView style={styles.scrollView}>
          {/* Search Bar */}
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/jobs')}
          >
            <TextInput
              style={styles.searchBar}
              placeholder="Search for jobs..."
              editable={false}
              pointerEvents="none"
            />
          </TouchableOpacity>

          {/* Job Categories */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories}>
            <TouchableOpacity style={styles.category}>
              <Text style={styles.categoryText}>Plumbing</Text>
            </TouchableOpacity>
            {/* Add more categories as needed */}
          </ScrollView>

          {/* Promotional Section */}
          <View style={styles.promoContainer}>
            <Image
              source={Images.dummy}
              style={styles.promoImage}
              resizeMode="cover"
            />
            <Text style={styles.promoTitle}>Good Life Begins With A Good Company</Text>
            <Text style={styles.promoDescription}>
              Unlock opportunities with our handpicked list of companies. Explore the offers, compare, and find the best fit for you with confidence.
            </Text>
            <TouchableOpacity 
              style={styles.promoButton}
              onPress={() => router.push('/(tabs)/jobs')}
            >
              <Text style={styles.promoButtonText}>Search Job</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  searchBar: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  categories: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  category: {
    backgroundColor: '#eee',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
  },
  promoContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  promoImage: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    marginBottom: 16,
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    marginBottom: 8,
  },
  promoDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  promoButton: {
    backgroundColor: '#2BB6A3',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignItems: 'center',
    width: '100%',
  },
  promoButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});