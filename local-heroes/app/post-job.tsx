import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Header from './components/Header';
import { authService } from './services/api';
import { useAuth } from './context/AuthContext';

export default function PostJobScreen() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [category, setCategory] = useState('');
  const [contact, setContact] = useState('');
  const [location, setLocation] = useState('');
  const [payment, setPayment] = useState('');
  const [description, setDescription] = useState('');
  const [mainTasks, setMainTasks] = useState('');
  const [minimumRequirements, setMinimumRequirements] = useState('');
  const [tags, setTags] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');

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
        experienceLevel: experienceLevel.trim() || undefined,
      };

      // Create the task via API
      await authService.createTask(taskData);

      Alert.alert('Success!', 'Your job has been posted successfully!', [
        {
          text: 'OK',
          onPress: () => router.push('/(tabs)/jobs'),
        },
      ]);
    } catch (error: any) {
      console.error('Error posting job:', error);
      Alert.alert('Error', error.message || 'Failed to post job. Please try again.', [{ text: 'OK' }]);
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
      <Header />
      <ScrollView style={styles.scrollView}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Post a Job</Text>
          <Text style={styles.subtitle}>Nish dis faucibus pison lacus tristique</Text>{' '}
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
            label="Experience Level"
            value={experienceLevel}
            onChangeText={setExperienceLevel}
            placeholder="e.g. No experience, Beginner, Expert..."
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
              <Text style={styles.postButtonText}>Post Job</Text>
            )}
          </TouchableOpacity>
          <Text style={styles.noteText}>* Required fields. Your job will be visible to all users once posted.</Text>
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
  formContainer: {
    padding: 20,
    backgroundColor: '#F1F7F6',
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1E5E1',
    borderStyle: 'dashed',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  multilineInput: {
    minHeight: 100,
    paddingTop: 12,
  },
  textInput: {
    fontSize: 14,
    color: '#333',
  },
  postButton: {
    backgroundColor: '#2A9D8F',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  postButtonDisabled: {
    backgroundColor: '#A0A0A0',
  },
  postButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  noteText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
});
