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

export default function HomePage() {
    return (
        <View style={{ flex: 1 }}>
            <Header />
            <ScrollView style={styles.container}>
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
        backgroundColor: '#f9f9f9',
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    jobTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    jobDetails: {
        fontSize: 14,
        color: '#666',
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
});