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
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { authService } from '../services/api';
import { Task } from '../types/task';
import Header from '../components/Header';

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams();
  const [job, setJob] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Load job details
  useEffect(() => {
    loadJobDetails();
  }, [id]);
  const loadJobDetails = async () => {
    try {
      setLoading(true);
      const response = await authService.getTask(id as string);
      setJob(response);
    } catch (error: any) {
      console.error('Failed to load job details:', error);
      Alert.alert('Error', 'Failed to load job details');
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

    try {
      setApplying(true);
      await authService.acceptTask(job._id);
      Alert.alert(
        'Application Sent!',
        "Your application has been sent to the job poster. They will contact you if you're selected.",
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      console.error('Failed to apply for job:', error);
      Alert.alert('Error', error.message || 'Failed to apply for job');
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
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header />

      {/* Custom Header with Actions */}
      <View style={styles.customHeader}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={toggleBookmark}>
            <Ionicons
              name={bookmarked ? 'bookmark' : 'bookmark-outline'}
              size={24}
              color={bookmarked ? '#2A9D8F' : '#333'}
            />
          </TouchableOpacity>
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
        </View>{' '}
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
          <View style={styles.employerCard}>
            <View style={styles.employerAvatar}>
              <Text style={styles.employerInitials}>
                {job.postedBy?.firstName?.[0]}
                {job.postedBy?.lastName?.[0]}
              </Text>
            </View>
            <View style={styles.employerInfo}>
              <Text style={styles.employerName}>
                {job.postedBy?.firstName} {job.postedBy?.lastName}
              </Text>
              <Text style={styles.employerEmail}>{job.postedBy?.email}</Text>
              {job.postedBy?.skills && job.postedBy.skills.length > 0 && (
                <Text style={styles.employerSkills}>Skills: {job.postedBy.skills.join(', ')}</Text>
              )}
            </View>
          </View>
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
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.contactButton} onPress={handleContact}>
          <Ionicons name="chatbubble-outline" size={20} color="#2A9D8F" />
          <Text style={styles.contactButtonText}>Contact</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.applyButton, applying && styles.applyButtonDisabled]}
          onPress={handleApply}
          disabled={applying || job.status !== 'open'}
        >
          {applying ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={20} color="white" />
              <Text style={styles.applyButtonText}>{job.status === 'open' ? 'Apply Now' : 'Not Available'}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#2A9D8F',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
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
  actionContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  contactButton: {
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
  contactButtonText: {
    color: '#2A9D8F',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  applyButton: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2A9D8F',
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  applyButtonDisabled: {
    backgroundColor: '#CCC',
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
