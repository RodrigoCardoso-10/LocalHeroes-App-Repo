import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext"; // Adjusted path for AuthContext

export default function SettingsScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
            router.replace("/login");
          } catch (error) {
            console.error("Logout error:", error);
            Alert.alert("Error", "Failed to logout. Please try again.");
          }
        },
      },
    ]);
  };
  const menuItems = [
    {
      id: "bank",
      title: "Bank Details",
      subtitle: "Manage you account details",
      icon: <MaterialIcons name="account-balance" size={24} color="#0ca678" />,
      href: "/bank-details",
    },
    {
      id: "privacy",
      title: "Privacy & Security",
      subtitle: "Change your Password",
      icon: <MaterialIcons name="privacy-tip" size={24} color="#0ca678" />,
      href: "/privacy",
    },
    {
      id: "support",
      title: "Customer Support",
      subtitle: "24/7 Customer team to help you",
      icon: <MaterialIcons name="support-agent" size={24} color="#0ca678" />,
      href: "/customer-support",
    },
    {
      id: "payment",
      title: "Payment Slips",
      subtitle: "Transaction details and Evidence",
      icon: (
        <MaterialCommunityIcons
          name="file-document-outline"
          size={24}
          color="#0ca678"
        />
      ),
      href: "/payment-slips",
    },
    {
      id: "about",
      title: "About Us",
      subtitle: "Learn more about LocalHeroes",
      icon: <MaterialIcons name="info-outline" size={24} color="#0ca678" />,
      href: "/about",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Header />
      {/* Settings Items */}
      <ScrollView
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Balance Section */}
        <View style={styles.balanceContainer}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceTitle}>Your Balance</Text>
            <Ionicons name="wallet-outline" size={24} color="#0ca678" />
          </View>
          <Text style={styles.balanceAmount}>€{user?.balance?.toFixed(2) ?? '0.00'}</Text>
          <TouchableOpacity
            style={styles.withdrawButton}
            onPress={() => Alert.alert('Coming Soon', 'This feature is not yet available.')}
          >
            <Text style={styles.withdrawButtonText}>Withdraw Funds</Text>
          </TouchableOpacity>
        </View>
        {/* Menu Items */}
        {menuItems.map((item) => (
          <TouchableOpacity
            style={styles.menuItem}
            key={item.id}
            onPress={() => router.navigate(item.href as any)}
          >
            <View style={styles.iconContainer}>{item.icon}</View>
            <View style={styles.menuItemText}>
              <Text style={styles.menuItemTitle}>{item.title}</Text>
              <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity>
        ))}
        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <View style={styles.iconContainer}>
            <Ionicons name="log-out-outline" size={24} color="#e03131" />
          </View>
          <View style={styles.menuItemText}>
            <Text style={styles.logoutText}>Logout</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.bottomSpace} />
      </ScrollView>
      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home-outline" size={24} color="#999" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MaterialIcons name="work-outline" size={24} color="#999" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <View style={styles.addButton}>
            <Ionicons name="add" size={24} color="white" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MaterialIcons name="mail-outline" size={24} color="#999" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
          <View style={styles.profileCircle}>
            <Text style={styles.profileText}>
              {user?.firstName?.charAt(0)?.toUpperCase() || "U"}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#000",
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  settingsIcon: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    alignItems: "center",
  },
  menuItemText: {
    flex: 1,
    marginLeft: 12,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  menuItemSubtitle: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#e03131",
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    height: 60,
  },
  navItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  activeNavItem: {
    borderTopWidth: 2,
    borderTopColor: "#0ca678",
  },
  addButton: {
    backgroundColor: "#0ca678",
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  profileCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#0ca678",
    justifyContent: "center",
    alignItems: "center",
  },
  profileText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  bottomSpace: {
    height: 80,
  },
  balanceContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0ca678',
    marginBottom: 20,
  },
  withdrawButton: {
    backgroundColor: '#0ca678',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  withdrawButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
