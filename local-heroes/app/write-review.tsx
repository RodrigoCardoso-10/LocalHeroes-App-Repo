import React, { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,

} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useReviews } from './context/ReviewsContext';


type UserType = "employer" | "employee" | null;

export default function WriteReviewScreen() {
  const { addReview } = useReviews();

  const { userId } = useLocalSearchParams();

  const [rating, setRating] = useState(0);
  const [reviewData, setReviewData] = useState({
    firstName: "",
    lastName: "",
    comment: "",
  });
  const [userType, setUserType] = useState<UserType>(null);

  const handleSubmit = () => {
    // Validate all required fields
    if (!reviewedUserId) {
      Alert.alert("Error", "No user selected to review.");
      return;
    }
    if (rating === 0) {
      Alert.alert("Error", "Please select a rating");
      return;
    }
    if (!userType) {
      Alert.alert("Error", "Please select if you are an employer or employee");
      return;
    }
    if (!reviewData.firstName.trim()) {
      Alert.alert("Error", "Please enter your first name");
      return;
    }
    if (!reviewData.lastName.trim()) {
      Alert.alert("Error", "Please enter your last name");
      return;
    }
    if (!reviewData.comment.trim()) {
      Alert.alert("Error", "Please write a review");
      return;
    }

    // Add the review to the global state
    addReview({
      userName: `${reviewData.firstName} ${reviewData.lastName}`,
      rating,
      comment: reviewData.comment,

      reviewedUserId: userId as string,

    });

    Alert.alert("Success", "Thank you for your review!", [
      {
        text: "OK",
        onPress: () => router.back(),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Write a Review</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* User Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>I am a...</Text>
          <View style={styles.userTypeContainer}>
            <TouchableOpacity
              style={[
                styles.userTypeButton,
                userType === "employer" && styles.selectedUserType,
              ]}
              onPress={() => setUserType("employer")}
            >
              <Ionicons
                name="briefcase-outline"
                size={24}
                color={userType === "employer" ? "white" : "#0ca678"}
              />
              <Text
                style={[
                  styles.userTypeText,
                  userType === "employer" && styles.selectedUserTypeText,
                ]}
              >
                Employer
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.userTypeButton,
                userType === "employee" && styles.selectedUserType,
              ]}
              onPress={() => setUserType("employee")}
            >
              <Ionicons
                name="person-outline"
                size={24}
                color={userType === "employee" ? "white" : "#0ca678"}
              />
              <Text
                style={[
                  styles.userTypeText,
                  userType === "employee" && styles.selectedUserTypeText,
                ]}
              >
                Employee
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.inputRow}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>First Name*</Text>
              <TextInput
                style={styles.input}
                value={reviewData.firstName}
                onChangeText={(text) =>
                  setReviewData({ ...reviewData, firstName: text })
                }
                placeholder="Enter first name"
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Last Name*</Text>
              <TextInput
                style={styles.input}
                value={reviewData.lastName}
                onChangeText={(text) =>
                  setReviewData({ ...reviewData, lastName: text })
                }
                placeholder="Enter last name"
              />
            </View>
          </View>
        </View>

        {/* Rating Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rating*</Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                style={styles.starButton}
              >
                <Ionicons
                  name={star <= rating ? "star" : "star-outline"}
                  size={40}
                  color="#FFD700"
                />
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.ratingText}>
            {rating > 0
              ? `${rating} star${rating > 1 ? "s" : ""}`
              : "Tap to rate"}
          </Text>
        </View>

        {/* Review Text */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Review*</Text>
          <TextInput
            style={styles.reviewInput}
            multiline
            numberOfLines={6}
            value={reviewData.comment}
            onChangeText={(text) =>
              setReviewData({ ...reviewData, comment: text })
            }
            placeholder="Write your review here..."
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit Review</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#000",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  userTypeContainer: {
    flexDirection: "row",
    gap: 12,
  },
  userTypeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#0ca678",
    backgroundColor: "white",
  },
  selectedUserType: {
    backgroundColor: "#0ca678",
    borderColor: "#0ca678",
  },
  userTypeText: {
    fontSize: 16,
    color: "#0ca678",
    fontWeight: "500",
  },
  selectedUserTypeText: {
    color: "white",
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  halfInput: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 12,
  },
  starButton: {
    padding: 8,
  },
  ratingText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
  },
  submitButton: {
    backgroundColor: "#0ca678",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginBottom: 32,
  },
  submitButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
