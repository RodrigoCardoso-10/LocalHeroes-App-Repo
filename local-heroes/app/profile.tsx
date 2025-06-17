import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActionSheetIOS,
    Alert,
    Image,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from './context/AuthContext';

export default function EditProfileScreen() {
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    skills: [] as string[],
    bio: '',
    profilePicture: '',
  }); // Load user data on mount
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

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        // Request media library permissions
        const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (mediaLibraryStatus !== 'granted') {
          Alert.alert('Permission Needed', 'Media library permission is needed to select photos');
        }

        // Request camera permissions
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        if (cameraStatus !== 'granted') {
          Alert.alert('Permission Needed', 'Camera permission is needed to take photos');
        }
      }
    })();
  }, []);

  const [newSkill, setNewSkill] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setProfileData({
      ...profileData,
      [field]: value,
    });
  };

  const addSkill = () => {
    if (newSkill.trim() !== '') {
      setProfileData({
        ...profileData,
        skills: [...profileData.skills, newSkill.trim()],
      });
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    const updatedSkills = [...profileData.skills];
    updatedSkills.splice(index, 1);
    setProfileData({
      ...profileData,
      skills: updatedSkills,
    });
  };
  const takePhotoWithCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileData({
          ...profileData,
          profilePicture: result.assets[0].uri,
        });
      }
    } catch (error) {
      console.log('Error taking photo:', error);
      Alert.alert('Error', 'There was a problem taking the photo');
    }
  };
  const pickImageFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileData({
          ...profileData,
          profilePicture: result.assets[0].uri,
        });
      }
    } catch (error) {
      console.log('Error picking image:', error);
      Alert.alert('Error', 'There was a problem selecting the image');
    }
  };

  const showImageOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Library'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            takePhotoWithCamera();
          } else if (buttonIndex === 2) {
            pickImageFromGallery();
          }
        }
      );
    } else {
      Alert.alert('Change Profile Picture', 'Choose an option', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: takePhotoWithCamera },
        { text: 'Choose from Library', onPress: pickImageFromGallery },
      ]);
    }
  };
  const handleSave = async () => {
    if (!user) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    try {
      setIsLoading(true);

      // Update profile using auth context
      await updateUser({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        phone: profileData.phone,
        address: profileData.address,
        bio: profileData.bio,
        skills: profileData.skills,
        profilePicture: profileData.profilePicture,
      });

      Alert.alert('Profile Updated', 'Your profile has been successfully updated!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.error('Profile update error:', error);
      Alert.alert('Update Failed', error.message || 'Failed to update profile. Please try again.', [{ text: 'OK' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView style={styles.content}>
        {/* Profile Picture */}
        <View style={styles.profilePictureContainer}>
          <Image
            source={{
              uri: profileData.profilePicture || 'https://randomuser.me/api/portraits/men/32.jpg',
            }}
            style={styles.profilePicture}
          />
          <TouchableOpacity style={styles.editPictureButton} onPress={showImageOptions}>
            <Ionicons name="camera" size={20} color="white" />
          </TouchableOpacity>
        </View>
        {/* Form Fields */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>First Name</Text>
            <TextInput
              style={styles.input}
              value={profileData.firstName}
              onChangeText={(text) => handleInputChange('firstName', text)}
              placeholder="Enter your first name"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Last Name</Text>
            <TextInput
              style={styles.input}
              value={profileData.lastName}
              onChangeText={(text) => handleInputChange('lastName', text)}
              placeholder="Enter your last name"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              value={profileData.email}
              onChangeText={(text) => handleInputChange('email', text)}
              placeholder="Enter your email"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Phone</Text>
            <TextInput
              style={styles.input}
              value={profileData.phone}
              onChangeText={(text) => handleInputChange('phone', text)}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Address</Text>
            <TextInput
              style={styles.input}
              value={profileData.address}
              onChangeText={(text) => handleInputChange('address', text)}
              placeholder="Enter your address"
              multiline
            />
          </View>
        </View>
        {/* Skills Section */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Skills</Text>

          <View style={styles.skillsContainer}>
            {profileData.skills.map((skill, index) => (
              <View key={index} style={styles.skillChip}>
                <Text style={styles.skillText}>{skill}</Text>
                <TouchableOpacity onPress={() => removeSkill(index)}>
                  <Ionicons name="close-circle" size={16} color="#666" />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View style={styles.newSkillInput}>
            <TextInput
              style={styles.input}
              value={newSkill}
              onChangeText={setNewSkill}
              placeholder="Add a new skill"
            />
          </View>

          <TouchableOpacity style={styles.addButton} onPress={addSkill}>
            <Text style={styles.addButtonText}>Add Skill</Text>
          </TouchableOpacity>
        </View>
        {/* Bio Section */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Bio</Text>
          <TextInput
            style={[styles.input, styles.bioInput]}
            value={profileData.bio}
            onChangeText={(text) => handleInputChange('bio', text)}
            placeholder="Tell us about yourself and your experience"
            multiline
            numberOfLines={4}
          />
        </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#2BB6A3',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    color: '#0ca678',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  profilePictureContainer: {
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#2BB6A3',
  },
  editPictureButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2BB6A3',
    borderRadius: 20,
    padding: 8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  formSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  skillChip: {
    backgroundColor: '#e0e0e0',
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  skillText: {
    fontSize: 14,
    marginRight: 5,
  },
  newSkillInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#2BB6A3',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#ff6347',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomSpace: {
    height: 40,
  },
});
