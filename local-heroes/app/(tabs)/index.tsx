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
        params: { search: searchQuery.trim() }
      });
    } else {
      router.push("/(tabs)/jobs");
    }
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

  // Sample job data based on the Figma design (fallback)
  const jobData = [
    {
      id: 1,
      title: "Financial Security Analyst",
      company: "Tech Solutions Inc.",
      location: "New York",
      type: "Full-time",
      salary: "$70k - $90k",
      logo: require("../../assets/images/dummy.jpg"),
      color: "#F0F8F7",
    },
    {
      id: 2,
      title: "Software Quality Facilitator",
      company: "Innovate Corp.",
      location: "Remote",
      type: "Part-time",
      salary: "$60k - $80k",
      logo: require("../../assets/images/dummy.jpg"),
      color: "#F7F0F8",
    },
    {
      id: 3,
      title: "Internal Integration Planner",
      company: "Global Ventures",
      location: "San Francisco",
      type: "Full-time",
      salary: "$80k - $100k",
      logo: require("../../assets/images/dummy.jpg"),
      color: "#F8F7F0",
    },
    {
      id: 4,
      title: "District Intranet Coordinator",
      company: "City Connect",
      location: "Chicago",
      type: "Contract",
      salary: "$40k - $60k",
      logo: require("../../assets/images/dummy.jpg"),
      color: "#F0F8F7",
    },
    {
      id: 5,
      title: "Customer Service Facilitator",
      company: "Service First",
      location: "Austin",
      type: "Full-time",
      salary: "$50k - $70k",
      logo: require("../../assets/images/dummy.jpg"),
      color: "#F7F0F8",
    },
  ];

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
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearch}
            activeOpacity={0.7}
          >
            <Text style={styles.searchButtonText}>🔍</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.recentJobsHeader}>
            <Text style={styles.recentJobsTitle}>Recent Jobs Available</Text>
            <Text style={styles.recentJobsSubtitle}>
              {loading
                ? "Loading..."
                : `Showing ${recentJobs.length > 0 ? recentJobs.length : jobData.length} recent jobs`}
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
              jobData.map((job) => (
                <JobCard
                  key={job.id}
                  job={{
                    _id: job.id.toString(),
                    title: job.title,
                    description: job.company || "No description",
                    location: job.location,
                    price:
                      typeof job.salary === "string"
                        ? parseInt(job.salary.replace(/[^0-9]/g, "")) || 0
                        : 0,
                    category: job.type,
                    tags: [],
                    status: "OPEN",
                    postedBy: { firstName: "Company", lastName: "" },
                  }}
                  onPress={() =>
                    router.push({
                      pathname: "/jobs/[id]",
                      params: { id: job.id },
                    })
                  }
                />
              ))
            )}
          </View>

          {/* Promotional Section */}
          <View style={styles.promoContainer}>
            <Image
              source={Images.dummy}
              style={styles.promoImage}
              resizeMode="cover"
            />
            <Text style={styles.promoTitle}>
              Your chance to help someone
            </Text>
            <Text style={styles.promoDescription}>
              Be the on that makes someone else's day by signing up 
              for a job.
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
  },
  searchBar: {
    flex: 1,
    height: 48,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  searchButton: {
    marginLeft: 8,
    backgroundColor: "#2BB6A3",
    borderRadius: 8,
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  searchButtonText: {
    fontSize: 18,
    color: "#fff",
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
    fontSize: 24,
    fontWeight: "bold",
    color: "#222",
    textAlign: "center",
    marginBottom: 8,
  },
  recentJobsSubtitle: {
    fontSize: 16,
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