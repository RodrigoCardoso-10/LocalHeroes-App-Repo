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
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from './context/AuthContext';
import { authService } from './services/api';

// Dutch cities with coordinates for better map integration
const DUTCH_CITIES = [
  { name: 'Amsterdam', lat: 52.3676, lng: 4.9041 },
  { name: 'Rotterdam', lat: 51.9225, lng: 4.47917 },
  { name: 'The Hague', lat: 52.0705, lng: 4.3007 },
  { name: 'Utrecht', lat: 52.0907, lng: 5.1214 },
  { name: 'Eindhoven', lat: 51.4416, lng: 5.4697 },
  { name: 'Groningen', lat: 53.2194, lng: 6.5665 },
  { name: 'Tilburg', lat: 51.5555, lng: 5.0913 },
  { name: 'Almere', lat: 52.3508, lng: 5.2647 },
  { name: 'Breda', lat: 51.5719, lng: 4.7683 },
  { name: 'Nijmegen', lat: 51.8426, lng: 5.8518 },
  { name: 'Enschede', lat: 52.2215, lng: 6.8937 },
  { name: 'Haarlem', lat: 52.3874, lng: 4.6462 },
  { name: 'Arnhem', lat: 51.9851, lng: 5.8987 },
  { name: 'Zaanstad', lat: 52.45, lng: 4.8182 },
  { name: 'Amersfoort', lat: 52.1518, lng: 5.3878 },
];

const JOB_CATEGORIES = [
  'Gardening',
  'Cleaning',
  'Moving',
  'Pet Care',
  'Handyman',
  'Technology',
  'Tutoring',
  'Delivery',
  'Event Help',
  'Other',
];

