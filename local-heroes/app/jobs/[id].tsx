import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
  Share,
  SafeAreaView,
  RefreshControl,
  Platform,
  Image,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { authService } from '../services/api';
import { Task } from '../types/task';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import Colors from '../constants/Colors';

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [job, setJob] = useState<Task | null>(null);
  const [jobPoster, setJobPoster] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Load job details and poster profile
  useEffect(() => {
    loadJobDetails();
  }, [id]);

  const loadJobDetails = async () => {
    try {
      setLoading(true);
      console.log('Loading job details for ID:', id);
      
      // Add more robust error handling for task retrieval
      try {
        const response = await authService.getTask(id as string);
        setJob(response);

        // Comprehensive logging of job and poster details
        console.log('Job Details Received:', {
          jobId: response._id,
          jobTitle: response.title,
          postedByInfo: response.postedBy ? {
            id: response.postedBy._id,
            email: response.postedBy.email,
            name: `${response.postedBy.firstName} ${response.postedBy.lastName}`,
            skills: response.postedBy.skills
          } : 'No poster information'
        });

        // Fetch job poster's profile if available
        if (response.postedBy && response.postedBy.email) {
          try {
            const posterProfile = await authService.getUserProfile(response.postedBy.email);
            
            console.log('Poster Profile Retrieved:', {
              posterId: posterProfile._id,
              name: `${posterProfile.firstName} ${posterProfile.lastName}`,
              email: posterProfile.email,
              skills: posterProfile.skills,
              profilePicture: posterProfile.profilePicture ? 'Available' : 'Not Available'
            });

            // Ensure email is preserved
            const fullPosterProfile = {
              ...posterProfile,
              email: response.postedBy.email // Preserve original email from job details
            };

            setJobPoster(fullPosterProfile);
          } catch (profileError: any) {
            console.warn('Failed to retrieve full poster profile:', {
              email: response.postedBy.email,
              errorMessage: profileError?.message
            });
            // Fallback to basic poster information
            setJobPoster({
              ...response.postedBy,
              email: response.postedBy.email
            });
          }
        }
      } catch (taskError: any) {
        console.error('Detailed task retrieval error:', {
          errorType: taskError?.constructor?.name,
          errorMessage: taskError?.message,
          errorResponse: taskError?.response?.data,
          errorStatus: taskError?.response?.status
        });

        // More informative error handling
        const errorMessage = 
          taskError?.response?.data?.message || 
          taskError?.message || 
          'Failed to load job details';

        Alert.alert(
          'Job Details Error', 
          errorMessage, 
          [
            { 
              text: 'OK', 
              onPress: () => router.back() 
            },
            { 
              text: 'Retry', 
              onPress: loadJobDetails 
            }
          ]
        );
        
        return; // Exit the function to prevent further processing
      }
    } catch (error: any) {
      console.error('Unexpected error in job details:', error);
      Alert.alert('Unexpected Error', 'An unexpected error occurred. Please try again.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      const response = await authService.getTask(id as string);
      setJob(response);
    } catch (error: any) {
      console.error('Failed to refresh job details:', error);
      Alert.alert('Error', 'Failed to refresh job details');
    } finally {
      setRefreshing(false);
    }
  }, [id]);
  const handleApply = async () => {
    if (!job) return;

    // Additional pre-application checks
    if (!user) {
      Alert.alert(
        'Authentication Required', 
        'You must be logged in to apply for a job.', 
        [{ 
          text: 'Login', 
          onPress: () => router.push('/login') 
        }]
      );
      return;
    }

    // Enhanced validation checks
    const validationErrors = [];
    if (!job.title || job.title.trim().length < 3) {
      validationErrors.push('Invalid job title');
    }
    if (job.status.toLowerCase() !== 'open') {
      validationErrors.push('Job is not currently open for applications');
    }
    if (!job.price || job.price <= 0) {
      validationErrors.push('Invalid job price');
    }

    if (validationErrors.length > 0) {
      Alert.alert(
        'Application Validation Failed', 
        validationErrors.join('\n'),
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setApplying(true);
      
      // Comprehensive pre-application logging
      console.log('Job Application Attempt:', {
        jobId: job._id,
        userId: user.id,
        userEmail: user.email,
        userRole: user.role,
        jobTitle: job.title,
        jobStatus: job.status,
        jobLocation: job.location,
        jobPrice: job.price,
        applicationTimestamp: new Date().toISOString(),
        // Add more diagnostic information
        deviceInfo: {
          platform: Platform.OS,
          platformVersion: Platform.Version
        }
      });

      // Add timeout and retry mechanism
      const applicationResponse = await Promise.race([
        authService.applyForTask(job._id),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Application request timed out')), 10000)
        )
      ]);
      
      // Log successful application
      console.log('Job Application Successful:', {
        jobId: job._id,
        responseData: applicationResponse
      });
      
      Alert.alert(
        'Application Sent!',
        "Your application has been sent to the job poster. They will contact you if you're selected.",
        [{ 
          text: 'OK', 
          onPress: () => router.back() 
        }]
      );
    } catch (error: any) {
      // Comprehensive error logging
      console.error('Job Application Error:', {
        errorType: error?.constructor?.name,
        errorMessage: error?.message,
        errorResponse: error?.response?.data,
        errorStatus: error?.response?.status,
        jobDetails: {
          id: job._id,
          title: job.title,
          status: job.status
        },
        userDetails: {
          id: user.id,
          email: user.email,
          role: user.role
        },
        timestamp: new Date().toISOString(),
        fullError: JSON.stringify(error, null, 2)
      });

      // More detailed error handling
      const errorMessage = 
        error?.response?.data?.message || 
        error?.message || 
        'Failed to apply for job';

      Alert.alert(
        'Application Error', 
        errorMessage, 
        [
          { 
            text: 'OK' 
          },
          { 
            text: 'Show Details', 
            onPress: () => Alert.alert(
              'Error Details', 
              JSON.stringify({
                message: errorMessage,
                jobId: job._id,
                userId: user.id,
                timestamp: new Date().toISOString()
              }, null, 2)
            ) 
          }
        ]
      );
    } finally {
      setApplying(false);
    }
  };

  const handleContact = () => {
    if (!job?.postedBy) return;

    Alert.alert('Contact Employer', 'How would you like to contact the employer?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Message', onPress: () => openMessage() },
      { text: 'Email', onPress: () => openEmail() },
    ]);
  };

  const openMessage = () => {
    // Navigate to chat/message screen
    Alert.alert('Feature Coming Soon', 'Direct messaging will be available soon!');
  };

  const openEmail = () => {
    if (job?.postedBy?.email) {
      const subject = `Regarding: ${job.title}`;
      const body = `Hi,\n\nI'm interested in your job posting "${job.title}". I'd like to discuss the details.\n\nBest regards`;
      Linking.openURL(
        `mailto:${job.postedBy.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
      );
    }
  };

  const handleShare = async () => {
    if (!job) return;

    try {
      await Share.share({
        message: `Check out this job: ${job.title} - €${job.price} in ${job.location}`,
        title: job.title,
      });
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  const toggleBookmark = () => {
    setBookmarked(!bookmarked);
    // TODO: Implement bookmark API call
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return '#28A745';
      case 'in_progress':
        return '#FFC107';
      case 'completed':
        return '#6C757D';
      case 'cancelled':
        return '#DC3545';
      default:
        return '#6C757D';
    }
  };

  const getExperienceLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'no experience':
        return '#E3F2FD';
      case 'beginner':
        return '#FFF3E0';
      case 'intermediate':
        return '#F3E5F5';
      case 'expert':
        return '#FFEBEE';
      default:
        return '#F5F5F5';
    }
  };

  const getExperienceLevelTextColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'no experience':
        return '#1976D2';
      case 'beginner':
        return '#F57C00';
      case 'intermediate':
        return '#7B1FA2';
      case 'expert':
        return '#C62828';
      default:
        return '#666';
    }
  };

  // Determine if the job belongs to the current user
  const isUserJob = user?.email === job?.postedBy?.email;

  const handleViewPosterProfile = () => {
    if (!jobPoster) {
      Alert.alert('Profile Unavailable', 'Unable to retrieve poster profile at this time.');
      return;
    }

    // Navigate using email if available, otherwise use ID
    const profileIdentifier = jobPoster.email || jobPoster._id;
    if (profileIdentifier) {
      router.push(`/profile?${jobPoster.email ? 'email' : 'id'}=${encodeURIComponent(profileIdentifier)}`);
    } else {
      Alert.alert('Profile Unavailable', 'Unable to retrieve poster profile at this time.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2A9D8F" />
          <Text style={styles.loadingText}>Loading job details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!job) {
    return (
      <SafeAreaView style={styles.container}>
        <Header />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#DC3545" />
          <Text style={styles.errorText}>Job not found</Text>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Text style={styles.errorButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header />

      {/* Custom Header with Actions */}
      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerActionRight}>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color="white" />
          </TouchableOpacity>
          
          {isUserJob && (
            <TouchableOpacity 
              style={styles.editButton} 
              onPress={() => router.push({
                pathname: '/post-job',
                params: { jobId: job?._id }
              })}
            >
              <Ionicons name="pencil" size={24} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2A9D8F']} tintColor="#2A9D8F" />
        }
      >
        {/* Job Header */}
        <View style={styles.jobHeader}>
          <View style={styles.titleRow}>
            <Text style={styles.jobTitle}>{job.title}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(job.status) }]}>
              <Text style={styles.statusText}>{job.status.toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.jobMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={16} color="#666" />
              <Text style={styles.metaText}>{job.location}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.metaText}>
                {new Date(job.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="folder-outline" size={16} color="#666" />
              <Text style={styles.metaText}>{job.category}</Text>
            </View>
          </View>

          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Payment</Text>
            <Text style={styles.price}>€{job.price}</Text>
          </View>
        </View>
        {/* Experience Level */}
        {job.experienceLevel && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience Required</Text>
            <View style={[styles.experienceBadge, { backgroundColor: getExperienceLevelColor(job.experienceLevel) }]}>
              <Text style={[styles.experienceText, { color: getExperienceLevelTextColor(job.experienceLevel) }]}>
                {job.experienceLevel}
              </Text>
            </View>
          </View>
        )}
        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Job Description</Text>
          <Text style={styles.description}>{job.description}</Text>
        </View>
        {/* Tags */}
        {job.tags && job.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagsContainer}>
              {job.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        {/* Employer Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Posted By</Text>
          <TouchableOpacity 
            style={styles.employerCard} 
            onPress={() => {
              // Prioritize jobPoster details, fallback to job.postedBy
              const posterToNavigate = jobPoster || job?.postedBy;
              
              if (!posterToNavigate) {
                Alert.alert('Profile Unavailable', 'Unable to retrieve poster profile at this time.');
                return;
              }
              
              // Prefer email for navigation, fallback to ID
              const profileIdentifier = posterToNavigate.email || posterToNavigate._id;
              const paramKey = posterToNavigate.email ? 'email' : 'id';
              
              console.log('Navigating to profile with:', {
                identifier: profileIdentifier,
                paramKey: paramKey
              });
              
              router.push(`/profile?${paramKey}=${encodeURIComponent(profileIdentifier)}`);
            }}
          >
            {/* Avatar */}
            <View style={styles.employerAvatar}>
              <Text style={styles.employerInitials}>
                {(jobPoster?.firstName || job?.postedBy?.firstName || '')[0]}
                {(jobPoster?.lastName || job?.postedBy?.lastName || '')[0]}
              </Text>
            </View>
            
            {/* Poster Info */}
            <View style={styles.employerInfo}>
              <Text style={styles.employerName}>
                {jobPoster?.firstName || job?.postedBy?.firstName || 'Unknown'} {' '}
                {jobPoster?.lastName || job?.postedBy?.lastName || ''}
              </Text>
              <Text style={styles.employerEmail}>
                {jobPoster?.email || job?.postedBy?.email || 'No email available'}
              </Text>
              {(jobPoster?.skills || job?.postedBy?.skills) && (
                <Text style={styles.employerSkills}>
                  Skills: {(jobPoster?.skills || job?.postedBy?.skills || []).join(', ')}
                </Text>
              )}
              
              {/* New View Profile Button */}
              <TouchableOpacity 
                style={styles.viewProfileButton} 
                onPress={() => {
                  // Prioritize jobPoster details, fallback to job.postedBy
                  const posterToNavigate = jobPoster || job?.postedBy;
                  
                  if (!posterToNavigate) {
                    Alert.alert('Profile Unavailable', 'Unable to retrieve poster profile at this time.');
                    return;
                  }
                  
                  // Prefer email for navigation, fallback to ID
                  const profileIdentifier = posterToNavigate.email || posterToNavigate._id;
                  const paramKey = posterToNavigate.email ? 'email' : 'id';
                  
                  console.log('Navigating to profile with:', {
                    identifier: profileIdentifier,
                    paramKey: paramKey
                  });
                  
                  router.push(`/profile?${paramKey}=${encodeURIComponent(profileIdentifier)}`);
                }}
              >
                <Text style={styles.viewProfileButtonText}>View Profile</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
        {/* Job Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Job Details</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="eye-outline" size={20} color="#666" />
              <Text style={styles.statLabel}>Views</Text>
              <Text style={styles.statValue}>24</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="people-outline" size={20} color="#666" />
              <Text style={styles.statLabel}>Applicants</Text>
              <Text style={styles.statValue}>5</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <Text style={styles.statLabel}>Posted</Text>
              <Text style={styles.statValue}>
                {Math.ceil((Date.now() - new Date(job.createdAt).getTime()) / (1000 * 60 * 60 * 24))}d ago
              </Text>
            </View>
          </View>
        </View>
        {/* Safety Tips */}
        <View style={styles.section}>
          <View style={styles.safetyHeader}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#28A745" />
            <Text style={styles.safetyTitle}>Safety Tips</Text>
          </View>
          <View style={styles.safetyTips}>
            <Text style={styles.safetyTip}>• Always meet in a public place first</Text>
            <Text style={styles.safetyTip}>• Don't pay money upfront</Text>
            <Text style={styles.safetyTip}>• Trust your instincts</Text>
            <Text style={styles.safetyTip}>• Report suspicious activity</Text>
          </View>
        </View>
        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />

        {/* Job Poster Section */}
        {(jobPoster || job?.postedBy) && (
          <View style={styles.posterSection}>
            <Text style={styles.sectionTitle}>Job Posted By</Text>
            <TouchableOpacity 
              style={styles.employerCard} 
              onPress={() => {
                // Prioritize jobPoster details, fallback to job.postedBy
                const posterToNavigate = jobPoster || job?.postedBy;
                
                if (!posterToNavigate) {
                  Alert.alert('Profile Unavailable', 'Unable to retrieve poster profile at this time.');
                  return;
                }
                
                // Prefer email for navigation, fallback to ID
                const profileIdentifier = posterToNavigate.email || posterToNavigate._id;
                const paramKey = posterToNavigate.email ? 'email' : 'id';
                
                router.push(`/profile?${paramKey}=${encodeURIComponent(profileIdentifier)}`);
              }}
            >
              {/* Avatar */}
              <View style={styles.employerAvatar}>
                <Text style={styles.employerInitials}>
                  {(jobPoster?.firstName || job?.postedBy?.firstName || '')[0]}
                  {(jobPoster?.lastName || job?.postedBy?.lastName || '')[0]}
                </Text>
              </View>
              
              {/* Poster Info */}
              <View style={styles.employerInfo}>
                <Text style={styles.employerName}>
                  {jobPoster?.firstName || job?.postedBy?.firstName || 'Unknown'} {' '}
                  {jobPoster?.lastName || job?.postedBy?.lastName || ''}
                </Text>
                <Text style={styles.employerEmail}>
                  {jobPoster?.email || job?.postedBy?.email || 'No email available'}
                </Text>
                {(jobPoster?.skills || job?.postedBy?.skills) && (
                  <Text style={styles.employerSkills}>
                    Skills: {(jobPoster?.skills || job?.postedBy?.skills || []).join(', ')}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        {isUserJob && (
          <View 
            style={[
              styles.primaryButton, 
              { 
                backgroundColor: 'white', 
                borderWidth: 2, 
                borderColor: '#2A9D8F' 
              }
            ]}
          >
            <Text style={styles.primaryButtonText}>Your Job Post</Text>
          </View>
        )}
        
        {!isUserJob && (
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={handleApply}
            disabled={applying}
          >
            {applying ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>Apply Now</Text>
            )}
          </TouchableOpacity>
        )}
        
        <TouchableOpacity style={styles.secondaryButton} onPress={handleContact}>
          <Ionicons name="chatbubble-outline" size={20} color="#0ca678" />
          <Text style={styles.secondaryButtonText}>Contact</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#DC3545',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  customHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerButton: {
    padding: 8,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#000',
  },
  headerActionRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  jobHeader: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  jobTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 12,
    lineHeight: 30,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  jobMeta: {
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  priceContainer: {
    backgroundColor: '#F1F7F6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2A9D8F',
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  experienceBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  experienceText: {
    fontSize: 14,
    fontWeight: '500',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#F1F7F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#2A9D8F',
    fontWeight: '500',
  },
  employerCard: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  employerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2A9D8F',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  employerInitials: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  employerInfo: {
    flex: 1,
  },
  employerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  employerEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  employerSkills: {
    fontSize: 12,
    color: '#2A9D8F',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  safetyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  safetyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#28A745',
    marginLeft: 8,
  },
  safetyTips: {
    backgroundColor: '#F8FFF8',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#28A745',
  },
  safetyTip: {
    fontSize: 14,
    color: '#155724',
    marginBottom: 4,
  },
  bottomSpacing: {
    height: 100,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#2A9D8F',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  primaryButtonText: {
    color: '#2A9D8F',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#0ca678',
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: '#0ca678',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  shareButton: {
    marginRight: 16,
  },
  editButton: {
    marginLeft: 16,
  },
  errorButtonText: {
    color: '#DC3545',
    fontSize: 16,
    fontWeight: '600',
  },
  posterSection: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginHorizontal: 10,
    marginTop: 10,
  },
  posterProfile: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  posterAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  posterAvatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.light.tint,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  posterAvatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  posterInfo: {
    flex: 1,
  },
  posterName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  viewProfileButton: {
    backgroundColor: '#2A9D8F',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  viewProfileButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
