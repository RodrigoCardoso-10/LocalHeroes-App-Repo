import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from './context/AuthContext';

const RegisterScreen = () => {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuth();

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Handle registration submission
  const handleRegister = async () => {
    console.log('Register button pressed');

    // Reset any previous errors
    clearError();

    // Basic validation
    if (!firstName || !lastName || !email || !password) {
      console.log('Validation failed: Missing required fields');
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      console.log('Validation failed: Passwords do not match');
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('Validation failed: Invalid email format');
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    // Password validation
    if (password.length < 6) {
      console.log('Validation failed: Password too short');
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    try {
      console.log('All validation passed, starting registration process...');
      console.log('Registration data:', { firstName, lastName, email });

      await register({
        firstName,
        lastName,
        email,
        password,
      });

      console.log('Registration successful, navigating to home');
      router.replace('/');
    } catch (err) {
      // Error is handled by the AuthContext, but we can show an alert here too
      console.error('Registration error in component:', err);
      Alert.alert('Registration Failed', error || 'Could not create account. Please try again later.');
    }
  };

  // Clear any previous errors when component mounts
  React.useEffect(() => {
    clearError();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>LocalHero</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={styles.headerButtonText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/register')} style={[styles.button, styles.registerButton]}>
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.formContainer}>
        <Text style={styles.title}>Register</Text>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TextInput style={styles.input} placeholder="First Name" value={firstName} onChangeText={setFirstName} />
        <TextInput style={styles.input} placeholder="Last Name" value={lastName} onChangeText={setLastName} />
        <TextInput
          style={styles.input}
          placeholder="Email address"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity style={styles.registerSubmitButton} onPress={handleRegister} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.registerButtonText}>Register</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  errorText: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#F0F8F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButtonText: {
    fontSize: 16,
    marginHorizontal: 10,
  },
  formContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  input: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  registerSubmitButton: {
    backgroundColor: '#1ABC9C',
    paddingVertical: 15,
    paddingHorizontal: 80,
    borderRadius: 25,
    marginTop: 10,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  registerButton: {
    backgroundColor: '#1ABC9C',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});

export default RegisterScreen;
