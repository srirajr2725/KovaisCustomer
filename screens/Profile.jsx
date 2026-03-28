import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Alert, 
  ScrollView,
  Dimensions,
  StatusBar,
  TextInput,
  Modal,
  Switch,
  ActivityIndicator,
  Platform,
  Linking,
} from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import * as Animatable from 'react-native-animatable';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { 
  User, 
  Settings,
  ChevronRight, 
  ChevronLeft,
  Calendar, 
  CreditCard, 
  HelpCircle, 
  ShieldCheck, 
  LogOut, 
  LogIn,
  Camera,
  Zap,
  Heart,
  LayoutDashboard
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const STORAGE_KEYS = {
  LOGGED_IN_USER: 'loggedInUser',
  CURRENT_USER_ID: 'currentUserId',
  URL: 'url',
  POINTS: 'points',
  LOGIN_TIMESTAMP: 'loginTimestamp',
  USER_DATA: 'User_data',
  SIMPLE_USER_ID: 'currentUserId',
};

// Modern Executive Header with Dark Mode
const ExecutiveHeader = ({ title, onBack, rightIcon: RightIcon, onRightPress, isDarkMode }) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[
      styles.luxeExecutiveHeader, 
      isDarkMode && styles.luxeExecutiveHeaderDark,
      { paddingTop: Math.max(insets.top, 20) }
    ]}>
      <View style={styles.luxeHeaderContent}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={[styles.luxeHeaderBackBtn, isDarkMode && styles.luxeHeaderBackBtnDark]}>
            <ChevronLeft size={24} color="#348f9f" />
          </TouchableOpacity>
        )}
        <View style={styles.luxeHeaderTitleWrapper}>
          <Text style={styles.luxeHeaderPrestige}>PRESTIGE</Text>
          <Text style={[styles.luxeHeaderMainTitle, isDarkMode && styles.luxeHeaderMainTitleDark]}>{title}</Text>
        </View>
        <TouchableOpacity onPress={onRightPress} style={[styles.luxeHeaderProfile, isDarkMode && styles.luxeHeaderProfileDark]}>
          {RightIcon ? <RightIcon size={22} color="#348f9f" /> : <User size={22} color="#348f9f" />}
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Modern Menu Item with Dark Mode
const MenuItem = ({ icon: IconComponent, title, subtitle, onPress, isDarkMode }) => (
  <TouchableOpacity 
    style={[styles.luxeMenuItem, isDarkMode && styles.luxeMenuItemDark]} 
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[styles.luxeMenuIcon, isDarkMode && styles.luxeMenuIconDark]}>
      <IconComponent size={20} color="#348f9f" />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={[styles.luxeMenuTitle, isDarkMode && styles.luxeMenuTitleDark]}>{title}</Text>
      <Text style={[styles.luxeMenuSub, isDarkMode && styles.luxeMenuSubDark]}>{subtitle}</Text>
    </View>
    <ChevronRight size={18} color={isDarkMode ? "#475569" : "#CBD5E1"} />
  </TouchableOpacity>
);

