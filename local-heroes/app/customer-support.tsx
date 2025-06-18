import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
// Using buttons instead of Picker component to avoid potential compatibility issues
import { useAuth } from './context/AuthContext';

export default function CustomerSupportScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <CustomerSupportContent />
    </>
  );
}

function CustomerSupportContent() {
  const { user } = useAuth();
  const [name, setName] = useState(user ? `${user.firstName} ${user.lastName}` : '');
  const [email, setEmail] = useState(user?.email || '');
  const [category, setCategory] = useState('general');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [expandedFaqId, setExpandedFaqId] = useState<number | null>(null);
  
  // FAQ data
  const faqItems = [
    {
      id: 1,
      question: 'How do I reset my password?',
      answer: 'To reset your password, go to the login screen and tap on "Forgot Password". Enter your email address and follow the instructions sent to your email. You will receive a link to create a new password.'
    },
    {
      id: 2,
      question: 'How do I update my profile information?',
      answer: 'You can update your profile information by navigating to the Profile tab, then tapping on the Edit Profile button. From there, you can modify your personal details, contact information, and profile picture.'
    },
    {
      id: 3,
      question: 'How do I cancel a job posting?',
      answer: 'To cancel a job posting, go to the Jobs tab, select the specific job you want to cancel, and tap on the "Cancel Job" button. You will be asked to confirm the cancellation. Note that cancellations may be subject to our cancellation policy.'
    },
    {
      id: 4,
      question: 'How do I become a verified service provider?',
      answer: 'To become a verified service provider, complete your profile with all required information, submit any necessary certifications or licenses, and request verification through the Profile section. Our team will review your submission and typically respond within 2-3 business days.'
    },
    {
      id: 5,
      question: 'What payment methods are accepted?',
      answer: 'We accept major credit and debit cards (Visa, MasterCard, American Express), PayPal, and bank transfers. All payments are securely processed and encrypted to ensure your financial information remains safe.'
    }
  ];

  // Email validation function
  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Form validation
  const isFormValid = name.trim() !== '' && 
    email.trim() !== '' && 
    validateEmail(email) && 
    category !== '' && 
    subject.trim() !== '' && 
    message.trim() !== '';

  const handleSubmit = async () => {
    // Validate form
    if (!isFormValid) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      // In a real app, you would send this data to your backend
      // For now, we'll simulate a successful submission
      setTimeout(() => {
        setIsSubmitting(false);
        Alert.alert(
          'Success',
          'Your support request has been submitted. Our team will get back to you within 24 hours.',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
        
        // Reset form
        setSubject('');
        setMessage('');
        setCategory('general');
      }, 1500);
    } catch (error) {
      setIsSubmitting(false);
      Alert.alert('Error', 'Failed to submit your request. Please try again later.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Customer Support</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Customer Support</Text>
            <Text style={styles.label}>
              Need help? Fill out the form below and our support team will get back to you within 24 hours.
            </Text>

            {/* Form */}
            <View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your full name"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Category</Text>
                <View style={styles.categoryContainer}>
                  <TouchableOpacity 
                    style={[styles.categoryButton, category === 'general' && styles.categoryButtonActive]}
                    onPress={() => setCategory('general')}
                  >
                    <Text style={[styles.categoryText, category === 'general' && styles.categoryTextActive]}>General Inquiry</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.categoryButton, category === 'technical' && styles.categoryButtonActive]}
                    onPress={() => setCategory('technical')}
                  >
                    <Text style={[styles.categoryText, category === 'technical' && styles.categoryTextActive]}>Technical Support</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.categoryButton, category === 'billing' && styles.categoryButtonActive]}
                    onPress={() => setCategory('billing')}
                  >
                    <Text style={[styles.categoryText, category === 'billing' && styles.categoryTextActive]}>Billing Issue</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.categoryButton, category === 'account' && styles.categoryButtonActive]}
                    onPress={() => setCategory('account')}
                  >
                    <Text style={[styles.categoryText, category === 'account' && styles.categoryTextActive]}>Account Problem</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.categoryButton, category === 'feature' && styles.categoryButtonActive]}
                    onPress={() => setCategory('feature')}
                  >
                    <Text style={[styles.categoryText, category === 'feature' && styles.categoryTextActive]}>Feature Request</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.categoryButton, category === 'bug' && styles.categoryButtonActive]}
                    onPress={() => setCategory('bug')}
                  >
                    <Text style={[styles.categoryText, category === 'bug' && styles.categoryTextActive]}>Report a Bug</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Subject</Text>
                <TextInput
                  style={styles.input}
                  value={subject}
                  onChangeText={setSubject}
                  placeholder="Enter the subject of your inquiry"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Message</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Please describe your issue in detail"
                  multiline={true}
                  numberOfLines={6}
                  textAlignVertical="top"
                />
              </View>

              <TouchableOpacity
                style={[styles.submitButton, isSubmitting || !isFormValid ? { opacity: 0.6 } : null]}
                onPress={handleSubmit}
                disabled={isSubmitting || !isFormValid}
              >
                <Text style={styles.submitButtonText}>
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Contact Us</Text>

            <View style={styles.contactMethodsContainer}>
              <View style={styles.contactMethod}>
                <View style={styles.contactIcon}>
                  <MaterialIcons name="email" size={24} color="#2A9D8F" />
                </View>
                <Text style={styles.contactTitle}>Email</Text>
                <Text style={styles.contactValue}>support@localheroes.com</Text>
              </View>

              <View style={styles.contactMethod}>
                <View style={styles.contactIcon}>
                  <MaterialIcons name="phone" size={24} color="#2A9D8F" />
                </View>
                <Text style={styles.contactTitle}>Phone</Text>
                <Text style={styles.contactValue}>+1 (555) 123-4567</Text>
              </View>

              <View style={styles.contactMethod}>
                <View style={styles.contactIcon}>
                  <MaterialIcons name="chat" size={24} color="#2A9D8F" />
                </View>
                <Text style={styles.contactTitle}>Live Chat</Text>
                <Text style={styles.contactValue}>9AM - 5PM</Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
            {faqItems.map((item) => (
              <View key={item.id} style={styles.faqItemContainer}>
                <TouchableOpacity 
                  style={styles.faqItem}
                  onPress={() => setExpandedFaqId(expandedFaqId === item.id ? null : item.id)}
                >
                  <Text style={styles.faqQuestion}>{item.question}</Text>
                  <Ionicons 
                    name={expandedFaqId === item.id ? "chevron-down" : "chevron-forward"} 
                    size={20} 
                    color="#666" 
                  />
                </TouchableOpacity>
                {expandedFaqId === item.id && (
                  <View style={styles.faqAnswer}>
                    <Text style={styles.faqAnswerText}>{item.answer}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    backgroundColor: '#2A9D8F',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2A9D8F',
    paddingLeft: 8,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  categoryContainer: {
    flexDirection: 'column',
    marginTop: 4,
  },
  categoryButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#F0F9F8',
    borderColor: '#2A9D8F',
    borderLeftWidth: 4,
  },
  categoryText: {
    fontSize: 16,
    color: '#333',
  },
  categoryTextActive: {
    color: '#2A9D8F',
    fontWeight: '500',
  },
  textArea: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#2A9D8F',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contactMethodsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  contactMethod: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  contactIcon: {
    marginBottom: 8,
    backgroundColor: '#F0F9F8',
    padding: 12,
    borderRadius: 50,
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 14,
    color: '#2A9D8F',
  },
  faqItemContainer: {
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 8,
  },
  faqItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    color: '#333',
  },
  faqAnswer: {
    backgroundColor: '#F0F9F8',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  faqAnswerText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#555',
  },
});
