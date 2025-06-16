import { Link } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const Login: React.FC = () => {
  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const handleChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = () => {
    // Handle login logic here
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#eaf7f6' }}>
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <Image source={require('../../assets/images/WhatsApp Image 2025-06-16 at 10.07.13_124fa1ed.jpg')} style={styles.logo} />
          <Text style={styles.brand}>LocalHero</Text>
        </View>
        <Link href="/sign-up" asChild>
          <TouchableOpacity style={styles.registerButton}>
            <Text style={styles.registerButtonText}>Register</Text>
          </TouchableOpacity>
        </Link>
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Login</Text>
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Email address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
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
            placeholder="Password"
            placeholderTextColor="#888"
            value={form.password}
            onChangeText={text => handleChange('password', text)}
            secureTextEntry
          />
        </View>
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    width: '100%',
    backgroundColor: '#000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 36,
    paddingBottom: 16,
    marginBottom: 24,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 6,
    marginRight: 8,
    resizeMode: 'cover',
  },
  brand: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
    letterSpacing: 1,
  },
  registerButton: {
    backgroundColor: '#2bb89b',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 6,
  },
  registerButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
  },
  fieldContainer: {
    width: 350,
    alignItems: 'flex-start',
    marginBottom: 0,
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
    borderWidth: 0, // Remove border
    borderColor: 'transparent', // Remove border color
    padding: 10,
    marginBottom: 8,
    marginTop: 0,
    color: '#000',
  },
  button: {
    width: 200,
    backgroundColor: '#2bb89b',
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 32,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default Login;
