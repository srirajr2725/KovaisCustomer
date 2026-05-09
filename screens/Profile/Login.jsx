import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
  StatusBar,
  SafeAreaView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Animatable from 'react-native-animatable';
import LinearGradient from 'react-native-linear-gradient';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ChevronLeft,
  ArrowRight,
  ShieldCheck,
  Zap,
  LogIn
} from 'lucide-react-native';
import { useAuth } from '../AuthContext';
import { useNavigation } from '@react-navigation/native';
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

const STORAGE_KEYS = {
  LOGGED_IN_USER: 'loggedInUser',
  CURRENT_USER_ID: 'currentUserId',
  URL: 'url',
  POINTS: 'points',
  LOGIN_TIMESTAMP: 'loginTimestamp',
  USER_DATA: 'User_data',
};

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
        <LogIn size={20} color="#348f9f" />
      </View>
    </View>
  </View>
);

const Login = ({
  route,
  goBack,
  onLogin,
  showSignUp,
  showForgotPassword,
  onClose,
  isModal,
  setPoints,
  setUrl,
  setAadhar,
}) => {
  const { login, user, logout } = useAuth();
  const navigation = useNavigation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [savedUser, setSavedUser] = useState(null);

  const { returnTo, bookingData, message, requiresAuth = false } = route?.params || {};

  const usernameRef = useRef(null);
  const passwordRef = useRef(null);

  useEffect(() => {
    const loadStoredUser = async () => {
      try {
        if (user) {
          setSavedUser(user);
        } else {
          const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.LOGGED_IN_USER);
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setSavedUser(parsedUser);
          }
        }
      } catch (error) {
        console.error('Error loading stored user:', error);
      }
    };
    loadStoredUser();
  }, [user]);

  const saveLoginData = async userData => {
    try {
      const unifiedUserData = {
        ...userData,
        user_id: userData.user_id || userData.id,
        username: userData.username || userData.name,
        name: userData.name || userData.username,
        phone: userData.phone || userData.mobile || userData.contact || (/^\d{10}$/.test(userData.username) ? userData.username : ''),
        mobile: userData.mobile || userData.phone || userData.contact || (/^\d{10}$/.test(userData.username) ? userData.username : ''),
        email: userData.email || '',
        emblem_url: userData.emblem_url || userData.avatar || '',
        points: userData.points || 0,
        success: true,
        profileCompleted: userData.profileCompleted || false,
      };

      await AsyncStorage.multiSet([
        [STORAGE_KEYS.LOGGED_IN_USER, JSON.stringify(unifiedUserData)],
        [STORAGE_KEYS.USER_DATA, JSON.stringify(unifiedUserData)],
        [STORAGE_KEYS.CURRENT_USER_ID, JSON.stringify(unifiedUserData.user_id)],
        [STORAGE_KEYS.URL, JSON.stringify(unifiedUserData.emblem_url)],
        [STORAGE_KEYS.POINTS, JSON.stringify(unifiedUserData.points)],
        [STORAGE_KEYS.LOGIN_TIMESTAMP, new Date().toISOString()],
      ]);

      if (setPoints) setPoints(unifiedUserData.points);
      if (setUrl) setUrl(unifiedUserData.emblem_url);
      if (setAadhar) setAadhar(unifiedUserData.aadhar || '');

      return unifiedUserData;
    } catch (error) {
      console.error('❌ Error saving login data:', error);
      throw error;
    }
  };

  const loginUser = async (username, password) => {
    try {
      setIsLoading(true);

      const response = await fetch('https://api.codingboss.in/kovais/customer-login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          username: String(username),
          password: String(password),
        }),
      });

      const data = await response.json();

      if (!data.success) {
        Alert.alert('Login Failed', data.message || 'Invalid credentials');
        return;
      }

      const rawUserObj = data?.data ? data.data : data;
      // 🛡️ IRON-CLAD FIX: Ensure the exact identifier used to login is preserved
      const userObj = {
        ...rawUserObj,
        loginIdentifier: String(username),
        username: rawUserObj.username || String(username),
        phone: rawUserObj.phone || (String(username).match(/\d{10}/) ? String(username) : '')
      };

      await login(userObj);
      const savedUserData = await saveLoginData(userObj);
      setSavedUser(savedUserData);

      Alert.alert('Success', data.Message || 'Login successful!', [
        {
          text: 'Continue',
          onPress: () => {
            if (returnTo && navigation) {
              navigation.navigate(returnTo, {
                restoreBooking: bookingData,
                userToken: savedUserData,
                fromLogin: true,
                loginSuccess: true,
              });
            } else if (onLogin) {
              onLogin(savedUserData, false);
            } else if (navigation) {
              navigation.navigate('MainTabs', { screen: 'Profile', params: { refresh: true } });
            }
          },
        },
      ]);
    } catch (error) {
      console.error('❌ Login Error:', error);
      setErrorMessage(error.message);
      Alert.alert('Login Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    let isValid = true;
    setUsernameError('');
    setPasswordError('');
    setErrorMessage('');

    if (!username) {
      setUsernameError('*Username is required');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    }

    if (!isValid) return;
    await loginUser(username, password);
  };

  const handleSignUp = () => {
    if (showSignUp) {
      showSignUp();
    } else if (navigation) {
      navigation.navigate('SignUp', { returnTo, bookingData, message });
    }
  };

  const handleGoBack = () => {
    if (onClose && isModal) {
      onClose();
    } else if (goBack) {
      goBack();
    } else if (navigation) {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('Profile');
      }
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
            await AsyncStorage.multiRemove([
              STORAGE_KEYS.LOGGED_IN_USER,
              STORAGE_KEYS.USER_DATA,
              STORAGE_KEYS.CURRENT_USER_ID,
              STORAGE_KEYS.URL,
              STORAGE_KEYS.POINTS,
              STORAGE_KEYS.LOGIN_TIMESTAMP,
            ]);
            setSavedUser(null);
          } catch (error) {
            console.error('Error during logout:', error);
          }
        },
      },
    ]);
  };

  const handleExistingSession = async () => {
    try {
      // Ensure authentication context is updated even if resuming session
      await login(savedUser);

      if (returnTo && navigation) {
        navigation.navigate(navigation.getParent() ? navigation.getState().routeNames[0] : 'MainTabs', {
          screen: returnTo,
          params: {
            restoreBooking: bookingData,
            userToken: savedUser,
            fromLogin: true,
            loginSuccess: true,
          }
        });
      } else if (onLogin) {
        onLogin(savedUser, false);
      } else if (navigation) {
        navigation.navigate('MainTabs', { screen: 'Profile', params: { refresh: true } });
      }
    } catch (error) {
      console.error('Error resuming session:', error);
      Alert.alert('Session Error', 'Please sign in manually.');
      setSavedUser(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ExecutiveHeader title={savedUser ? "Account" : "Sign In"} onBack={handleGoBack} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          <Animatable.View animation="fadeInUp" duration={800} style={styles.luxeMainContent}>
            <View style={styles.logoBadge}>
              <Image source={require('./image/klogo.png')} style={styles.logo} resizeMode="contain" />
            </View>

            {savedUser ? (
              <View style={styles.sessionCard}>
                <View style={styles.activeUserIcon}>
                  <User size={32} color="#348f9f" />
                </View>
                <Text style={styles.welcomeText}>
                  Welcome, {savedUser.username || savedUser.name || 'Member'}
                </Text>
                <Text style={styles.sessionStatus}>
                  Active Session Identified
                </Text>

                <TouchableOpacity
                  style={styles.submitWrapper}
                  onPress={handleExistingSession}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={['#348f9f', '#2c3e50']}
                    style={styles.luxePrimaryBtn}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.luxePrimaryBtnText}>Enter Dashboard</Text>
                    <ArrowRight size={20} color="#FFFFFF" />
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.luxeSecondaryBtn} onPress={handleLogout}>
                  <Text style={styles.luxeSecondaryBtnText}>Switch Account</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={styles.headerTextSection}>
                  <Text style={styles.luxeHeading}>
                    {requiresAuth ? 'Authentication' : 'Welcome to Prestige'}
                  </Text>
                  <Text style={styles.luxeSubheading}>
                    {requiresAuth && message ? message : 'Sign in to access premium services'}
                  </Text>
                </View>

                {errorMessage ? (
                  <View style={styles.errorBanner}>
                    <ShieldCheck size={18} color="#FF6B6B" />
                    <Text style={styles.errorBannerText}>{errorMessage}</Text>
                  </View>
                ) : null}

                <View style={[styles.luxeInputGroup, usernameError && styles.luxeInputError]}>
                  <View style={styles.luxeInputIcon}>
                    <User size={20} color="#348f9f" />
                  </View>
                  <TextInput
                    ref={usernameRef}
                    placeholder="Mobile Number / Username"
                    style={styles.luxeTextInput}
                    value={username}
                    onChangeText={(text) => {
                      setUsername(text);
                      setUsernameError('');
                    }}
                    placeholderTextColor="#94A3B8"
                    autoCapitalize="none"
                    editable={!isLoading}
                  />
                </View>
                {usernameError ? <Text style={styles.errorHint}>{usernameError}</Text> : null}

                <View style={[styles.luxeInputGroup, passwordError && styles.luxeInputError]}>
                  <View style={styles.luxeInputIcon}>
                    <Lock size={20} color="#348f9f" />
                  </View>
                  <TextInput
                    ref={passwordRef}
                    placeholder="Password"
                    style={styles.luxeTextInput}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      setPasswordError('');
                    }}
                    secureTextEntry={!showPassword}
                    placeholderTextColor="#94A3B8"
                    editable={!isLoading}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={20} color="#94A3B8" /> : <Eye size={20} color="#94A3B8" />}
                  </TouchableOpacity>
                </View>
                {passwordError ? <Text style={styles.errorHint}>{passwordError}</Text> : null}

                <TouchableOpacity
                  onPress={handleLogin}
                  disabled={isLoading}
                  activeOpacity={0.9}
                  style={styles.submitWrapper}
                >
                  <LinearGradient
                    colors={['#348f9f', '#2c3e50']}
                    style={styles.luxePrimaryBtn}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <>
                        <Text style={styles.luxePrimaryBtnText}>Sign In</Text>
                        <ArrowRight size={20} color="#FFFFFF" />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <View style={styles.luxeFooterLinkRow}>
                  <Text style={styles.luxeFooterLabel}>New to Prestige?</Text>
                  <TouchableOpacity onPress={handleSignUp}>
                    <Text style={styles.luxeFooterLink}>Create Account</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.luxeTrustBanner}>
                  <View style={styles.trustItem}>
                    <ShieldCheck size={24} color="#348f9f" />
                    <Text style={styles.trustText}>Secure</Text>
                  </View>
                  <View style={styles.trustItem}>
                    <Zap size={24} color="#348f9f" />
                    <Text style={styles.trustText}>Direct</Text>
                  </View>
                </View>
              </>
            )}
          </Animatable.View>

          <Text style={styles.legalNotice}>
            Trusted by premium members worldwide. By signing in, you agree to our Terms of Service.
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
    paddingTop: verticalScale(40),
    alignItems: 'center',
  },
  logoBadge: {
    width: moderateScale(90),
    height: moderateScale(90),
    borderRadius: moderateScale(24),
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(30),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  logo: {
    width: scale(60),
    height: scale(60),
  },
  headerTextSection: {
    alignItems: 'center',
    marginBottom: verticalScale(40),
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
    paddingHorizontal: scale(10),
  },
  luxeInputGroup: {
    width: '100%',
    height: verticalScale(64),
    backgroundColor: '#F8FAFC',
    borderRadius: moderateScale(20),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    marginBottom: verticalScale(16),
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
    alignSelf: 'flex-start',
    marginLeft: scale(20),
    marginBottom: verticalScale(16),
    marginTop: verticalScale(-8),
  },
  submitWrapper: {
    width: '100%',
    marginTop: verticalScale(10),
  },
  luxePrimaryBtn: {
    width: '100%',
    height: verticalScale(64),
    borderRadius: moderateScale(20),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    elevation: 4,
    shadowColor: '#348f9f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  luxePrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: moderateScale(18),
    fontWeight: '800',
  },
  luxeSecondaryBtn: {
    width: '100%',
    height: verticalScale(60),
    borderRadius: moderateScale(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: verticalScale(12),
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
  },
  luxeSecondaryBtnText: {
    color: '#64748B',
    fontSize: moderateScale(16),
    fontWeight: '800',
  },
  luxeFooterLinkRow: {
    flexDirection: 'row',
    marginTop: verticalScale(30),
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
  luxeTrustBanner: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    width: '100%',
    marginTop: verticalScale(40),
    padding: moderateScale(24),
    borderRadius: moderateScale(24),
    justifyContent: 'space-around',
  },
  trustItem: {
    alignItems: 'center',
    gap: 6,
  },
  trustText: {
    fontSize: moderateScale(11),
    fontWeight: '800',
    color: '#1E293B',
    textTransform: 'uppercase',
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
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.2)',
  },
  errorBannerText: {
    color: '#FF6B6B',
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
  },
  sessionCard: {
    width: '100%',
    alignItems: 'center',
    marginTop: verticalScale(20),
  },
  activeUserIcon: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(40),
    backgroundColor: '#F0FDFA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  welcomeText: {
    fontSize: moderateScale(24),
    fontWeight: '900',
    color: '#1E293B',
    marginBottom: verticalScale(8),
    textAlign: 'center',
  },
  sessionStatus: {
    fontSize: moderateScale(14),
    color: '#10B981',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: verticalScale(40),
  }
});

export default Login;