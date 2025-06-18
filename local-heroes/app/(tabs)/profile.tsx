import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useReviews } from '../context/ReviewsContext';
import Header from '../components/Header';
import Reviews from '../components/Reviews';

export default function ProfileScreen() {
  const { user } = useAuth();
  const { reviews } = useReviews();
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    skills: [] as string[],
    bio: '',
    profilePicture: '',
  });

  // Calculate average rating
  const averageRating = reviews.length > 0 
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length 
    : 0;

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        skills: user.skills || [],
        bio: user.bio || '',
        profilePicture: user.profilePicture || 'https://randomuser.me/api/portraits/men/32.jpg',
      });
    }
  }, [user]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Header />

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Picture */}
        <View style={styles.profilePictureContainer}>
          <Image
            source={{
              uri: profileData.profilePicture || 'https://randomuser.me/api/portraits/men/32.jpg',
            }}
            style={styles.profilePicture}
          />
          <View style={styles.nameContainer}>
            <Text style={styles.fullName}>{`${profileData.firstName} ${profileData.lastName}`}</Text>
            <View style={styles.ratingContainer}>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name={star <= averageRating ? 'star' : star - 0.5 <= averageRating ? 'star-half' : 'star-outline'}
                    size={20}
                    color="#FFD700"
                  />
                ))}
              </View>
              <Text style={styles.ratingNumber}>{averageRating.toFixed(1)}</Text>
            </View>
            <Text style={styles.emailText}>{profileData.email}</Text>
          </View>
        </View>

        {/* Edit Profile Button */}
        <TouchableOpacity 
          style={styles.editProfileButton} 
          onPress={() => router.push('/edit-profile' as any)}
        >
          <Ionicons name="create-outline" size={20} color="white" />
          <Text style={styles.editProfileText}>Edit Profile</Text>
        </TouchableOpacity>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{profileData.phone || 'Not provided'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Address</Text>
            <Text style={styles.infoValue}>{profileData.address || 'Not provided'}</Text>
          </View>
        </View>

        {/* Skills Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <View style={styles.skillsContainer}>
            {profileData.skills.length > 0 ? (
              profileData.skills.map((skill, index) => (
                <View key={index} style={styles.skillTag}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noContentText}>No skills added yet</Text>
            )}
          </View>
        </View>

        {/* Bio Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bio</Text>
          <Text style={styles.bioText}>
            {profileData.bio || 'No bio provided yet'}
          </Text>
        </View>

        {/* Reviews Section */}
        <View style={styles.section}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>Reviews</Text>
          </View>
          <View style={styles.reviewButtonsContainer}>
            <TouchableOpacity 
              style={[styles.reviewButton, styles.viewReviewsButton]}
              onPress={() => router.push('/Reviews')}
            >
              <Text style={styles.viewReviewsText}>View All Reviews</Text>
              <Ionicons name="arrow-forward" size={20} color="#0ca678" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.reviewButton, styles.writeReviewButton]}
              onPress={() => router.push('/write-review')}
            >
              <Text style={styles.writeReviewText}>Write a Review</Text>
              <Ionicons name="create-outline" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Space for Navigation Bar */}
        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32, // Extra padding at the bottom
  },
  profilePictureContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#0ca678',
  },
  nameContainer: {
    alignItems: 'center',
    marginTop: 12,
  },
  fullName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  emailText: {
    fontSize: 16,
    color: '#666',
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0ca678',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  editProfileText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    flex: 2,
    textAlign: 'right',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillTag: {
    backgroundColor: '#e6f8f5',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    color: '#0ca678',
  },
  bioText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  noContentText: {
    color: '#666',
    fontStyle: 'italic',
  },
  bottomSpace: {
    height: 80,
  },
  reviewButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  reviewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
    padding: 16,
  },
  viewReviewsButton: {
    backgroundColor: '#f8f9fa',
  },
  writeReviewButton: {
    backgroundColor: '#0ca678',
  },
  viewReviewsText: {
    fontSize: 16,
    color: '#0ca678',
    fontWeight: '500',
  },
  writeReviewText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
}); 