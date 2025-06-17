import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import JobCard from '../components/JobCard';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Sample job data based on the Figma design
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
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.recentJobsHeader}>
          <Text style={styles.recentJobsTitle}>Recent Jobs Available</Text>
          <Text style={styles.recentJobsSubtitle}>Showing 500+ available jobs</Text>
        </View>

        <View style={styles.jobCardsContainer}>
          {jobData.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onPress={() => router.push({ pathname: "/jobs/[id]", params: { id: job.id } })}
            />
          ))}
        </View>

        {/* Bottom section with statistics */}
        <View style={styles.statsSection}>
          <View style={styles.statsCard}>
            <Text style={styles.statsNumber}>2k+</Text>
            <Text style={styles.statsLabel}>Job Opportunities</Text>
            <Text style={styles.statsDescription}>
              We have 2000+ job opportunities posted by various companies
            </Text>
          </View>

          <View style={styles.statsCard}>
            <Text style={styles.statsNumber}>500+</Text>
            <Text style={styles.statsLabel}>Companies</Text>
            <Text style={styles.statsDescription}>
              More than 500 companies have posted jobs on our platform
            </Text>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F8F7',
  },
  content: {
    padding: 20,
  },
  recentJobsHeader: {
    marginBottom: 20,
  },
  recentJobsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 5,
  },
  recentJobsSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  jobCardsContainer: {
    gap: 15,
  },
  jobCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  jobCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  companyLogoContainer: {
    width: 50,
    height: 50,
  },
  logoPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A5568',
  },
  jobTypeContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  jobType: {
    fontSize: 12,
    color: '#4A5568',
    fontWeight: '500',
  },
  jobCardContent: {
    marginBottom: 20,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 8,
    lineHeight: 24,
  },
  companyName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  jobDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
  },
  salaryText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  jobCardFooter: {
    alignItems: 'flex-end',
  },
  applyButton: {
    backgroundColor: '#38A169',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#38A169',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  statsSection: {
    marginTop: 30,
    gap: 20,
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statsNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#38A169',
    marginBottom: 8,
  },
  statsLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 8,
  },
  statsDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  bottomPadding: {
    height: 20,
  },
});

export default HomePage;