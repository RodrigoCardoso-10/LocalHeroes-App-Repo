import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const SignUp: React.FC = () => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    gender: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = () => {
    // Handle registration logic here
  };

  return (
    <ScrollView style={{ backgroundColor: '#eaf7f6', flex: 1 }} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Register</Text>
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>First Name</Text>
        <TextInput
          style={styles.input}
          placeholder="First Name"
          placeholderTextColor="#888"
          value={form.firstName}
          onChangeText={text => handleChange('firstName', text)}
        />
      </View>
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Last Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Last Name"
          placeholderTextColor="#888"
          value={form.lastName}
          onChangeText={text => handleChange('lastName', text)}
        />
      </View>
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Date of Birth</Text>
        <TextInput
          style={styles.input}
          placeholder="DD-MM-YYYY"
          placeholderTextColor="#888"
          value={form.dob}
          onChangeText={text => handleChange('dob', text)}
        />
      </View>
      <View style={styles.fieldContainer}>
        <Text style={[styles.label]}>Gender</Text>
        <View style={{ flexDirection: 'row', width: '100%', marginBottom: 8 }}>
          <TouchableOpacity
            style={[styles.genderOption, form.gender === 'Male' && styles.genderOptionSelected]}
            onPress={() => handleChange('gender', 'Male')}
          >
            <Text style={form.gender === 'Male' ? styles.genderTextSelected : styles.genderText}>Male</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.genderOption, form.gender === 'Female' && styles.genderOptionSelected]}
            onPress={() => handleChange('gender', 'Female')}
          >
            <Text style={form.gender === 'Female' ? styles.genderTextSelected : styles.genderText}>Female</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. +31 6 5555 555"
          placeholderTextColor="#888"
          value={form.phone}
          onChangeText={text => handleChange('phone', text)}
          keyboardType="phone-pad"
        />
      </View>
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Email address</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. johndoe@email.com"
          placeholderTextColor="#888"
          value={form.email}
          onChangeText={text => handleChange('email', text)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          placeholderTextColor="#888"
          value={form.password}
          onChangeText={text => handleChange('password', text)}
          secureTextEntry
        />
      </View>
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Re-enter your password"
          placeholderTextColor="#888"
          value={form.confirmPassword}
          onChangeText={text => handleChange('confirmPassword', text)}
          secureTextEntry
        />
      </View>
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  label: {
    alignSelf: 'flex-start',
    marginBottom: 4,
    marginTop: 16,
    fontWeight: 'bold',
    fontSize: 13,
    textAlign: 'left',
    width: '100%',
    paddingLeft: 0,
    fontFamily: 'System',
    letterSpacing: 0.1,
  },
  input: {
    width: '100%',
    maxWidth: 350,
    backgroundColor: '#fff',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 8,
    marginTop: 0,
    color: '#000',
  },
  button: {
    width: '100%',
    maxWidth: 350,
    backgroundColor: '#2bb89b',
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  genderOption: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginRight: 8,
    marginLeft: 0,
    marginTop: 0,
  },
  genderOptionSelected: {
    backgroundColor: '#2bb89b',
  },
  genderText: {
    color: '#000',
  },
  genderTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  fieldContainer: {
    width: 350,
    alignItems: 'flex-start',
    marginBottom: 0,
  },
});

export default SignUp;
