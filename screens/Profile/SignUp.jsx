import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  Alert
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import LinearGradient from 'react-native-linear-gradient';
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  User,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ChevronLeft,
  ArrowRight,
  ShieldCheck,
  UserPlus
} from 'lucide-react-native';
import { useAuth } from '../AuthContext';
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

const ExecutiveHeader = ({ title, onBack }) => (
  <View style={styles.luxeExecutiveHeader}>
    <View style={styles.luxeHeaderContent}>
      {onBack && (
        <TouchableOpacity onPress={onBack} style={styles.luxeHeaderBackBtn}>
          <ChevronLeft size={24} color="#348f9f" />
        </TouchableOpacity>
      )}
      <View style={styles.luxeHeaderTitleWrapper}>
        <Text style={styles.luxeHeaderPrestige}>PRESTIGE</Text>
        <Text style={styles.luxeHeaderMainTitle}>{title}</Text>
      </View>
      <View style={styles.luxeHeaderProfile}>
        <UserPlus size={20} color="#348f9f" />
      </View>
    </View>
  </View>
);

const SignUp = ({ goBack, navigation }) => {
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const phoneRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  const validatePhone = (phone) => /^\d{10}$/.test(phone);
  const validateName = (name) => {
    const nameRegex = /^[A-Za-z\s]+$/;
    return nameRegex.test(name) && name.trim().length > 0;
  };
  const validatePassword = (password) => password.length >= 6;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    if (generalError) setGeneralError('');
  };

  const handleSignUp = async () => {
    const { username, phone, password, confirmPassword } = formData;
    setErrors({});
    setGeneralError('');
    setSuccessMessage('');

    const newErrors = {};
    if (!username) newErrors.username = 'Full name is required';
    else if (!validateName(username)) newErrors.username = 'Invalid name (letters only)';

    if (!phone) newErrors.phone = 'Phone number is required';
    else if (!validatePhone(phone)) newErrors.phone = 'Invalid 10-digit number';

    if (!password) newErrors.password = 'Password is required';
    else if (!validatePassword(password)) newErrors.password = 'Min 6 characters required';

    if (!confirmPassword) newErrors.confirmPassword = 'Confirmation required';
    else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    if (!acceptTerms) {
      setGeneralError('Please accept the Terms & Conditions');
      return;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        "https://api.codingboss.in/kovais/create-customer/",
        { name: username, phone, password },
        { headers: { "Content-Type": "application/json", "Accept": "application/json" } }
      );

      if (response.status === 200 || response.status === 201) {
        const rawUser = response.data.user || {};
        const loginUser = {
          ...rawUser,
          phone: phone || rawUser.phone,
          customer_phone: phone || rawUser.phone,
          registrator_phone: phone, // Explicit account-created marker
          username: rawUser.username || phone // usually phone is the username
        };
        await AsyncStorage.setItem("signedUpUser", JSON.stringify(loginUser));
        await login(loginUser);
        setSuccessMessage('Account created successfully!');

        setTimeout(() => {
          if (navigation) navigation.navigate('MainTabs', { screen: 'Profile' });
          else if (goBack) goBack();
        }, 1500);
      }
    } catch (error) {
      console.error("Signup Error:", error.response ? error.response.data : error.message);
      setGeneralError(error.response?.data?.error || error.response?.data?.message || "Sign-Up Failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    if (goBack) goBack();
    else if (navigation) {
      if (navigation.canGoBack()) navigation.goBack();
      else navigation.navigate('Login');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ExecutiveHeader title="Register" onBack={handleGoBack} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animatable.View animation="fadeInUp" duration={800} style={styles.luxeMainContent}>
            <View style={styles.logoBadge}>
              <UserPlus size={40} color="#348f9f" />
            </View>

            <View style={styles.headerTextSection}>
              <Text style={styles.luxeHeading}>Create Account</Text>
              <Text style={styles.luxeSubheading}>Join the Prestige community for premium access</Text>
            </View>

            {generalError ? (
              <View style={styles.errorBanner}>
                <ShieldCheck size={18} color="#FF6B6B" />
                <Text style={styles.errorBannerText}>{generalError}</Text>
              </View>
            ) : null}

            {successMessage ? (
              <View style={styles.successBanner}>
                <ShieldCheck size={18} color="#10B981" />
                <Text style={styles.successBannerText}>{successMessage}</Text>
              </View>
            ) : null}

            <View style={styles.luxeForm}>
              <View style={[styles.luxeInputGroup, errors.username && styles.luxeInputError]}>
                <View style={styles.luxeInputIcon}>
                  <User size={20} color="#348f9f" />
                </View>
                <TextInput
                  placeholder="Full Name"
                  style={styles.luxeTextInput}
                  value={formData.username}
                  onChangeText={(text) => handleInputChange('username', text)}
                  placeholderTextColor="#94A3B8"
                  editable={!isLoading}
                />
              </View>
              {errors.username && <Text style={styles.errorHint}>{errors.username}</Text>}

              <View style={[styles.luxeInputGroup, errors.phone && styles.luxeInputError]}>
                <View style={styles.luxeInputIcon}>
                  <Phone size={20} color="#348f9f" />
                </View>
                <TextInput
                  ref={phoneRef}
                  placeholder="Phone Number"
                  style={styles.luxeTextInput}
                  value={formData.phone}
                  onChangeText={(text) => handleInputChange('phone', text)}
                  keyboardType="phone-pad"
                  maxLength={10}
                  placeholderTextColor="#94A3B8"
                  editable={!isLoading}
                />
              </View>
              {errors.phone && <Text style={styles.errorHint}>{errors.phone}</Text>}

              <View style={[styles.luxeInputGroup, errors.password && styles.luxeInputError]}>
                <View style={styles.luxeInputIcon}>
                  <Lock size={20} color="#348f9f" />
                </View>
                <TextInput
                  ref={passwordRef}
                  placeholder="Password"
                  style={styles.luxeTextInput}
                  value={formData.password}
                  onChangeText={(text) => handleInputChange('password', text)}
                  secureTextEntry={!showPassword}
                  placeholderTextColor="#94A3B8"
                  editable={!isLoading}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={20} color="#94A3B8" /> : <Eye size={20} color="#94A3B8" />}
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorHint}>{errors.password}</Text>}

              <View style={[styles.luxeInputGroup, errors.confirmPassword && styles.luxeInputError]}>
                <View style={styles.luxeInputIcon}>
                  <Lock size={20} color="#348f9f" />
                </View>
                <TextInput
                  ref={confirmPasswordRef}
                  placeholder="Confirm Password"
                  style={styles.luxeTextInput}
                  value={formData.confirmPassword}
                  onChangeText={(text) => handleInputChange('confirmPassword', text)}
                  secureTextEntry={!showConfirmPassword}
                  placeholderTextColor="#94A3B8"
                  editable={!isLoading}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <EyeOff size={20} color="#94A3B8" /> : <Eye size={20} color="#94A3B8" />}
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && <Text style={styles.errorHint}>{errors.confirmPassword}</Text>}

              <TouchableOpacity
                style={styles.termsRow}
                onPress={() => setAcceptTerms(!acceptTerms)}
                activeOpacity={0.7}
              >
                <View style={[styles.luxeCheckbox, acceptTerms && styles.luxeCheckboxActive]}>
                  {acceptTerms && <ShieldCheck size={14} color="#FFFFFF" />}
                </View>
                <Text style={styles.termsLabel}>Agree to <Text style={styles.termsLink}>Terms & Conditions</Text></Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitWrapper}
                onPress={handleSignUp}
                disabled={isLoading}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#348f9f', '#2c3e50']}
                  style={styles.luxePrimaryBtn}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Text style={styles.luxePrimaryBtnText}>Create Account</Text>
                      <ArrowRight size={20} color="#FFFFFF" />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.luxeFooterLinkRow}>
                <Text style={styles.luxeFooterLabel}>Joined already?</Text>
                <TouchableOpacity onPress={handleGoBack}>
                  <Text style={styles.luxeFooterLink}>Sign In Here</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animatable.View>
          <Text style={styles.legalNotice}>
            Premium membership entitles you to exclusive lounge access and executive services.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  luxeExecutiveHeader: {
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 0 : verticalScale(10),
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  luxeHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(15),
  },
  luxeHeaderBackBtn: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(12),
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  luxeHeaderTitleWrapper: {
    alignItems: 'center',
  },
  luxeHeaderPrestige: {
    fontSize: moderateScale(10),
    fontWeight: '800',
    color: '#348f9f',
    letterSpacing: 3,
    marginBottom: verticalScale(2),
  },
  luxeHeaderMainTitle: {
    fontSize: moderateScale(18),
    fontWeight: '800',
    color: '#1E293B',
  },
  luxeHeaderProfile: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(12),
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  luxeMainContent: {
    paddingHorizontal: scale(30),
    paddingTop: verticalScale(30),
    alignItems: 'center',
  },
  logoBadge: {
    width: moderateScale(90),
    height: moderateScale(90),
    borderRadius: moderateScale(24),
    backgroundColor: '#F0FDFA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(24),
  },
  headerTextSection: {
    alignItems: 'center',
    marginBottom: verticalScale(30),
  },
  luxeHeading: {
    fontSize: moderateScale(28),
    fontWeight: '900',
    color: '#1E293B',
    marginBottom: verticalScale(8),
  },
  luxeSubheading: {
    fontSize: moderateScale(15),
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: scale(20),
  },
  luxeForm: {
    width: '100%',
  },
  luxeInputGroup: {
    width: '100%',
    height: verticalScale(60),
    backgroundColor: '#F8FAFC',
    borderRadius: moderateScale(18),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    marginBottom: verticalScale(12),
  },
  luxeInputError: {
    borderColor: '#FF6B6B',
  },
  luxeInputIcon: {
    marginRight: scale(16),
  },
  luxeTextInput: {
    flex: 1,
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#1E293B',
  },
  errorHint: {
    color: '#FF6B6B',
    fontSize: moderateScale(12),
    fontWeight: '700',
    marginLeft: scale(16),
    marginBottom: verticalScale(12),
    marginTop: verticalScale(-8),
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(24),
    marginTop: verticalScale(8),
    marginLeft: scale(4),
  },
  luxeCheckbox: {
    width: moderateScale(22),
    height: moderateScale(22),
    borderRadius: moderateScale(6),
    borderWidth: 2,
    borderColor: '#348f9f',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  luxeCheckboxActive: {
    backgroundColor: '#348f9f',
  },
  termsLabel: {
    fontSize: moderateScale(14),
    color: '#64748B',
    fontWeight: '600',
  },
  termsLink: {
    color: '#348f9f',
    fontWeight: '800',
  },
  submitWrapper: {
    width: '100%',
  },
  luxePrimaryBtn: {
    width: '100%',
    height: verticalScale(64),
    borderRadius: moderateScale(20),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  luxePrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: moderateScale(18),
    fontWeight: '800',
  },
  luxeFooterLinkRow: {
    flexDirection: 'row',
    marginTop: verticalScale(24),
    justifyContent: 'center',
    gap: 8,
  },
  luxeFooterLabel: {
    color: '#64748B',
    fontSize: moderateScale(15),
    fontWeight: '600',
  },
  luxeFooterLink: {
    color: '#348f9f',
    fontSize: moderateScale(15),
    fontWeight: '800',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    width: '100%',
    padding: moderateScale(16),
    borderRadius: moderateScale(16),
    marginBottom: verticalScale(24),
    gap: 12,
  },
  errorBannerText: {
    color: '#FF6B6B',
    fontSize: moderateScale(14),
    fontWeight: '700',
    flex: 1,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    width: '100%',
    padding: moderateScale(16),
    borderRadius: moderateScale(16),
    marginBottom: verticalScale(24),
    gap: 12,
  },
  successBannerText: {
    color: '#10B981',
    fontSize: moderateScale(14),
    fontWeight: '700',
    flex: 1,
  },
  legalNotice: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: moderateScale(12),
    marginTop: verticalScale(30),
    paddingHorizontal: scale(40),
    lineHeight: moderateScale(18),
    marginBottom: verticalScale(40),
  }
});

export default SignUp;