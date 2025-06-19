import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Header from "../components/Header";
import JobCard from "../components/JobCard";
import { Images } from "../constants/Images";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/api";
import { Task } from "../types/task";

export default function HomeScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [recentJobs, setRecentJobs] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Handle search functionality
  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push({
        pathname: "/(tabs)/jobs",
        params: { search: searchQuery.trim() },
      });
    } else {
      router.push("/(tabs)/jobs");
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  // Fetch recent jobs
  const loadRecentJobs = async () => {
    try {
      setLoading(true);
      const response = await authService.getTasks({ page: 1, limit: 5 });
      setRecentJobs(response.tasks);
    } catch (error) {
      console.error("Failed to load recent jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecentJobs();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ScrollView style={styles.scrollView}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchBar}
            placeholder="Search for jobs..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery ? (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearSearch}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={20} color="#666" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.searchIcon}
              onPress={handleSearch}
              activeOpacity={0.7}
            >
              <Ionicons name="search" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.recentJobsHeader}>
            <Text style={styles.recentJobsTitle}>Recent Jobs Available</Text>
            <Text style={styles.recentJobsSubtitle}>
              {loading
                ? "Loading..."
                : recentJobs.length > 0
                ? `Showing ${recentJobs.length} recent jobs`
                : "No recent jobs available"}
            </Text>
          </View>

          <View style={styles.jobCardsContainer}>
            {loading ? (
              <Text style={styles.loadingText}>Loading recent jobs...</Text>
            ) : recentJobs.length > 0 ? (
              recentJobs.map((job) => (
                <JobCard
                  key={job._id}
                  job={job}
                  onPress={() =>
                    router.push({
                      pathname: "/jobs/[id]",
                      params: { id: job._id },
                    })
                  }
                />
              ))
            ) : (
              <View style={styles.noJobsContainer}>
                <Text style={styles.noJobsText}>No recent jobs available</Text>
                <Text style={styles.noJobsSubtext}>
                  Check back later for new opportunities
                </Text>
                <TouchableOpacity
                  style={styles.browseJobsButton}
                  onPress={() => router.push("/(tabs)/jobs")}
                >
                  <Text style={styles.browseJobsButtonText}>
                    Browse All Jobs
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Promotional Section */}
          <View style={styles.promoContainer}>
            <Image
              source={Images.dummy}
              style={styles.promoImage}
              resizeMode="cover"
            />
            <Text style={styles.promoTitle}>Your chance to help someone</Text>
            <Text style={styles.promoDescription}>
              Be the one that makes someone else's day by signing up for a job.
            </Text>
            <TouchableOpacity
              style={styles.promoButton}
              onPress={() => router.push("/(tabs)/jobs")}
            >
              <Text style={styles.promoButtonText}>Search Job</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    position: "relative",
  },
  searchBar: {
    flex: 1,
    height: 48,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingRight: 45,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  searchIcon: {
    position: "absolute",
    right: 12,
    justifyContent: "center",
    alignItems: "center",
    width: 24,
    height: 24,
  },
  clearButton: {
    position: "absolute",
    right: 12,
    justifyContent: "center",
    alignItems: "center",
    width: 24,
    height: 24,
  },
  categories: {
    flexDirection: "row",
    marginBottom: 16,
  },
  category: {
    backgroundColor: "#eee",
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
  },
  promoContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  promoImage: {
    width: "100%",
    height: 120,
    borderRadius: 12,
    marginBottom: 16,
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    textAlign: "center",
    marginBottom: 8,
  },
  promoDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
  },
  promoButton: {
    backgroundColor: "#2BB6A3",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignItems: "center",
    width: "100%",
  },
  promoButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    paddingBottom: 24,
  },
  recentJobsHeader: {
    marginBottom: 20,
    alignItems: "center",
  },
  recentJobsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    textAlign: "center",
    marginBottom: 8,
  },
  recentJobsSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  jobCardsContainer: {
    marginBottom: 24,
  },
  loadingText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  noJobsContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  noJobsText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    textAlign: "center",
    marginBottom: 8,
  },
  noJobsSubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginBottom: 20,
  },
  browseJobsButton: {
    backgroundColor: "#2BB6A3",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  browseJobsButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  jobNameContainer: {
    marginBottom: 8,
  },
  jobName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
  },
  jobLocation: {
    fontSize: 14,
    color: "#666",
  },
  jobPrice: {
    fontSize: 14,
    color: "#2BB6A3",
  },
});