export default function PostJobScreen() {
  const { user } = useAuth();
  const { jobId } = useLocalSearchParams(); // Get the job ID if editing
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [category, setCategory] = useState('');
  const [contact, setContact] = useState('');
  const [location, setLocation] = useState('');
  const [specificAddress, setSpecificAddress] = useState('');
  const [payment, setPayment] = useState('');
  const [description, setDescription] = useState('');
  const [mainTasks, setMainTasks] = useState('');
  const [minimumRequirements, setMinimumRequirements] = useState('');
  const [tags, setTags] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  // New state for improved UX
  const [showCityModal, setShowCityModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCity, setSelectedCity] = useState<{ name: string; lat: number; lng: number } | null>(null);

  // Load existing job details if editing
  useEffect(() => {
    const loadJobDetails = async () => {
      if (jobId) {
        try {
          setIsEditing(true);
          // Fix: Use the correct API method name
          const jobDetails = await authService.getTaskById(jobId as string);

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
            const requirementsIndex = descriptionParts.findIndex((part: string) =>
              part.includes('Minimum Requirements:')
            );

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
    // Enhanced validation for map integration
    if (!jobTitle.trim()) {
      Alert.alert('Validation Error', 'Job title is required');
      return;
    }
    if (!category.trim()) {
      Alert.alert('Validation Error', 'Please select a category');
      return;
    }
    if (!location.trim()) {
      Alert.alert('Validation Error', 'Please select a city');
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
    if (!latitude.trim() || isNaN(Number(latitude))) {
      Alert.alert('Validation Error', 'Please enter a valid latitude or select a city');
      return;
    }
    if (!longitude.trim() || isNaN(Number(longitude))) {
      Alert.alert('Validation Error', 'Please enter a valid longitude or select a city');
      return;
    }
    if (!user) {
      Alert.alert('Authentication Error', 'You must be logged in to post a job');
      return;
    }
    try {
      setIsLoading(true);

      // Prepare enhanced task data for backend and map display
      const taskData = {
        title: jobTitle.trim(),
        description: `${description.trim()}${mainTasks.trim() ? '\n\nMain Tasks:\n' + mainTasks.trim() : ''}${
          minimumRequirements.trim() ? '\n\nMinimum Requirements:\n' + minimumRequirements.trim() : ''
        }`,
        // Backend expects location in this format
        location: {
          address: specificAddress.trim() ? `${location.trim()}, ${specificAddress.trim()}` : location.trim(),
          point: {
            type: 'Point' as const,
            coordinates: [Number(longitude), Number(latitude)],
          },
        },
        price: Number(payment),
        category: category.trim(),
        tags: tags.trim()
          ? tags
              .split(',')
              .map((tag) => tag.trim())
              .filter((tag) => tag.length > 0)
          : [],
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
          Alert.alert('Update Error', updateError.message || 'Failed to update job. Please try again.', [
            { text: 'OK' },
          ]);
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
          Alert.alert('Post Error', createError.message || 'Failed to post job. Please try again.', [{ text: 'OK' }]);
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

  // Helper function to handle city selection
  const handleCitySelect = (city: { name: string; lat: number; lng: number }) => {
    setSelectedCity(city);
    setLocation(city.name);
    setLatitude(city.lat.toString());
    setLongitude(city.lng.toString());
    setShowCityModal(false);
  };

  // Helper function to handle category selection
  const handleCategorySelect = (selectedCategory: string) => {
    setCategory(selectedCategory);
    setShowCategoryModal(false);
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
              : 'Create a detailed job posting that will be visible on the map and job listings'}
          </Text>
          <PlaceholderInput
            label="Job Title *"
            value={jobTitle}
            onChangeText={setJobTitle}
            placeholder="e.g. Garden maintenance, House cleaning..."
          />
          {/* Category Selector */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Category *</Text>
            <TouchableOpacity style={styles.selectorButton} onPress={() => setShowCategoryModal(true)}>
              <Text style={[styles.selectorText, !category && styles.placeholderText]}>
                {category || 'Select a category...'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>
          <PlaceholderInput
            label="Contact"
            value={contact}
            onChangeText={setContact}
            placeholder="Your contact information..."
          />
          {/* Location Selector */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>City *</Text>
            <TouchableOpacity style={styles.selectorButton} onPress={() => setShowCityModal(true)}>
              <Text style={[styles.selectorText, !location && styles.placeholderText]}>
                {location || 'Select a city...'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>
          {/* Specific Address */}
          <PlaceholderInput
            label="Specific Address (Optional)"
            value={specificAddress}
            onChangeText={setSpecificAddress}
            placeholder="Street address, postal code, or landmark..."
            multiline={true}
          />
          {/* Coordinates - Auto-filled but editable */}
          <View style={styles.coordinatesContainer}>
            <View style={styles.coordinateField}>
              <PlaceholderInput
                label="Latitude"
                value={latitude}
                onChangeText={setLatitude}
                keyboardType="numeric"
                placeholder="52.3676"
              />
            </View>
            <View style={styles.coordinateField}>
              <PlaceholderInput
                label="Longitude"
                value={longitude}
                onChangeText={setLongitude}
                keyboardType="numeric"
                placeholder="4.9041"
              />
            </View>
          </View>
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
              <Text style={styles.postButtonText}>{isEditing ? 'Update Job' : 'Post Job'}</Text>
            )}
          </TouchableOpacity>
          <Text style={styles.noteText}>* Required fields. Your job will be visible to all users.</Text>
        </View>
      </ScrollView>
      {/* City Selection Modal */}
      <Modal visible={showCityModal} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select a City</Text>
            <FlatList
              data={DUTCH_CITIES}
              keyExtractor={(item) => item.name}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalItem} onPress={() => handleCitySelect(item)}>
                  <Text style={styles.modalItemText}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowCityModal(false)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Category Selection Modal */}
      <Modal visible={showCategoryModal} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select a Category</Text>
            <FlatList
              data={JOB_CATEGORIES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalItem} onPress={() => handleCategorySelect(item)}>
                  <Text style={styles.modalItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowCategoryModal(false)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  selectorButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    padding: 12,
    minHeight: 48,
  },
  selectorText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  coordinatesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  coordinateField: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
  },
  modalCloseButton: {
    marginTop: 16,
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#666',
  },
});
