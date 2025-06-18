// local-heroes/app/jobs/posted.tsx
// This screen displays the jobs that the logged-in user has posted.
// It will fetch job data and present it in a scrollable list.

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Alert,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router'; // Import useRouter for navigation (e.g., to job details)
import { Ionicons } from '@expo/vector-icons'; // For icons in job items
// CONFIRMED CORRECTED PATHS by User:
import { useAuth } from '../././context/AuthContext';
import { authService } from '../././services/api';
import { Task } from '../types/task';

// Placeholder for User interface.
// FIX: Confirmed 'id' is the property name for the user's ID
interface User {
  id: string; // Changed from _id to id to match the error's expectation
  // Add other user properties here if needed (e.g., email, firstName, lastName)
}

/**
 * MyPostedJobsScreen Component
 * Displays a list of jobs that the current user has posted.
 */
const MyPostedJobsScreen = () => {
  const router = useRouter();
  // Ensure useAuth provides a 'user' object with an 'id' property.
  // FIX: Type assertion to clarify 'user' has an 'id' property.
  const { user } = useAuth() as { user: User | null };
  const [postedJobs, setPostedJobs] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Moved fetchPostedJobs outside useEffect to be accessible for retry button
  // Using React.useCallback to prevent unnecessary re-creations of the function
  // It's still dependent on 'user' and other state setters
  const fetchPostedJobs = React.useCallback(async () => {
    // FIX: Changed user?._id to user?.id to resolve TypeScript error
    if (!user?.id) {
      // Use user.id as the user identifier
      console.warn('User not logged in or user ID not available. Cannot fetch posted jobs.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true); // Set loading true before fetch starts
      setError(null);

      // FIX: Changed user._id to user.id in the API call
      const response = await authService.getTasks({ postedBy: user.id });
      setPostedJobs(response.tasks);
    } catch (err: any) {
      console.error('Failed to fetch posted jobs:', err);
      setError(err.message || 'Could not load posted jobs.');
      Alert.alert('Error', err.message || 'Failed to load posted jobs.');
    } finally {
      setLoading(false);
    }
  }, [user]); // Dependencies for useCallback: re-create function if 'user' changes

  useEffect(() => {
    // Call the memoized fetchPostedJobs function when component mounts or user changes
    fetchPostedJobs();
  }, [fetchPostedJobs]); // Dependency for useEffect: re-run when fetchPostedJobs itself changes (due to its dependencies)

  /**
   * handleJobPress
   * Navigates to the details page for a specific posted job.
   * This might show applicants, job status, etc.
   */
  const handleJobPress = (jobId: string) => {
    // Example: router.push(`/jobs/posted/${jobId}`);
    console.log(`Navigating to posted job details for: ${jobId}`);
    Alert.alert('Posted Job Details', `Navigating to details for posted job ID: ${jobId}`);
    // You would navigate to a detailed view for a job the user has posted
  };

  // Render loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2A9D8F" />
          <Text style={styles.loadingText}>Loading your posted jobs...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render error state
  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={50} color="#DC3545" />
          <Text style={styles.errorText}>Error: {error}</Text>
          <TouchableOpacity onPress={fetchPostedJobs} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Render empty state
  if (postedJobs.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <Ionicons name="document-text-outline" size={80} color="#CCC" />
          <Text style={styles.emptyText}>No Posted Jobs</Text>
          <Text style={styles.emptyDescription}>You haven't posted any jobs yet. Start helping your community!</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render list of posted jobs
  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={postedJobs}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={<Text style={styles.title}>My Posted Jobs</Text>}
        contentContainerStyle={styles.listContentContainer}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.jobItem} onPress={() => handleJobPress(item._id)}>
            <View style={styles.iconContentContainer}>
              <Ionicons name="document-text-outline" size={24} color="#2A9D8F" />
            </View>
            <View style={styles.jobTextContainer}>
              <Text style={styles.jobTitle}>{item.title}</Text>
              <Text style={styles.jobDescription} numberOfLines={2}>
                {item.description}
              </Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={24} color="#999" />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    padding: 16,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#DC3545',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 15,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
    paddingHorizontal: 30,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContentContainer: {
    padding: 16,
  },
  jobItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  iconContentContainer: {
    padding: 8,
    backgroundColor: '#e0f8f0', // Light green background for posted jobs icon
    borderRadius: 20,
    marginRight: 15,
  },
  jobTextContainer: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  jobDescription: {
    fontSize: 14,
    color: '#666',
  },
});

export default MyPostedJobsScreen;
