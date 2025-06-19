import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { authService } from '../../services/api';
import { Task, PopulatedTask, TaskStatus } from '../../types/task';
import { User } from '../../types/user';

type Applicant = User;

const ManageJobScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [task, setTask] = useState<PopulatedTask | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTaskDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const fetchedTask = await authService.getTaskWithApplicants(id);
      setTask(fetchedTask);
      setApplicants(fetchedTask.applicants || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch task details.');
      Alert.alert('Error', 'Could not load job details and applicants.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskDetails();
  }, [id]);

  const handleAccept = async (applicantId: string) => {
    if (!id) return;
    try {
      await authService.acceptApplicant(id, applicantId);
      Alert.alert('Success', 'Applicant has been accepted.');
      fetchTaskDetails();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not accept the applicant.');
    }
  };

  const handleDeny = async (applicantId: string) => {
    if (!id) return;
    try {
      await authService.denyApplicant(id, applicantId);
      Alert.alert('Success', 'Applicant has been denied.');
      fetchTaskDetails();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not deny the applicant.');
    }
  };

  const handleConfirmCompletion = async () => {
    if (!id) return;
    try {
      await authService.confirmCompletion(id);
      Alert.alert('Success', 'You have confirmed the job completion and released the funds.');
      fetchTaskDetails();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not confirm the job completion.');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading Job Details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchTaskDetails}>
          <Text style={styles.retryButton}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {task && (
        <View style={styles.taskDetailContainer}>
          <Text style={styles.title}>{task.title}</Text>
          <Text style={styles.description}>{task.description}</Text>
          <Text style={styles.price}>Price: ${task.price}</Text>
          <Text style={styles.status}>Status: {task.status}</Text>
        </View>
      )}

      {task && task.status === TaskStatus.COMPLETED && (
        <View style={styles.confirmationContainer}>
          <Text style={styles.confirmationText}>
            The employee has marked this job as completed. Please review their work and release the funds.
          </Text>
          <TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={handleConfirmCompletion}>
            <Text style={styles.buttonText}>Confirm Completion & Release Funds</Text>
          </TouchableOpacity>
        </View>
      )}

      {task && (task.status === TaskStatus.OPEN || task.status === TaskStatus.IN_PROGRESS) && (
        <>
          <Text style={styles.applicantsHeader}>Applicants</Text>
          {applicants.length > 0 ? (
            <FlatList
              data={applicants}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.applicantCard}>
                  <View>
                    <Text style={styles.applicantName}>
                      {item.firstName} {item.lastName}
                    </Text>
                    <Text style={styles.applicantEmail}>{item.email}</Text>
                  </View>
                  <View style={styles.buttonsContainer}>
                    <TouchableOpacity
                      style={[styles.button, styles.acceptButton]}
                      onPress={() => handleAccept(item.id)}
                    >
                      <Text style={styles.buttonText}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, styles.denyButton]} onPress={() => handleDeny(item.id)}>
                      <Text style={styles.buttonText}>Deny</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          ) : (
            <Text style={styles.noApplicantsText}>No applicants yet.</Text>
          )}
        </>
      )}

      {task && (task.status === TaskStatus.CANCELLED || task.status === TaskStatus.PAID) && (
        <Text style={styles.jobClosedText}>This job is closed.</Text>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  retryButton: {
    color: 'blue',
  },
  taskDetailContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 16,
    marginVertical: 10,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  status: {
    fontSize: 16,
    marginTop: 10,
    fontWeight: 'bold',
  },
  applicantsHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  applicantCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  applicantName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  applicantEmail: {
    color: '#555',
  },
  buttonsContainer: {
    flexDirection: 'row',
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginLeft: 10,
  },
  acceptButton: {
    backgroundColor: 'green',
  },
  denyButton: {
    backgroundColor: 'red',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  noApplicantsText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#777',
  },
  confirmationContainer: {
    padding: 20,
    backgroundColor: '#e6f7ff',
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmationText: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: '#28a745',
  },
  jobClosedText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#777',
    marginTop: 30,
  },
});

export default ManageJobScreen;
