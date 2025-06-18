import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';

type Review = {
  id: number;
  name: string;
  title: string;
  experience: string;
  rating: number;
};

const initialReviews: Review[] = [
  {
    id: 1,
    name: 'Jane Doe',
    title: 'Helped me land my first job!',
    experience: 'The app made it easy to browse and apply to jobs. Notifications were super helpful.',
    rating: 5,
  },
  {
    id: 2,
    name: 'Sam Lee',
    title: 'Good, but could improve search filters',
    experience: 'I found several listings, but filtering by salary range would be great.',
    rating: 4,
  },
];

const ReviewsPage = () => {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [experience, setExperience] = useState('');
  const [rating, setRating] = useState(5);

  const handleSubmit = () => {
    if (!name || !title || !experience) return;
    const newReview: Review = {
      id: Date.now(),
      name,
      title,
      experience,
      rating,
    };
    setReviews([newReview, ...reviews]);
    setName('');
    setTitle('');
    setExperience('');
    setRating(5);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Review the Job Listings App</Text>
      
      <View style={styles.form}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Your Name:</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Review Title:</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter review title"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Your Experience:</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={experience}
            onChangeText={setExperience}
            placeholder="Share your experience..."
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>App Usefulness Rating:</Text>
          <View style={styles.ratingContainer}>
            {[5, 4, 3, 2, 1].map((star) => (
              <Pressable
                key={star}
                style={[
                  styles.ratingButton,
                  rating === star && styles.selectedRating,
                ]}
                onPress={() => setRating(star)}
              >
                <Text style={styles.ratingText}>
                  {star} {star === 5 ? '(Excellent)' : star === 1 ? '(Poor)' : ''}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit Review</Text>
        </Pressable>
      </View>

      <View style={styles.reviewsList}>
        {reviews.map(review => (
          <View key={review.id} style={styles.reviewItem}>
            <Text style={styles.reviewTitle}>{review.title}</Text>
            <Text style={styles.reviewMeta}>by {review.name} ({review.rating} / 5)</Text>
            <Text style={styles.reviewText}>{review.experience}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  form: {
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratingButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    minWidth: 60,
    alignItems: 'center',
  },
  selectedRating: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  ratingText: {
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  submitButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  reviewsList: {
    marginTop: 24,
  },
  reviewItem: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  reviewMeta: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  reviewText: {
    fontSize: 16,
    lineHeight: 24,
  },
});

export default ReviewsPage;
