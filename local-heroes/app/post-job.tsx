import { router, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from './context/AuthContext';
import { authService } from './services/api';

export default function PostJobScreen() {
  const { user } = useAuth();
  const { jobId } = useLocalSearchParams(); // Get the job ID if editing
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [category, setCategory] = useState('');
  const [contact, setContact] = useState('');
  const [location, setLocation] = useState('');
  const [payment, setPayment] = useState('');
  const [description, setDescription] = useState('');
  const [mainTasks, setMainTasks] = useState('');
  const [minimumRequirements, setMinimumRequirements] = useState('');
  const [tags, setTags] = useState('');

  // Load existing job details if editing
  useEffect(() => {
    const loadJobDetails = async () => {
      if (jobId) {
        try {
          setIsEditing(true);
          const jobDetails = await authService.getTask(jobId as string);
          
          // Populate form with existing job details
          setJobTitle(jobDetails.title);
          setCategory(jobDetails.category || '');
          setContact(jobDetails.contact || '');
          setLocation(jobDetails.location || '');
          setPayment(jobDetails.price.toString());
          setDescription(jobDetails.description);
          
          // Parse description to extract main tasks and requirements
          const descriptionParts: string[] = jobDetails.description.split('\n\n');
          if (descriptionParts.length > 1) {
            const mainTasksIndex = descriptionParts.findIndex((part: string) => part.includes('Main Tasks:'));
            const requirementsIndex = descriptionParts.findIndex((part: string) => part.includes('Minimum Requirements:'));
            
            if (mainTasksIndex !== -1) {
              setMainTasks(descriptionParts[mainTasksIndex].replace('Main Tasks:', '').trim());
            }
            
            if (requirementsIndex !== -1) {
              setMinimumRequirements(descriptionParts[requirementsIndex].replace('Minimum Requirements:', '').trim());
            }
          }
          
          setTags(jobDetails.tags?.join(', ') || '');
        } catch (error) {
          console.error('Failed to load job details:', error);
          Alert.alert('Error', 'Failed to load job details');
        }
      }
    };

    loadJobDetails();
  }, [jobId]);

  const handlePostJob = async () => {
    // Validate required fields
    if (!jobTitle.trim()) {
      Alert.alert('Validation Error', 'Job title is required');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Validation Error', 'Job description is required');
      return;
    }
    if (!payment.trim() || isNaN(Number(payment))) {
      Alert.alert('Validation Error', 'Please enter a valid payment amount');
      return;
    }
    if (!user) {
      Alert.alert('Authentication Error', 'You must be logged in to post a job');
      return;
    }

    try {
      setIsLoading(true);

      // Prepare task data for backend
      const taskData = {
        title: jobTitle.trim(),
        description: `${description.trim()}${mainTasks.trim() ? '\n\nMain Tasks:\n' + mainTasks.trim() : ''}${
          minimumRequirements.trim() ? '\n\nMinimum Requirements:\n' + minimumRequirements.trim() : ''
        }`,
        location: location.trim() || undefined,
        price: Number(payment),
        category: category.trim() || undefined,
        tags: tags.trim()
          ? tags
              .split(',')
              .map((tag) => tag.trim())
              .filter((tag) => tag.length > 0)
          : undefined,
      };

      // Create or update the task via API
      let response;
      if (isEditing && jobId) {
        try {
          response = await authService.updateTask(jobId as string, taskData);
          Alert.alert('Success!', 'Your job has been updated successfully!', [
            {
              text: 'OK',
              onPress: () => router.push('/(tabs)/jobs'),
            },
          ]);
        } catch (updateError: any) {
          console.error('Error updating job:', updateError);
          Alert.alert(
            'Update Error', 
            updateError.message || 'Failed to update job. Please try again.', 
            [{ text: 'OK' }]
          );
          return;
        }
      } else {
        try {
          response = await authService.createTask(taskData);
          Alert.alert('Success!', 'Your job has been posted successfully!', [
            {
              text: 'OK',
              onPress: () => router.push('/(tabs)/jobs'),
            },
          ]);
        } catch (createError: any) {
          console.error('Error creating job:', createError);
          Alert.alert(
            'Post Error', 
            createError.message || 'Failed to post job. Please try again.', 
            [{ text: 'OK' }]
          );
          return;
        }
      }
    } catch (error: any) {
      console.error('Unexpected error:', error);
      Alert.alert('Unexpected Error', 'An unexpected error occurred. Please try again.', [{ text: 'OK' }]);
    } finally {
      setIsLoading(false);
    }
  };

  interface PlaceholderInputProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    multiline?: boolean;
    keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
    placeholder?: string;
  }

  const PlaceholderInput = ({
    label,
    value,
    onChangeText,
    multiline = false,
    keyboardType = 'default',
    placeholder = 'Enter value...',
  }: PlaceholderInputProps) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[styles.input, multiline && styles.multilineInput]}>
        <TextInput
          style={styles.textInput}
          placeholder={placeholder}
          placeholderTextColor="#999"
          value={value}
          onChangeText={onChangeText}
          multiline={multiline}
          keyboardType={keyboardType}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContainer}>
          <Text style={styles.title}>{isEditing ? 'Edit Job' : 'Post a Job'}</Text>
          <Text style={styles.subtitle}>
            {isEditing 
              ? 'Update the details of your existing job post' 
              : 'Nish dis faucibus pison lacus tristique'}
          </Text>
          <PlaceholderInput
            label="Job Title *"
            value={jobTitle}
            onChangeText={setJobTitle}
            placeholder="e.g. Garden maintenance, House cleaning..."
          />
          <PlaceholderInput
            label="Category"
            value={category}
            onChangeText={setCategory}
            placeholder="e.g. Gardening, Cleaning, Moving..."
          />
          <PlaceholderInput
            label="Contact"
            value={contact}
            onChangeText={setContact}
            placeholder="Your contact information..."
          />
          <PlaceholderInput
            label="Location"
            value={location}
            onChangeText={setLocation}
            placeholder="e.g. Amsterdam, Utrecht..."
          />
          <PlaceholderInput
            label="Payment (€) *"
            value={payment}
            onChangeText={setPayment}
            keyboardType="numeric"
            placeholder="e.g. 25, 50, 100..."
          />
          <PlaceholderInput
            label="Description *"
            value={description}
            onChangeText={setDescription}
            multiline={true}
            placeholder="Describe the job in detail..."
          />
          <PlaceholderInput
            label="Main Tasks"
            value={mainTasks}
            onChangeText={setMainTasks}
            multiline={true}
            placeholder="List the main tasks to be completed..."
          />
          <PlaceholderInput
            label="Minimum Requirements"
            value={minimumRequirements}
            onChangeText={setMinimumRequirements}
            multiline={true}
            placeholder="Specify any requirements or qualifications..."
          />
          <PlaceholderInput
            label="Tags (comma separated)"
            value={tags}
            onChangeText={setTags}
            placeholder="e.g. urgent, weekend, outdoor..."
          />
          <TouchableOpacity
            style={[styles.postButton, isLoading && styles.postButtonDisabled]}
            onPress={handlePostJob}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.postButtonText}>
                {isEditing ? 'Update Job' : 'Post Job'}
              </Text>
            )}
          </TouchableOpacity>
          <Text style={styles.noteText}>* Required fields. Your job will be visible to all users.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  formContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  multilineInput: {
    minHeight: 100,
  },
  textInput: {
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  postButton: {
    backgroundColor: '#0ca678',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
  postButtonDisabled: {
    opacity: 0.7,
  },
  postButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  noteText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
});
