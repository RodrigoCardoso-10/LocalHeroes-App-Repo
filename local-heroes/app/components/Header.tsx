import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

export default function Header() {
  return (
    <View style={styles.headerContainer}>
      <Link href="/(tabs)" asChild>
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/images/logo.jpg")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>LocalHero</Text>
        </View>
      </Link>
      <Link href="/settings" asChild>
        <View style={styles.settingsIcon}>
          <Ionicons name="settings-outline" size={28} color="#fff" />
        </View>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#000",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 28,
    height: 28,
    marginRight: 8,
    borderRadius: 6,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  settingsIcon: {
    padding: 8,
  },
});
