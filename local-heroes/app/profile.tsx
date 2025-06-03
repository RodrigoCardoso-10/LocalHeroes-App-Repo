import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  TextInput,
  ScrollView,
  Image,
  Alert,
  Platform,
  ActionSheetIOS
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function EditProfileScreen() {
  const [profileData, setProfileData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main Street, Anytown, USA',
    skills: ['Plumbing', 'Electrical', 'Carpentry'],
    bio: 'Professional handyman with over 10 years of experience in residential and commercial repairs.',
    profileImage: 'https://randomuser.me/api/portraits/men/32.jpg'
  });
  
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
      [field]: value
    });
  };

  const addSkill = () => {
    if (newSkill.trim() !== '') {
      setProfileData({
        ...profileData,
        skills: [...profileData.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    const updatedSkills = [...profileData.skills];
    updatedSkills.splice(index, 1);
    setProfileData({
      ...profileData,
      skills: updatedSkills
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
          profileImage: result.assets[0].uri
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
          profileImage: result.assets[0].uri
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
      Alert.alert(
        'Change Profile Picture',
        'Choose an option',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Take Photo', onPress: takePhotoWithCamera },
          { text: 'Choose from Library', onPress: pickImageFromGallery },
        ]
      );
    }
  };

  const handleSave = () => {
    // Save profile data logic would go here
    Alert.alert(
      'Profile Updated', 
      'Your profile has been successfully updated!',
      [
        { text: 'OK', onPress: () => router.back() }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        {/* Profile Picture */}
        <View style={styles.profilePictureContainer}>
          <Image 
            source={{ uri: profileData.profileImage }} 
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
              <View key={index} style={styles.skillTag}>
                <Text style={styles.skillText}>{skill}</Text>
                <TouchableOpacity onPress={() => removeSkill(index)}>
                  <Ionicons name="close-circle" size={16} color="#666" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          
          <View style={styles.addSkillContainer}>
            <TextInput
              style={styles.skillInput}
              value={newSkill}
              onChangeText={setNewSkill}
              placeholder="Add a new skill"
            />
            <TouchableOpacity style={styles.addButton} onPress={addSkill}>
              <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>
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
    backgroundColor: '#000',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveButton: {
    padding: 4,
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
    alignItems: 'center',
    marginVertical: 20,
    position: 'relative',
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#0ca678',
  },
  editPictureButton: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    backgroundColor: '#0ca678',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  formSection: {
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
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  skillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f8f5',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    color: '#0ca678',
    marginRight: 4,
  },
  addSkillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skillInput: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
  },
  addButton: {
    backgroundColor: '#0ca678',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSpace: {
    height: 40,
  },
});
