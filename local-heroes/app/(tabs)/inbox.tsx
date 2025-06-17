import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';

interface Notification {
  id: string;
  type: 'application' | 'response';
  jobTitle: string;
  companyName?: string;
  userName?: string;
  date: string;
  read: boolean;
}

export default function InboxScreen() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  // For demo purposes, we're starting with an empty notifications array
  // In a real app, you would fetch these from your backend

  const markAsRead = (id: string) => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prevNotifications => 
      prevNotifications.filter(notification => notification.id !== id)
    );
  };

  const unreadCount = notifications.filter(notification => !notification.read).length;

  return (
    <View style={styles.container}>
      {/* <Header /> */}
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Inbox</Text>
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>{unreadCount}</Text>
        </View>
      </View>

      {notifications.length > 0 ? (
        <ScrollView style={styles.notificationsContainer}>
          {notifications.map((notification) => (
            <TouchableOpacity 
              key={notification.id} 
              style={[styles.notificationItem, !notification.read && styles.unreadItem]}
              onPress={() => markAsRead(notification.id)}
            >
              <View style={styles.notificationIconContainer}>
                <Ionicons 
                  name={notification.type === 'application' ? 'briefcase-outline' : 'mail-outline'} 
                  size={24} 
                  color="#2A9D8F" 
                />
              </View>
              <View style={styles.notificationContent}>
                <Text style={styles.notificationTitle}>
                  {notification.type === 'application' 
                    ? `New application for ${notification.jobTitle}` 
                    : `Response to your application for ${notification.jobTitle}`}
                </Text>
                <Text style={styles.notificationDetails}>
                  {notification.type === 'application' 
                    ? `${notification.userName} has applied` 
                    : `${notification.companyName} has responded`}
                </Text>
                <Text style={styles.notificationDate}>{notification.date}</Text>
              </View>
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => deleteNotification(notification.id)}
              >
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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