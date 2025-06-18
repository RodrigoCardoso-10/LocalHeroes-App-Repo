import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Header from '../components/Header';
import JobCard from '../components/JobCard';
import { Images } from '../constants/Images';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { Task } from '../types/task';

export default function HomeScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [recentJobs, setRecentJobs] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Fetch recent jobs
  const loadRecentJobs = async () => {
    try {
      setLoading(true);
      const response = await authService.getTasks({ page: 1, limit: 5 });
      setRecentJobs(response.tasks);
    } catch (error) {
      console.error('Failed to load recent jobs:', error);
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
      title: 'Financial Security Analyst',
      company: 'Tech Solutions Inc.',
      location: 'New York',
      type: 'Full-time',
      salary: '$70k - $90k',
      logo: require('../../assets/images/dummy.jpg'),
      color: '#F0F8F7',
    },
    {
      id: 2,
      title: 'Software Quality Facilitator',
      company: 'Innovate Corp.',
      location: 'Remote',
      type: 'Part-time',
      salary: '$60k - $80k',
      logo: require('../../assets/images/dummy.jpg'),
      color: '#F7F0F8',
    },
    {
      id: 3,
      title: 'Internal Integration Planner',
      company: 'Global Ventures',
      location: 'San Francisco',
      type: 'Full-time',
      salary: '$80k - $100k',
      logo: require('../../assets/images/dummy.jpg'),
      color: '#F8F7F0',
    },
    {
      id: 4,
      title: 'District Intranet Coordinator',
      company: 'City Connect',
      location: 'Chicago',
      type: 'Contract',
      salary: '$40k - $60k',
      logo: require('../../assets/images/dummy.jpg'),
      color: '#F0F8F7',
    },
    {
      id: 5,
      title: 'Customer Service Facilitator',
      company: 'Service First',
      location: 'Austin',
      type: 'Full-time',
      salary: '$50k - $70k',
      logo: require('../../assets/images/dummy.jpg'),
      color: '#F7F0F8',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ScrollView style={styles.scrollView}>
        {/* Search Bar */}
        <TouchableOpacity activeOpacity={0.8} onPress={() => router.push('/(tabs)/jobs')}>
          <TextInput style={styles.searchBar} placeholder="Search for jobs..." editable={false} pointerEvents="none" />
        </TouchableOpacity>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.recentJobsHeader}>
            <Text style={styles.recentJobsTitle}>Recent Jobs Available</Text>
            <Text style={styles.recentJobsSubtitle}>
              {loading ? 'Loading...' : `Showing ${recentJobs.length} recent jobs`}
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
                      pathname: '/jobs/[id]',
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
                    description: job.company || 'No description',
                    location: job.location,
                    price: typeof job.salary === 'string' ? parseInt(job.salary.replace(/[^0-9]/g, '')) || 0 : 0,
                    category: job.type,
                    tags: [],
                    status: 'OPEN',
                    postedBy: { firstName: 'Company', lastName: '' },
                  }}
                  onPress={() =>
                    router.push({
                      pathname: '/jobs/[id]',
                      params: { id: job.id },
                    })
                  }
                />
              ))
            )}
          </View>

          {/* Promotional Section */}
          <View style={styles.promoContainer}>
            <Image source={Images.dummy} style={styles.promoImage} resizeMode="cover" />
            <Text style={styles.promoTitle}>Your chance to help someone</Text>
            <Text style={styles.promoDescription}>
              Be the on that makes someone else's day by signing up for a job.
            </Text>
            <TouchableOpacity style={styles.promoButton} onPress={() => router.push('/(tabs)/jobs')}>
              <Text style={styles.promoButtonText}>Search Job</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomSpace} />
        </ScrollView>
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
    padding: 16,
  },
  searchBar: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  categories: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  category: {
    backgroundColor: '#eee',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
  },
  promoContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  promoImage: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    marginBottom: 16,
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    marginBottom: 8,
  },
  promoDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  promoButton: {
    backgroundColor: '#2BB6A3',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignItems: 'center',
    width: '100%',
  },
  promoButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  bottomSpace: {
    height: 80,
  },
  recentJobsHeader: {
    marginBottom: 12,
  },
  recentJobsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  recentJobsSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  jobCardsContainer: {
    marginBottom: 24,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  jobNameContainer: {
    marginBottom: 8,
  },
  jobName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  jobLocation: {
    fontSize: 14,
    color: '#666',
  },
  jobPrice: {
    fontSize: 14,
    color: '#2BB6A3',
  },
});
