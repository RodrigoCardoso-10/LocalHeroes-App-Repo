import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const jobsData = [
  {
    id: '1',
    time: '10 hrs ago',
    title: 'Forward Security Director',
    company: 'Black, Skocdopole and Schultz Co',
    type: 'Full time',
    salary: '$40,000-$60,000',
    location: 'New York, USA',
  },
  {
    id: '2',
    time: '15 hrs ago',
    title: 'Regional Creative Facilitator',
    company: 'Wisozk - Dietrich',
    type: 'Part time',
    salary: '$32,000-$39,000',
    location: 'Los Angeles, USA',
  },
  // Add more jobs as needed...
];

interface Job {
  id: string;
  time: string;
  title: string;
  company: string;
  type: string;
  salary: string;
  location: string;
}

const JobCard = ({ job }: { job: Job }) => (
  <View style={styles.jobCard}>
    <View style={styles.jobCardHeader}>
      <Text style={styles.jobTime}>{job.time}</Text>
      <TouchableOpacity>
        <Text style={styles.bookmarkIcon}>🔖</Text>
      </TouchableOpacity>
    </View>
    <Text style={styles.jobTitle}>{job.title}</Text>
    <Text style={styles.companyName}>{job.company}</Text>
    <View style={styles.jobDetailsContainer}>
      <View style={styles.jobDetail}>
        <Text style={styles.jobDetailIcon}>💼</Text>
        <Text style={styles.jobDetailText}>{job.type}</Text>
      </View>
      <View style={styles.jobDetail}>
        <Text style={styles.jobDetailIcon}>💰</Text>
        <Text style={styles.jobDetailText}>{job.salary}</Text>
      </View>
      <View style={styles.jobDetail}>
        <Text style={styles.jobDetailIcon}>📍</Text>
        <Text style={styles.jobDetailText}>{job.location}</Text>
      </View>
    </View>
    <TouchableOpacity style={styles.jobDetailsButton}>
      <Text style={styles.jobDetailsButtonText}>Job Details</Text>
    </TouchableOpacity>
  </View>
);

const Header = () => (
    <View style={styles.headerContainer}>
        <View style={styles.headerLeft}>
            <Image source={require('../assets/images/logo.png')} style={styles.headerLogo} />
            <Text style={styles.headerTitle}>LocalHeroes</Text>
        </View>
        <View style={styles.headerRight}>
            <TouchableOpacity style={styles.loginButton}>
                <Text style={styles.loginText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.registerButton}>
                <Text style={styles.registerText}>Register</Text>
            </TouchableOpacity>
        </View>
    </View>
);

const SectionTitle = () => (
    <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>Recent Jobs Available</Text>
        <Text style={styles.sectionSubtitle}>
            Actively looking premium & included, aimed local & remote jobs.
        </Text>
    </View>
);

const PromoSection = () => (
  <View style={styles.promoContainer}>
    <Image
      source={require('../assets/images/dummy.jpg')} // Use your dummy image here
      style={styles.promoImage}
      resizeMode="cover"
    />
    <Text style={styles.promoTitle}>Good Life Begins With A Good Company</Text>
    <Text style={styles.promoDescription}>
      Unlock opportunities with our handpicked list of companies. Explore the offers, compare, and find the best fit for you with confidence.
    </Text>
    <TouchableOpacity style={styles.promoButton}>
      <Text style={styles.promoButtonText}>Search Job</Text>
    </TouchableOpacity>
  </View>
);

const StatisticsSection = () => (
  <View style={styles.statsContainer}>
    <View style={styles.statsColumn}>
      <Text style={styles.statsNumber}>2k+</Text>
      <Text style={styles.statsLabel}>Active users</Text>
      <Text style={styles.statsDescription}>Find your dream job</Text>
    </View>
    <View style={styles.statsColumn}>
      <Text style={styles.statsNumber}>500+</Text>
      <Text style={styles.statsLabel}>Employers</Text>
      <Text style={styles.statsDescription}>Post your job</Text>
    </View>
  </View>
);

export default function HomePage() {
    return (
        <View style={{ flex: 1 }}>
            <Header />
            <ScrollView style={styles.container}>
                <SectionTitle />
                {/* Search Bar */}
                <TextInput
                    style={styles.searchBar}
                    placeholder="Search for jobs..."
                />

                {/* Job Categories */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories}>
                    {/* Example Category */}
                    <TouchableOpacity style={styles.category}>
                        <Text style={styles.categoryText}>Plumbing</Text>
                    </TouchableOpacity>
                    {/*Add more categories as needed */}
                </ScrollView>

                {/* Job Cards List */}
                {jobsData.map(job => (
                    <JobCard key={job.id} job={job} />
                ))}

                <TouchableOpacity style={styles.viewAllContainer}>
                    <Text style={styles.viewAllText}>View all</Text>
                </TouchableOpacity>
                <PromoSection />
                <StatisticsSection />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        fontFamily: 'Figtree',
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#fff',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerLogo: {
        width: 32,
        height: 32,
        marginRight: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#222',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    loginButton: {
        marginRight: 8,
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 6,
        backgroundColor: '#e0e0e0',
    },
    loginText: {
        color: '#222',
        fontWeight: '500',
    },
    registerButton: {
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 6,
        backgroundColor: '#2bb6a3',
    },
    registerText: {
        color: '#fff',
        fontWeight: '500',
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
    jobCard: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    jobCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    jobTime: {
        color: '#2BB6A3',
        fontSize: 14,
        fontWeight: '500',
    },
    bookmarkIcon: {
        fontSize: 20,
        color: '#666',
    },
    jobTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    companyName: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
    },
    jobDetailsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 16,
    },
    jobDetail: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    jobDetailIcon: {
        marginRight: 4,
        fontSize: 16,
    },
    jobDetailText: {
        fontSize: 14,
        color: '#666',
    },
    jobDetailsButton: {
        backgroundColor: '#2BB6A3',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    jobDetailsButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    sectionTitleContainer: {
        marginBottom: 20,
        marginTop: 8,
        paddingHorizontal: 4,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#222',
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#666',
    },
    viewAllContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    viewAllText: {
        color: '#2BB6A3',
        fontSize: 16,
        textDecorationLine: 'underline',
        fontWeight: '500',
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
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    statsColumn: {
        flex: 1,
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        marginHorizontal: 8,
    },
    statsNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2BB6A3',
        marginBottom: 4,
    },
    statsLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#222',
        marginBottom: 4,
    },
    statsDescription: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
});