import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { 
  scale, 
  verticalScale, 
  moderateScale, 
  SCREEN_WIDTH as width, 
  SCREEN_HEIGHT as height,
  isSmallMobile,
  isMediumMobile,
  isLargeMobile
} from '../../utils/responsive';

const EditProfile = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    dateOfBirth: user?.dateOfBirth || new Date(1990, 0, 1),
    emergencyContact: user?.emergencyContact || '',
    avatar: user?.avatar || null,
    allergies: user?.allergies || '',
    medicalConditions: user?.medicalConditions || '',
    occupation: user?.occupation || '',
    preferredLanguage: user?.preferredLanguage || 'English'
  });
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState({});

  const pickImage = async () => {
    // Since we're removing ImagePicker, we'll just show an alert informing the user
    // that this functionality is not available
    Alert.alert(
      'Feature Unavailable',
      'Image picking functionality is not available in this version.',
      [{ text: 'OK' }]
    );
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave(formData);
    } else {
      Alert.alert('Validation Error', 'Please check the form for errors');
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData({
        ...formData,
        dateOfBirth: selectedDate
      });
    }
  };

  const renderAvatar = (name) => (
    <View style={styles.generatedAvatar}>
      <Text style={styles.avatarText}>{name[0].toUpperCase()}</Text>
    </View>
  );

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView style={styles.scrollContainer}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={onCancel}>
              <MaterialIcons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Profile</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.profileImageContainer}>
            {formData.avatar ? (
              <Image source={{ uri: formData.avatar }} style={styles.profileImage} />
            ) : (
              renderAvatar(formData.name || user?.name || 'U')
            )}
            <TouchableOpacity style={styles.changePhotoButton} onPress={pickImage}>
              <MaterialIcons name="photo-camera" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name*</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="person" size={20} color="#007bff" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(text) => setFormData({...formData, name: text})}
                  placeholder="Enter your full name"
                />
              </View>
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number*</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="phone" size={20} color="#007bff" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.phone}
                  onChangeText={(text) => setFormData({...formData, phone: text})}
                  placeholder="Enter your phone number"
                  keyboardType="phone-pad"
                />
              </View>
              {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="email" size={20} color="#007bff" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(text) => setFormData({...formData, email: text})}
                  placeholder="Enter your email address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Address</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="location-on" size={20} color="#007bff" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.address}
                  onChangeText={(text) => setFormData({...formData, address: text})}
                  placeholder="Enter your address"
                  multiline
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date of Birth</Text>
              <TouchableOpacity 
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <MaterialIcons name="cake" size={20} color="#007bff" style={styles.inputIcon} />
                <Text style={styles.dateText}>
                  {formatDate(formData.dateOfBirth)}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={formData.dateOfBirth}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                  maximumDate={new Date()}
                />
              )}
            </View>

            <Text style={[styles.sectionTitle, {marginTop: 25}]}>Additional Information</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Preferred Language</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="language" size={20} color="#007bff" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.preferredLanguage}
                  onChangeText={(text) => setFormData({...formData, preferredLanguage: text})}
                  placeholder="Enter your preferred language"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Occupation</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="work" size={20} color="#007bff" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.occupation}
                  onChangeText={(text) => setFormData({...formData, occupation: text})}
                  placeholder="Enter your occupation"
                />
              </View>
            </View>

            <Text style={[styles.sectionTitle, {marginTop: 25}]}>Health Information</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Emergency Contact</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="contact-phone" size={20} color="#007bff" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.emergencyContact}
                  onChangeText={(text) => setFormData({...formData, emergencyContact: text})}
                  placeholder="Name and phone number"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Allergies</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="medical" size={20} color="#007bff" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.allergies}
                  onChangeText={(text) => setFormData({...formData, allergies: text})}
                  placeholder="List any allergies"
                  multiline
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Medical Conditions</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="fitness" size={20} color="#007bff" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.medicalConditions}
                  onChangeText={(text) => setFormData({...formData, medicalConditions: text})}
                  placeholder="Any conditions we should be aware of"
                  multiline
                />
              </View>
            </View>

            <Text style={styles.disclaimer}>
              * Health information is used only for ensuring your safety and comfort during your stay and services
            </Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginVertical: 25,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#e6f2ff',
  },
  generatedAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#e6f2ff',
  },
  avatarText: {
    color: '#fff',
    fontSize: 48,
    fontWeight: 'bold',
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: '38%',
    backgroundColor: '#007bff',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  inputIcon: {
    marginLeft: 12,
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 12,
    fontSize: 16,
    color: '#333',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingVertical: 12,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  errorText: {
    color: '#d9534f',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  disclaimer: {
    fontSize: 12,
    color: '#777',
    fontStyle: 'italic',
    marginTop: 10,
    marginBottom: 25,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#007bff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 8,
    marginLeft: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default EditProfile;