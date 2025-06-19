import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { authService } from './services/api';
import { Task } from './types/task';

export default function ApplyScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [job, setJob] = useState<Task | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const task = await authService.getTaskById(id as string);
        setJob(task);
      } catch (error) {
        Alert.alert('Error', 'Failed to load job details.');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchJobDetails();
    }
  }, [id]);
  const handleSubmitApplication = async () => {
    if (!job) return;

    setSubmitting(true);
    try {
      console.log('Submitting application for job:', {
        jobId: job._id,
        jobTitle: job.title,
        jobStatus: job.status,
      });
      await authService.applyForTask(job._id);
      Alert.alert('Success', 'Your application has been submitted successfully.');
      router.push('/(tabs)/jobs');
    } catch (error: any) {
      console.error('Apply submission error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        fullError: error,
      });
      Alert.alert('Error', error.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2A9D8F" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Apply for {job?.title}</Text>
        <Text style={styles.company}>
          at {job?.postedBy?.firstName} {job?.postedBy?.lastName}
        </Text>

        <Text style={styles.label}>Your Cover Letter (Optional)</Text>
        <TextInput
          style={styles.textArea}
          multiline
          numberOfLines={10}
          placeholder="Write a brief message to the employer..."
          value={coverLetter}
          onChangeText={setCoverLetter}
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmitApplication} disabled={submitting}>
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Application</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  company: {
    fontSize: 18,
    color: '#666',
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    height: 200,
    textAlignVertical: 'top',
    marginBottom: 24,
  },
  submitButton: {
    backgroundColor: '#2A9D8F',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
