import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Header from './components/Header';

export default function PostJobScreen() {
  const [jobTitle, setJobTitle] = useState('');
  const [category, setCategory] = useState('');
  const [contact, setContact] = useState('');
  const [location, setLocation] = useState('');
  const [payment, setPayment] = useState('');
  const [description, setDescription] = useState('');
  const [mainTasks, setMainTasks] = useState('');
  const [minimumRequirements, setMinimumRequirements] = useState('');
  const [tags, setTags] = useState('');

  const handlePostJob = () => {
    // Here you would implement the API call to post the job
    console.log('Posting job:', { 
      jobTitle, category, contact, location, payment, 
      description, mainTasks, minimumRequirements, tags 
    });
    
    // Navigate back to jobs screen after posting
    router.push('/(tabs)/jobs');
  };

  interface PlaceholderInputProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    multiline?: boolean;
  }

  const PlaceholderInput = ({ label, value, onChangeText, multiline = false }: PlaceholderInputProps) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[styles.input, multiline && styles.multilineInput]}>
        <TextInput
          style={styles.textInput}
          placeholder="Placeholder"
          placeholderTextColor="#999"
          value={value}
          onChangeText={onChangeText}
          multiline={multiline}
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
          <Text style={styles.subtitle}>Nish dis faucibus pison lacus tristique</Text>
          
          <PlaceholderInput 
            label="Job Title" 
            value={jobTitle} 
            onChangeText={setJobTitle} 
          />
          
          <PlaceholderInput 
            label="Category" 
            value={category} 
            onChangeText={setCategory} 
          />
          
          <PlaceholderInput 
            label="Contact" 
            value={contact} 
            onChangeText={setContact} 
          />
          
          <PlaceholderInput 
            label="Location" 
            value={location} 
            onChangeText={setLocation} 
          />
          
          <PlaceholderInput 
            label="Payment" 
            value={payment} 
            onChangeText={setPayment} 
          />
          
          <PlaceholderInput 
            label="Description" 
            value={description} 
            onChangeText={setDescription}
            multiline={true} 
          />
          
          <PlaceholderInput 
            label="Main Tasks" 
            value={mainTasks} 
            onChangeText={setMainTasks}
            multiline={true} 
          />
          
          <PlaceholderInput 
            label="Minimum Requirements" 
            value={minimumRequirements} 
            onChangeText={setMinimumRequirements}
            multiline={true} 
          />
          
          <PlaceholderInput 
            label="Tags" 
            value={tags} 
            onChangeText={setTags} 
          />
          
          <TouchableOpacity 
            style={styles.postButton}
            onPress={handlePostJob}
          >
            <Text style={styles.postButtonText}>Post Job</Text>
          </TouchableOpacity>
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
  postButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
