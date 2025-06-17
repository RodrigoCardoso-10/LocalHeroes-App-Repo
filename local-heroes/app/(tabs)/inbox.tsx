import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { Notification, NotificationsResponse, NotificationType } from '../types/notification';

export default function InboxScreen() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response: NotificationsResponse = await authService.getNotifications();
      setNotifications(response.notifications);
      setUnreadCount(response.unreadCount);
    } catch (error: any) {
      console.error('Failed to load notifications:', error);
      Alert.alert('Error', error.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await authService.markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === notificationId ? { ...notification, read: true } : notification
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error: any) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await authService.deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((notification) => notification._id !== notificationId));
    } catch (error: any) {
      console.error('Failed to delete notification:', error);
      Alert.alert('Error', error.message || 'Failed to delete notification');
    }
  };

  const handleNotificationPress = async (notification: Notification) => {
    // Mark as read if not already read
    if (!notification.read) {
      await markAsRead(notification._id);
    }

    // Navigate to relevant page based on notification type
    if (notification.taskId) {
      router.push(`/jobs/${notification.taskId}`);
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.JOB_APPLICATION:
        return 'person-add';
      case NotificationType.APPLICATION_ACCEPTED:
        return 'checkmark-circle';
      case NotificationType.APPLICATION_REJECTED:
        return 'close-circle';
      case NotificationType.JOB_COMPLETED:
        return 'checkmark-done-circle';
      case NotificationType.JOB_CANCELLED:
        return 'close-circle-outline';
      default:
        return 'mail-outline';
    }
  };

  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case NotificationType.JOB_APPLICATION:
        return '#2A9D8F';
      case NotificationType.APPLICATION_ACCEPTED:
        return '#28A745';
      case NotificationType.APPLICATION_REJECTED:
        return '#DC3545';
      case NotificationType.JOB_COMPLETED:
        return '#007BFF';
      case NotificationType.JOB_CANCELLED:
        return '#FFC107';
      default:
        return '#6C757D';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const onRefresh = () => {
    loadNotifications(true);
  };
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <Header />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2A9D8F" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Inbox</Text>
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>{unreadCount}</Text>
        </View>
      </View>

      {notifications.length > 0 ? (
        <ScrollView
          style={styles.notificationsContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2A9D8F']} tintColor="#2A9D8F" />
          }
        >
          {notifications.map((notification) => (
            <TouchableOpacity
              key={notification._id}
              style={[styles.notificationItem, !notification.read && styles.unreadItem]}
              onPress={() => handleNotificationPress(notification)}
            >
              <View style={styles.notificationIconContainer}>
                <Ionicons
                  name={getNotificationIcon(notification.type)}
                  size={24}
                  color={getNotificationColor(notification.type)}
                />
              </View>
              <View style={styles.notificationContent}>
                <Text style={styles.notificationTitle}>{notification.title}</Text>
                <Text style={styles.notificationDetails}>{notification.message}</Text>
                <Text style={styles.notificationDate}>{formatDate(notification.createdAt)}</Text>
              </View>
              <TouchableOpacity style={styles.deleteButton} onPress={() => deleteNotification(notification._id)}>
                <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="mail-outline" size={80} color="#DDD" />
            <View style={styles.emptyBadgeContainer}>
              <Text style={styles.emptyBadgeText}>0</Text>
            </View>
          </View>
          <Text style={styles.emptyTitle}>No New Notifications</Text>
          <Text style={styles.emptyDescription}>
            When you receive job applications or responses to your applications, they will appear here.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  badgeContainer: {
    backgroundColor: '#2A9D8F',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  notificationsContainer: {
    flex: 1,
    padding: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadItem: {
    backgroundColor: '#F1F7F6',
    borderLeftWidth: 4,
    borderLeftColor: '#2A9D8F',
  },
  notificationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F7F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  notificationDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  notificationDate: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyIconContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  emptyBadgeContainer: {
    position: 'absolute',
    top: 0,
    right: -10,
    backgroundColor: '#FF6B6B',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyBadgeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});