const Profile = ({ isDarkMode }) => {
  const navigation = useNavigation();
  const route = useRoute();
  const { logout } = useAuth();

  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [currentView, setCurrentView] = useState('profile');
  const [isCheckingLogin, setIsCheckingLogin] = useState(true);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      checkLoginStatus();
    });
    return unsubscribe;
  }, [navigation]);

  const checkLoginStatus = async () => {
    try {
      setIsCheckingLogin(true);
      let loggedInUser = await AsyncStorage.getItem(STORAGE_KEYS.LOGGED_IN_USER);
      if (!loggedInUser) loggedInUser = await AsyncStorage.getItem('User_data');
      
      if (loggedInUser) {
        const userData = JSON.parse(loggedInUser);
        setUser(userData);
        setIsLoggedIn(true);
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Error checking login status:', error);
    } finally {
      setIsCheckingLogin(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => {
          await AsyncStorage.multiRemove([STORAGE_KEYS.LOGGED_IN_USER, 'User_data']);
          setIsLoggedIn(false);
          setUser(null);
          setCurrentView('profile');
      }}
    ]);
  };

  if (isCheckingLogin) {
    return (
      <View style={[styles.container, isDarkMode && styles.containerDark, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#348f9f" />
        <Text style={[styles.loadingText, isDarkMode && styles.loadingTextDark]}>Elevating your experience...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={isDarkMode ? "#121212" : "#FFFFFF"} />
      <ExecutiveHeader 
        title={isLoggedIn ? "Account Profile" : "Kovais Member"} 
        rightIcon={isLoggedIn ? Settings : LogIn}
        onRightPress={() => isLoggedIn ? navigation.navigate('Settings') : setShowLogin(true)}
        isDarkMode={isDarkMode}
      />

      <ScrollView 
        style={[styles.luxeContent, isDarkMode && styles.luxeContentDark]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {isLoggedIn && user ? (
          <>
            <View style={[styles.luxeProfileSummary, isDarkMode && styles.luxeProfileSummaryDark]}>
              <View style={styles.luxeAvatarContainer}>
                <View style={[styles.luxeAvatar, isDarkMode && styles.luxeAvatarDark]}>
                  <Text style={styles.luxeAvatarInitial}>
                    {(user.name || user.username || 'U')[0]?.toUpperCase()}
                  </Text>
                </View>
                <TouchableOpacity style={styles.luxeAvatarEdit}>
                  <Camera size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              
              <Text style={[styles.luxeUserName, isDarkMode && styles.luxeUserNameDark]}>{user.name || user.username || 'Premium Member'}</Text>
              <Text style={[styles.luxeUserEmail, isDarkMode && styles.luxeUserEmailDark]}>{user.email || user.phone || 'Member ID: #7821'}</Text>

              <View style={[styles.luxePointsBadge, isDarkMode && styles.luxePointsBadgeDark]}>
                <Zap size={14} color="#348f9f" fill="#348f9f" />
                <Text style={styles.luxePointsText}>{user.points || 0} Reward Points</Text>
              </View>
            </View>

            <View style={[styles.luxeMenuCard, isDarkMode && styles.luxeMenuCardDark]}>
              <Text style={[styles.luxeGroupLabel, isDarkMode && styles.luxeGroupLabelDark]}>ACCOUNT MANAGEMENT</Text>
              <MenuItem
                icon={User}
                title="Personal Information"
                subtitle="Manage your profile & identity"
                onPress={() => navigation.navigate('AboutScreen')}
                isDarkMode={isDarkMode}
              />
              <MenuItem
                icon={Calendar}
                title="Service History"
                subtitle="Track your bookings & orders"
                onPress={() => navigation.navigate('BookingHistory')}
                isDarkMode={isDarkMode}
              />
              <MenuItem
                icon={CreditCard}
                title="Payment Hub"
                subtitle="Save & manage your cards/UPI"
                onPress={() => {}}
                isDarkMode={isDarkMode}
              />
            </View>

            <View style={[styles.luxeMenuCard, isDarkMode && styles.luxeMenuCardDark]}>
              <Text style={[styles.luxeGroupLabel, isDarkMode && styles.luxeGroupLabelDark]}>RESOURCES & SUPPORT</Text>
              <MenuItem
                icon={HelpCircle}
                title="Support Center"
                subtitle="24/7 dedicated assistance"
                onPress={() => navigation.navigate('ContactUsScreen')}
                isDarkMode={isDarkMode}
              />
              <MenuItem
                icon={ShieldCheck}
                title="Legal & Safety"
                subtitle="Terms of service & privacy"
                onPress={() => navigation.navigate('PrivacyPolicyScreen')}
                isDarkMode={isDarkMode}
              />
            </View>

            <TouchableOpacity 
              style={[styles.luxeLogoutBtn, isDarkMode && styles.luxeLogoutBtnDark]}
              onPress={handleLogout}
            >
              <LogOut size={20} color="#EB5757" />
              <Text style={styles.luxeLogoutTxt}>Logout from Account</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Animatable.View animation="fadeIn" duration={800} style={[styles.luxeWelcome, isDarkMode && styles.luxeWelcomeDark]}>
            <View style={[styles.luxeLogoCircle, isDarkMode && styles.luxeLogoCircleDark]}>
              <Image 
                source={require('./assets/klogo.png')} 
                style={styles.luxeWelcomeLogo}
                resizeMode="contain"
              />
            </View>
            
            <Text style={[styles.luxeWelcomeTitle, isDarkMode && styles.luxeWelcomeTitleDark]}>Discover Excellence</Text>
            <Text style={[styles.luxeWelcomeSub, isDarkMode && styles.luxeWelcomeSubDark]}>
              Experience curated premium services tailored just for you. Sign in to unlock your personalized dashboard.
            </Text>

            <View style={styles.luxeWelcomeActions}>
              <TouchableOpacity 
                style={styles.luxePrimaryBtn} 
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.luxePrimaryBtnText}>Sign In</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.luxeSecondaryBtn, isDarkMode && styles.luxeSecondaryBtnDark]} 
                onPress={() => navigation.navigate('SignUp')}
              >
                <Text style={styles.luxeSecondaryBtnText}>Create Account</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.luxeTrustSection, isDarkMode && styles.luxeTrustSectionDark]}>
              <View style={styles.trustItem}>
                <ShieldCheck size={28} color="#348f9f" />
                <Text style={[styles.luxeTrustLabel, isDarkMode && styles.luxeTrustLabelDark]}>Secure</Text>
              </View>
              <View style={styles.trustItem}>
                <Zap size={28} color="#348f9f" />
                <Text style={[styles.luxeTrustLabel, isDarkMode && styles.luxeTrustLabelDark]}>Fast</Text>
              </View>
              <View style={styles.trustItem}>
                <Heart size={28} color="#348f9f" />
                <Text style={[styles.luxeTrustLabel, isDarkMode && styles.luxeTrustLabelDark]}>Premium</Text>
              </View>
            </View>
          </Animatable.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  luxeContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  luxeContentDark: {
    backgroundColor: '#121212',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#348f9f',
    fontWeight: '700',
  },
  loadingTextDark: {
    color: '#348f9f',
  },
  // Header
  luxeExecutiveHeader: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  luxeExecutiveHeaderDark: {
    backgroundColor: '#121212',
    borderBottomColor: '#1E293B',
  },
  luxeHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  luxeHeaderBackBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  luxeHeaderBackBtnDark: {
    backgroundColor: '#1E293B',
  },
  luxeHeaderTitleWrapper: {
    alignItems: 'center',
  },
  luxeHeaderPrestige: {
    fontSize: 10,
    fontWeight: '800',
    color: '#348f9f',
    letterSpacing: 3,
    marginBottom: 2,
  },
  luxeHeaderMainTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
  },
  luxeHeaderMainTitleDark: {
    color: '#F8FAFC',
  },
  luxeHeaderProfile: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  luxeHeaderProfileDark: {
    backgroundColor: '#1E293B',
  },
  // Profile Summary
  luxeProfileSummary: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 30,
    backgroundColor: '#FFFFFF',
  },
  luxeProfileSummaryDark: {
    backgroundColor: '#121212',
  },
  luxeAvatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  luxeAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#348f9f',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#F8FAFC',
  },
  luxeAvatarDark: {
    borderColor: '#1E293B',
  },
  luxeAvatarInitial: {
    fontSize: 40,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  luxeAvatarEdit: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#1E293B',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  luxeUserName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  luxeUserNameDark: {
    color: '#F8FAFC',
  },
  luxeUserEmail: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  luxeUserEmailDark: {
    color: '#94A3B8',
  },
  luxePointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  luxePointsBadgeDark: {
    backgroundColor: '#0F172A',
  },
  luxePointsText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#348f9f',
  },
  // Menu Card
  luxeMenuCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  luxeMenuCardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  luxeGroupLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1.5,
    marginLeft: 12,
    marginBottom: 16,
    marginTop: 8,
  },
  luxeGroupLabelDark: {
    color: '#64748B',
  },
  luxeMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    marginBottom: 4,
  },
  luxeMenuItemDark: {
    backgroundColor: 'transparent',
  },
  luxeMenuIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  luxeMenuIconDark: {
    backgroundColor: '#0F172A',
  },
  luxeMenuTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  luxeMenuTitleDark: {
    color: '#F8FAFC',
  },
  luxeMenuSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  luxeMenuSubDark: {
    color: '#64748B',
  },
  // Welcome View
  luxeWelcome: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  luxeWelcomeDark: {
    backgroundColor: '#121212',
  },
  luxeLogoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    elevation: 4,
  },
  luxeLogoCircleDark: {
    backgroundColor: '#1E293B',
  },
  luxeWelcomeLogo: {
    width: 70,
    height: 70,
  },
  luxeWelcomeTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1E293B',
    marginBottom: 12,
    textAlign: 'center',
  },
  luxeWelcomeTitleDark: {
    color: '#F8FAFC',
  },
  luxeWelcomeSub: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  luxeWelcomeSubDark: {
    color: '#94A3B8',
  },
  luxeWelcomeActions: {
    width: '100%',
    gap: 16,
  },
  luxePrimaryBtn: {
    backgroundColor: '#348f9f',
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  luxePrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  luxeSecondaryBtn: {
    backgroundColor: '#FFFFFF',
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F1F5F9',
  },
  luxeSecondaryBtnDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  luxeSecondaryBtnText: {
    color: '#1E293B',
    fontSize: 16,
    fontWeight: '800',
  },
  luxeTrustSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 40,
    backgroundColor: '#F8FAFC',
    padding: 24,
    borderRadius: 24,
  },
  luxeTrustSectionDark: {
    backgroundColor: '#1E293B',
  },
  trustItem: {
    alignItems: 'center',
    gap: 8,
  },
  luxeTrustLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E293B',
    textTransform: 'uppercase',
  },
  luxeTrustLabelDark: {
    color: '#CBD5E1',
  },
  luxeLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 32,
    padding: 18,
    borderRadius: 20,
    backgroundColor: '#FFF5F5',
    gap: 12,
  },
  luxeLogoutBtnDark: {
    backgroundColor: '#2D1F1F',
  },
  luxeLogoutTxt: {
    color: '#EB5757',
    fontSize: 16,
    fontWeight: '800',
  },
});

export default Profile;