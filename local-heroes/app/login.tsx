import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useAuth } from "./context/AuthContext";

const LoginScreen = () => {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Handle login submission
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    try {
      await login(email, password);
      router.replace("/");
    } catch (err) {
      // Error is handled by the AuthContext
      console.error("Login error:", err);
    }
  };

  // Clear any previous errors when component mounts
  React.useEffect(() => {
    clearError();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>LocalHeroes</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={() => router.push("/login")}>
            <Text style={styles.headerButtonText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/register")}
            style={[styles.button, styles.registerButton]}
          >
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Login</Text>

        {error && <Text style={styles.errorText}>{error}</Text>}

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
          secureTextEntry={true}
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="password"
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.loginButtonText}>Login</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  errorText: {
    color: "red",
    marginBottom: 15,
    textAlign: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#F0F8F7",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: "#000",
  },
  logo: {
    fontSize: 24,
    fontWeight: "bold",
    color: '#FFFFFF',
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButtonText: {
    fontSize: 16,
    marginHorizontal: 10,
    color: '#FFFFFF',
  },
  formContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 40,
  },
  input: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: "#1ABC9C",
    paddingVertical: 15,
    paddingHorizontal: 80,
    borderRadius: 25,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  registerButton: {
    backgroundColor: "#1ABC9C",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
});

export default LoginScreen;
