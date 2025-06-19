// local-heroes/app/jobs/posted.tsx
// This screen displays the jobs that the logged-in user has posted.
// It will fetch job data and present it in a scrollable list with tabs for active and past jobs.

import React, { useState, useEffect, useCallback } from 'react';
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
import { Task, TaskStatus } from '../types/task';

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
  const [activeTab, setActiveTab] = useState<'Active' | 'Past'>('Active');

  // Moved fetchPostedJobs outside useEffect to be accessible for retry button
  // Using React.useCallback to prevent unnecessary re-creations of the function
  // It's still dependent on 'user' and other state setters
  const fetchPostedJobs = useCallback(async () => {
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

  const filteredJobs = postedJobs.filter((job) => {
    if (activeTab === 'Active') {
      return job.status === TaskStatus.OPEN || job.status === TaskStatus.IN_PROGRESS;
    } else {
      return job.status === TaskStatus.COMPLETED || job.status === TaskStatus.CANCELLED;
    }
  });

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
  if (filteredJobs.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <Ionicons name="document-text-outline" size={80} color="#CCC" />
          <Text style={styles.emptyText}>No {activeTab} Jobs</Text>
          <Text style={styles.emptyDescription}>
            You haven't posted any {activeTab} jobs yet. Start helping your community!
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render list of posted jobs
  return (
    <SafeAreaView style={styles.safeArea}>
      <Text style={styles.title}>My Posted Jobs</Text>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Active' && styles.activeTab]}
          onPress={() => setActiveTab('Active')}
        >
          <Text style={styles.tabText}>Active</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Past' && styles.activeTab]}
          onPress={() => setActiveTab('Past')}
        >
          <Text style={styles.tabText}>Past</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={filteredJobs}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={<Text style={styles.title}>My Posted Jobs</Text>}
        contentContainerStyle={styles.listContentContainer}
        renderItem={({ item }) => (
          <View style={styles.jobItem}>
            <View style={styles.iconContentContainer}>
              <Ionicons name="document-text-outline" size={24} color="#2A9D8F" />
            </View>
            <View style={styles.jobTextContainer}>
              <Text style={styles.jobTitle}>{item.title}</Text>
              <Text style={styles.jobDescription} numberOfLines={2}>
                {item.description}
              </Text>
              <Text style={styles.jobStatus}>Status: {item.status}</Text>
            </View>
            <TouchableOpacity style={styles.manageButton} onPress={() => router.push(`/jobs/manage/${item._id}`)}>
              <Text style={styles.manageButtonText}>Manage</Text>
            </TouchableOpacity>
          </View>
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
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 10,
  },
  activeTab: {
    backgroundColor: '#007bff',
  },
  tabText: {
    color: '#333',
    fontWeight: 'bold',
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
  jobStatus: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  manageButton: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  manageButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default MyPostedJobsScreen;
