// local-heroes/app/job-manager.tsx
// This file defines the 'My Job Manager' screen, designed to be a tab in the app.

import { Link, useRouter, Stack } from 'expo-router'; // Import Link and useRouter for navigation
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons for icons
import Header from '../components/Header';

/**
 * JobManagerScreen Component
 * This screen serves as a central hub for users to manage their jobs,
 * offering navigation to active jobs and jobs they have posted.
 */
const JobManagerScreen = () => {
  const router = useRouter(); // Initialize the router for programmatic navigation

  /**
   * handleActiveJobsPress
   * Navigates to the 'My Active Jobs' section.
   * This route needs to be created (e.g., /jobs/active or a new screen).
   */
  const handleActiveJobsPress = () => {
    // Navigate to the 'my-active-jobs' screen.
    // You would create 'local-heroes/app/jobs/active.tsx' or a similar file for this route.
    router.push('/jobs/active'); // Placeholder route
    console.log('Navigating to My Active Jobs');
  };

  /**
   * handlePostedJobsPress
   * Navigates to the 'My Posted Jobs' section.
   * This route also needs to be created (e.g., /jobs/posted or a new screen).
   */
  const handlePostedJobsPress = () => {
    // Navigate to the 'my-posted-jobs' screen.
    // You would create 'local-heroes/app/jobs/posted.tsx' or a similar file for this route.
    router.push('/jobs/posted'); // Placeholder route
    console.log('Navigating to My Posted Jobs');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <Header />
      <View style={styles.container}>
        <Text style={styles.title}>Job Manager</Text>

        {/* Section for "My Active Jobs" */}
        <TouchableOpacity style={styles.optionButton} onPress={handleActiveJobsPress}>
          <View style={styles.iconBackground}>
            <Ionicons name="briefcase-outline" size={28} color="#007bff" />
          </View>
          <Text style={styles.buttonText}>My Active Jobs</Text>
          <Ionicons name="chevron-forward-outline" size={24} color="#666" />
        </TouchableOpacity>

        {/* Spacer for visual separation */}
        <View style={styles.spacer} />

        {/* Section for "My Posted Jobs" */}
        <TouchableOpacity style={styles.optionButton} onPress={handlePostedJobsPress}>
          <View style={styles.iconBackground}>
            <Ionicons name="document-text-outline" size={28} color="#2A9D8F" />
          </View>
          <Text style={styles.buttonText}>My Posted Jobs</Text>
          <Ionicons name="chevron-forward-outline" size={24} color="#666" />
        </TouchableOpacity>

        <Text style={styles.descriptionText}>
          Manage applications for your posted jobs and track the status of jobs you're currently working on.
        </Text>
      </View>
    </SafeAreaView>
  );
};

// Stylesheet for the JobManagerScreen component, inspired by InboxScreen styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f4f8', // Light background for the screen
  },
  container: {
    flex: 1,
    alignItems: 'center', // Center content horizontally
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 40,
    textAlign: 'center',
  },
  optionButton: {
    flexDirection: 'row', // Arrange items horizontally
    alignItems: 'center', // Align items vertically in the center
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 15, // Space between buttons
    width: '90%', // Make buttons wide
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4, // Android shadow
  },
  iconBackground: {
    backgroundColor: '#E0E7FF', // Light blue background for icons
    borderRadius: 20,
    padding: 8,
    marginRight: 15,
  },
  buttonText: {
    flex: 1, // Allow text to take up available space
    color: '#333',
    fontSize: 18,
    fontWeight: '600',
  },
  spacer: {
    height: 15, // Additional space between the two main options
  },
  descriptionText: {
    marginTop: 30,
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
});
export default JobManagerScreen;
