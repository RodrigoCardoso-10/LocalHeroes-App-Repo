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
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from './context/AuthContext';
import { useReviews } from './context/ReviewsContext';
import { authService } from './services/api';
import { User, Review } from './types/task';

export default function ProfileScreen() {
  const { user } = useAuth();
  const { id, email } = useLocalSearchParams();
  const { reviews } = useReviews();
  const [profileData, setProfileData] = useState<User>({});
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        
        // Log incoming parameters for debugging
        console.log('Profile Screen - Fetch Parameters:', {
          id: id,
          email: email,
          currentUser: {
            id: (user as any)?._id,
            email: (user as any)?.email
          }
        });

        // Determine the identifier to use
        const identifier = (id || email) as string;

        if (identifier) {
          console.log('Attempting to fetch profile with identifier:', identifier);

          try {
            const fetchedProfile = await authService.getUserProfile(identifier);

            console.log('Fetched Profile Details:', {
              fetchedProfileId: fetchedProfile._id,
              fetchedProfileEmail: fetchedProfile.email,
              currentUserId: (user as any)?._id,
              currentUserEmail: (user as any)?.email
            });

            // Set the profile data
            setProfileData(fetchedProfile);

            // Determine if this is the current user's profile
            const isCurrentUserProfile = 
              (fetchedProfile._id === (user as any)?._id) || 
              (fetchedProfile.email === (user as any)?.email);

            console.log('Is Own Profile Check:', {
              idMatch: fetchedProfile._id === (user as any)?._id,
              emailMatch: fetchedProfile.email === (user as any)?.email,
              isCurrentUserProfile: isCurrentUserProfile
            });

            setIsOwnProfile(isCurrentUserProfile);
          } catch (profileError) {
            console.error('Profile Fetch Error:', profileError);
            
            // More informative error handling
            Alert.alert(
              'Profile Error', 
              'Unable to retrieve the requested profile. Please try again.', 
              [{ 
                text: 'OK', 
                onPress: () => router.back() 
              }]
            );
          }
        } else {
          // If no identifier, show current user's profile
          if (user) {
            setProfileData({
              _id: (user as any)._id || '',
              firstName: (user as any).firstName || '',
              lastName: (user as any).lastName || '',
              email: (user as any).email || '',
              phone: (user as any).phone || '',
              address: (user as any).address || '',
              skills: (user as any).skills || [],
              bio: (user as any).bio || '',
              profilePicture: (user as any).profilePicture || 'https://randomuser.me/api/portraits/men/32.jpg',
            });
            setIsOwnProfile(true);
          }
        }
      } catch (error) {
        console.error('Unexpected error in profile retrieval:', error);
        
        Alert.alert(
          'Unexpected Error', 
          'An unexpected error occurred while retrieving the profile.', 
          [{ 
            text: 'OK', 
            onPress: () => router.back() 
          }]
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [id, email, user]);

  // Filter reviews for this specific profile
  const userReviews = reviews.filter(review => 
    (review as any).reviewedUserId && 
    (profileData as any)._id && 
    (review as any).reviewedUserId === (profileData as any)._id
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0ca678" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        {isOwnProfile ? (
          <TouchableOpacity onPress={() => router.push('/edit-profile' as any)} style={styles.editButton}>
            <Ionicons name="create-outline" size={24} color="white" />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      <ScrollView style={styles.content}>
        {/* Profile Picture */}
        <View style={styles.profilePictureContainer}>
          <Image
            source={{
              uri: (profileData as any).profilePicture || 'https://randomuser.me/api/portraits/men/32.jpg',
            }}
            style={styles.profilePicture}
          />
          <View style={styles.nameContainer}>
            <Text style={styles.fullName}>{`${(profileData as any).firstName || ''} ${(profileData as any).lastName || ''}`}</Text>
            <Text style={styles.emailText}>{(profileData as any).email || ''}</Text>
          </View>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{(profileData as any).phone || 'Not provided'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Address</Text>
            <Text style={styles.infoValue}>{(profileData as any).address || 'Not provided'}</Text>
          </View>
        </View>

        {/* Skills Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <View style={styles.skillsContainer}>
            {(profileData as any).skills && (profileData as any).skills.length > 0 ? (
              (profileData as any).skills.map((skill: string, index: number) => (
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
            {(profileData as any).bio || 'No bio provided yet'}
          </Text>
        </View>

        {/* Reviews Section */}
        <View style={styles.section}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            <View style={styles.reviewStats}>
              <View style={styles.ratingContainer}>
                {[...Array(5)].map((_, i) => (
                  <Ionicons 
                    key={i} 
                    name={i < Math.round(userReviews.reduce((acc, review) => acc + ((review as any).rating || 0), 0) / (userReviews.length || 1)) ? "star" : "star-outline"} 
                    size={16} 
                    color="#FFD700" 
                  />
                ))}
              </View>
              <Text style={styles.reviewCount}>
                {userReviews.length} {userReviews.length === 1 ? 'review' : 'reviews'}
              </Text>
            </View>
          </View>
          {userReviews.length > 0 ? (
            userReviews.map((review: Review, index: number) => (
              <View key={index} style={styles.reviewContainer}>
                <Text style={styles.reviewerName}>
                  {(review as any).reviewerName || 'Anonymous'}
                </Text>
                <Text style={styles.reviewText}>{(review as any).comment}</Text>
                <View style={styles.ratingContainer}>
                  {[...Array(5)].map((_, i) => (
                    <Ionicons 
                      key={i} 
                      name={i < ((review as any).rating || 0) ? "star" : "star-outline"} 
                      size={16} 
                      color="#FFD700" 
                    />
                  ))}
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noContentText}>No reviews yet</Text>
          )}
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
              onPress={() => router.push({
                pathname: '/write-review',
                params: { userId: profileData._id }
              })}
            >
              <Text style={styles.writeReviewText}>Write a Review</Text>
              <Ionicons name="create-outline" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#000',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  backButton: {
    padding: 8,
  },
  editButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
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
  },
  emailText: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
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
    marginBottom: 16,
    color: '#333',
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
    height: 40,
  },
  reviewContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  reviewText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
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
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  reviewStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewCount: {
    fontSize: 14,
    color: '#666',
  },
});
