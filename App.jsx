import * as React from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Animated,
  Dimensions,
  StatusBar,
  Linking,
  Share,
  Platform,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  Menu, X, ChevronRight, Settings, Phone, Shield, Share2, Info, Moon, Sun,
  Home, User, AlertCircle, CheckCircle, Check, Globe, Mail, MessageSquare, MapPin, ChevronDown
} from 'lucide-react-native';
import { AuthProvider } from './screens/AuthContext';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from './screens/AuthContext';
import AuthScreen from './screens/Profile/AuthScreen';
import HomeScreen from './screens/HomeScreen';
import AboutScreen from './screens/AboutScreen';
import Profile from './screens/Profile';
import BookingScreen from './screens/BookingScreen';
import HotelBooking from './screens/BookingScreens/Hotels';
import FunctionBooking from './screens/BookingScreens/Function';
import FuneralBooking from './screens/BookingScreens/Funeral';
import SpaBooking from './screens/BookingScreens/SpaCenter';
import Login from './screens/Profile/Login';
import SignUp from './screens/Profile/SignUp';
import BarberShop from './screens/BookingScreens/BarberShop';
import Gym from './screens/BookingScreens/Gym';
import BookingHistory from './screens/Profile/BookingHistory';
import { Contact } from 'lucide-react-native';
import ContactUsScreen from './screens/ContactUsScreen';
import PrivacyPolicyScreen from './screens/PrivacyPolicyScreen';
import PreferencesScreen from './screens/Profile/PreferencesScreen';
import SettingsScreen from './screens/SettingsScreen';
import headerStyles from './screens/styles/HeaderStyles';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Toast/Error Message Component
const Toast = ({ message, type = 'info', visible, onDismiss }) => {
  const slideAnim = React.useRef(new Animated.Value(-100)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(3000),
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onDismiss();
      });
    }
  }, [visible]);

  if (!visible) return null;

  const backgroundColor = type === 'error' ? '#ABE7B2' : type === 'success' ? '#28a745' : '#ABE7B2';

  return (
    <Animated.View
      style={[
        styles.toast,
        { backgroundColor, transform: [{ translateY: slideAnim }] }
      ]}
    >
      {type === 'error' ? (
        <AlertCircle size={24} color="#fff" />
      ) : type === 'success' ? (
        <CheckCircle size={24} color="#fff" />
      ) : (
        <Info size={24} color="#fff" />
      )}
      <Text style={styles.toastText}>{message}</Text>
      <TouchableOpacity onPress={onDismiss}>
        <X size={20} color="#fff" />
      </TouchableOpacity>
    </Animated.View>
  );
};

// Main Tab Navigator
const MainTabNavigator = ({ openMenu, openSettingsModal, isDarkMode }) => {
  return (
    <Tab.Navigator
      screenOptions={{
        header: ({ navigation }) => (
          <LinearGradient
            colors={isDarkMode ? ['#1C1C1E', '#000000'] : ['#348f9f', '#2c3e50']}
            style={headerStyles.headerWrapper}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={headerStyles.headerContent}>
              <View style={headerStyles.logoContainer}>
                <Image
                  source={require('./assets/klogo.png')}
                  style={headerStyles.logo}
                  resizeMode="contain"
                />
              </View>
              <TouchableOpacity
                style={headerStyles.menuButtonContainer}
                onPress={openMenu}
                activeOpacity={0.7}
              >
                <Menu size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        ),
        headerStyle: {
          height: Platform.OS === 'ios' ? 70 : 75,
        },
        headerTitleAlign: 'center',
        tabBarActiveTintColor: isDarkMode ? '#ABE7B2' : '#348f9f',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: isDarkMode ? '#2C2C2E' : '#F2F2F7',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        options={{
          tabBarIcon: ({ color }) => <Home size={26} color={color} />,
          tabBarLabel: 'Home',
        }}
      >
        {(props) => <HomeScreen {...props} isDarkMode={isDarkMode} />}
      </Tab.Screen>
      <Tab.Screen
        name="Profile"
        options={{
          tabBarIcon: ({ color }) => <User size={26} color={color} />,
          tabBarLabel: 'Profile',
        }}
      >
        {(props) => <Profile {...props} isDarkMode={isDarkMode} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

// Main App Component with Modals
const AppContent = () => {
  const [menuVisible, setMenuVisible] = React.useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = React.useState(false);
  const [contactModalVisible, setContactModalVisible] = React.useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = React.useState(false);
  const [aboutModalVisible, setAboutModalVisible] = React.useState(false);
  const [languageModalVisible, setLanguageModalVisible] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState('');
  const [toastType, setToastType] = React.useState('info');
  const [toastVisible, setToastVisible] = React.useState(false);

  const [notificationSettings, setNotificationSettings] = React.useState({
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    promotions: true,
    appointments: true,
    updates: true
  });
  const [appSettings, setAppSettings] = React.useState({
    darkMode: false,
    language: 'English',
    autoBackup: true,
    locationServices: true
  });

  const slideAnim = React.useRef(new Animated.Value(280)).current;
  const navigationRef = React.useRef();

  const showToast = (message, type = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const menuItems = [
    { id: '1', title: 'Settings', icon: Settings, action: 'settings' },
    { id: '3', title: 'Contact Us', icon: Phone, action: 'contact' },
    { id: '5', title: 'Privacy Policy', icon: Shield, action: 'privacy' },
    { id: '8', title: 'Share App', icon: Share2, action: 'share' },
    { id: '10', title: 'About Kovais', icon: Info, action: 'about-app' },
  ];
  const handleMenuPress = (action) => {
    if (action === 'about-app') {
      navigation.navigate('AboutScreen');
    } else if (action === 'settings') {
      // navigation.navigate('Settings');
    }
    // Add other cases as needed
  };
  const openMenu = () => {
    setMenuVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const closeMenu = () => {
    Animated.timing(slideAnim, {
      toValue: 280,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setMenuVisible(false);
    });
  };

  const openSettingsModal = () => {
    setSettingsModalVisible(true);
  };

  const closeSettingsModal = () => {
    setSettingsModalVisible(false);
  };

  const showContactOptions = () => {
    setContactModalVisible(true);
  };

  const shareApp = async () => {
    try {
      const shareUrl = Platform.select({
        ios: 'https://apps.apple.com/app/id123456789',
        android: 'https://play.google.com/store/apps/details?id=com.kovaisbeauty.app',
      });

      await Share.share({
        message: `Check out Kovais Beauty app! Transform your beauty routine with professional services at your fingertips. Download it here: ${shareUrl}`,
        title: 'Kovais Beauty App',
        url: shareUrl,
      });
    } catch (error) {
      //console.log('Error sharing app:', error);
      showToast('Unable to share app. Please try again later.', 'error');
    }
  };

  const showAppInfo = () => {
    setAboutModalVisible(true);
  };

  const rateApp = () => {
    const storeUrl = Platform.select({
      ios: 'https://apps.apple.com/app/id123456789',
      android: 'https://play.google.com/store/apps/details?id=com.kovaisbeauty.app',
    });
    Linking.openURL(storeUrl);
  };

  const showPrivacyPolicy = () => {
    setPrivacyModalVisible(true);
  };

  const navigateToProfileView = (view) => {
    closeMenu();
    setTimeout(() => {
      if (navigationRef.current) {
        navigationRef.current.navigate('Profile', {
          screen: 'Profile',
          params: { initialView: view }
        });
      }
    }, 100);
  };

  const toggleNotificationSetting = (setting) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const toggleDarkMode = () => {
    setAppSettings(prev => {
      const newDarkMode = !prev.darkMode;
      return { ...prev, darkMode: newDarkMode };
    });
  };

  const changeLanguage = () => {
    setLanguageModalVisible(true);
  };

  const selectLanguage = (language) => {
    setAppSettings(prev => ({ ...prev, language }));
    setLanguageModalVisible(false);
    showToast(`Language changed to ${language}`, 'success');
  };

  // const toggleLocationServices = () => {
  //   setAppSettings(prev => {
  //     const newLocationServices = !prev.locationServices;
  //     showToast(
  //       newLocationServices
  //         ? 'Location services enabled. You can now find nearby beauty services.'
  //         : 'Location services disabled. You won\'t be able to see nearby services.',
  //       'info'
  //     );
  //     return { ...prev, locationServices: newLocationServices };
  //   });
  // };

  const toggleAppSetting = (setting) => {
    if (setting === 'darkMode') {
      toggleDarkMode();
    } else {
      setAppSettings(prev => ({
        ...prev,
        [setting]: !prev[setting]
      }));
    }
  };

  const handleMenuItemPress = (item) => {
    //console.log(`${item.title} pressed`);
    closeMenu();

    setTimeout(() => {
      switch (item.action) {
        case 'settings':
          if (navigationRef.current) {
            navigationRef.current.navigate('Settings');
          }
          break;
        case 'help-redirect':
          navigateToProfileView('helpSupport');
          showToast('Opening Help & Support in Profile section...', 'info');
          break;
        case 'contact':
          if (navigationRef.current) {
            navigationRef.current.navigate('ContactUsScreen');
          }
          break;
        case 'privacy':
          if (navigationRef.current) {
            navigationRef.current.navigate('PrivacyPolicyScreen');
          }
          break;
        case 'terms-redirect':
          navigateToProfileView('termsConditions');
          showToast('Opening Terms & Conditions in Profile section...', 'info');
          break;
        case 'share':
          shareApp();
          break;
        case 'about-app':
          // 🔹 Instead of modal, navigate to AboutScreen
          if (navigationRef.current) {
            navigationRef.current.navigate('AboutScreen');
          }
          break;
        default:
          showToast(`${item.title} feature will be available soon!`, 'info');
          break;
      }
    }, 100);
  };

  const renderMenuItem = ({ item }) => {
    const IconComponent = item.icon;
    return (
      <TouchableOpacity
        style={[
          styles.menuItem,
          appSettings.darkMode && styles.menuItemDark
        ]}
        onPress={() => handleMenuItemPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.menuItemIconContainer}>
          <IconComponent size={20} color="#348f9f" />
        </View>
        <Text style={[
          styles.menuItemText,
          appSettings.darkMode && styles.menuItemTextDark
        ]}>{item.title}</Text>
        <ChevronRight size={18} color="#C7C7CC" />
      </TouchableOpacity>
    );
  };

  const LanguageModal = () => (
    <Modal
      visible={languageModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setLanguageModalVisible(false)}
    >
      <View style={styles.popupOverlay}>
        <View style={[
          styles.popupContainer,
          appSettings.darkMode && styles.popupContainerDark
        ]}>
          <View style={[
            styles.popupHeader,
            appSettings.darkMode && styles.popupHeaderDark
          ]}>
            <Text style={[
              styles.popupTitle,
              appSettings.darkMode && styles.popupTitleDark
            ]}>Select Language</Text>
            <TouchableOpacity onPress={() => setLanguageModalVisible(false)}>
              <X size={24} color={appSettings.darkMode ? '#fff' : '#666'} />
            </TouchableOpacity>
          </View>

          <View style={styles.popupContent}>
            <Text style={[
              styles.popupSubtitle,
              appSettings.darkMode && styles.popupSubtitleDark
            ]}>Choose your preferred language</Text>

            <TouchableOpacity
              style={[styles.languageOption, appSettings.language === 'English' && styles.selectedLanguage]}
              onPress={() => selectLanguage('English')}
            >
              <Text style={[styles.languageText, appSettings.language === 'English' && styles.selectedLanguageText]}>English</Text>
              {appSettings.language === 'English' && <Check size={24} color="#ABE7B2" />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.languageOption, appSettings.language === 'Tamil' && styles.selectedLanguage]}
              onPress={() => selectLanguage('Tamil')}
            >
              <Text style={[styles.languageText, appSettings.language === 'Tamil' && styles.selectedLanguageText]}>Tamil</Text>
              {appSettings.language === 'Tamil' && <Check size={24} color="#ABE7B2" />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.languageOption, appSettings.language === 'Hindi' && styles.selectedLanguage]}
              onPress={() => selectLanguage('Hindi')}
            >
              <Text style={[styles.languageText, appSettings.language === 'Hindi' && styles.selectedLanguageText]}>Hindi</Text>
              {appSettings.language === 'Hindi' && <Check size={24} color="#ABE7B2" />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cancelButton, appSettings.darkMode && styles.cancelButtonDark]}
              onPress={() => setLanguageModalVisible(false)}
            >
              <Text style={[styles.cancelButtonText, appSettings.darkMode && styles.cancelButtonTextDark]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const SettingsModal = () => (
    <Modal
      visible={settingsModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={closeSettingsModal}
    >
      <View style={styles.fullModalOverlay}>
        <View style={[
          styles.fullModalContainer,
          appSettings.darkMode && styles.fullModalContainerDark
        ]}>
          <View style={[
            styles.modalHeader,
            appSettings.darkMode && styles.modalHeaderDark
          ]}>
            <TouchableOpacity onPress={closeSettingsModal} style={styles.modalCloseButton}>
              <X size={24} color={appSettings.darkMode ? '#fff' : '#666'} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.settingsSection}>
              <Text style={[
                styles.sectionTitle,
                appSettings.darkMode && styles.sectionTitleDark
              ]}>App Settings</Text>

              <TouchableOpacity
                style={[
                  styles.settingItem,
                  appSettings.darkMode && styles.settingItemDark
                ]}
                onPress={changeLanguage}
              >
                <View style={styles.settingInfo}>
                  <Globe size={24} color="#ABE7B2" />
                  <View style={styles.settingTextContainer}>
                    <Text style={[
                      styles.settingTitle,
                      appSettings.darkMode && styles.settingTitleDark
                    ]}>Language</Text>
                    <Text style={[
                      styles.settingSubtitle,
                      appSettings.darkMode && styles.settingSubtitleDark
                    ]}>Current: {appSettings.language}</Text>
                  </View>
                </View>
                <ChevronRight size={20} color={appSettings.darkMode ? '#ABE7B2' : '#C7C7CC'} />
              </TouchableOpacity>

              <View style={[
                styles.settingItem,
                appSettings.darkMode && styles.settingItemDark
              ]}>
                {/* <View style={styles.settingInfo}>
                  <MapPin size={24} color="#ABE7B2" />
                  <View style={styles.settingTextContainer}>
                    <Text style={[
                      styles.settingTitle,
                      appSettings.darkMode && styles.settingTitleDark
                    ]}>Location Services</Text>
                    <Text style={[
                      styles.settingSubtitle,
                      appSettings.darkMode && styles.settingSubtitleDark
                    ]}>
                      {appSettings.locationServices ? 'Enabled - Finding nearby services' : 'Disabled - No location access'}
                    </Text>
                  </View>
                </View> */}
                {/* <Switch
                  value={appSettings.locationServices}
                  onValueChange={toggleLocationServices}
                  trackColor={{ false: '#767577', true: '#ABE7B2' }}
                  thumbColor={appSettings.locationServices ? '#fff' : '#f4f3f4'}
                /> */}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const ContactModal = () => (
    <Modal
      visible={contactModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setContactModalVisible(false)}
    >
      <View style={styles.popupOverlay}>
        <View style={[
          styles.popupContainer,
          appSettings.darkMode && styles.popupContainerDark
        ]}>
          <View style={[
            styles.popupHeader,
            appSettings.darkMode && styles.popupHeaderDark
          ]}>
            <Text style={[
              styles.popupTitle,
              appSettings.darkMode && styles.popupTitleDark
            ]}>Contact Us</Text>
            <TouchableOpacity onPress={() => setContactModalVisible(false)}>
              <X size={24} color={appSettings.darkMode ? '#fff' : '#666'} />
            </TouchableOpacity>
          </View>

          <View style={styles.popupContent}>
            <Text style={[
              styles.popupSubtitle,
              appSettings.darkMode && styles.popupSubtitleDark
            ]}>How would you like to contact us?</Text>

            <TouchableOpacity
              style={[styles.contactOption, appSettings.darkMode && styles.contactOptionDark]}
              onPress={() => {
                setContactModalVisible(false);
                Linking.openURL('mailto:support@kovaisbeauty.com?subject=Support Request');
              }}
            >
              <Mail size={24} color="#ABE7B2" />
              <View style={styles.contactTextContainer}>
                <Text style={[styles.contactTitle, appSettings.darkMode && styles.contactTitleDark]}>Email</Text>
                <Text style={[styles.contactSubtext, appSettings.darkMode && styles.contactSubtextDark]}>support@kovaisbeauty.com</Text>
              </View>
              <ChevronRight size={20} color="#ABE7B2" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.contactOption, appSettings.darkMode && styles.contactOptionDark]}
              onPress={() => {
                setContactModalVisible(false);
                Linking.openURL('tel:+919876543210');
              }}
            >
              <Phone size={24} color="#ABE7B2" />
              <View style={styles.contactTextContainer}>
                <Text style={[styles.contactTitle, appSettings.darkMode && styles.contactTitleDark]}>Phone</Text>
                <Text style={[styles.contactSubtext, appSettings.darkMode && styles.contactSubtextDark]}>+91 98765 43210</Text>
              </View>
              <ChevronRight size={20} color="#ABE7B2" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.contactOption, appSettings.darkMode && styles.contactOptionDark]}
              onPress={() => {
                setContactModalVisible(false);
                Linking.openURL('https://wa.me/919876543210?text=Hi, I need help with Kovais Beauty app');
              }}
            >
              <MessageSquare size={24} color="#ABE7B2" />
              <View style={styles.contactTextContainer}>
                <Text style={[styles.contactTitle, appSettings.darkMode && styles.contactTitleDark]}>WhatsApp</Text>
                <Text style={[styles.contactSubtext, appSettings.darkMode && styles.contactSubtextDark]}>Chat with us</Text>
              </View>
              <ChevronRight size={20} color="#ABE7B2" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cancelButton, appSettings.darkMode && styles.cancelButtonDark]}
              onPress={() => setContactModalVisible(false)}
            >
              <Text style={[styles.cancelButtonText, appSettings.darkMode && styles.cancelButtonTextDark]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const PrivacyModal = () => (
    <Modal
      visible={privacyModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setPrivacyModalVisible(false)}
    >
      <View style={styles.popupOverlay}>
        <View style={[
          styles.popupContainerLarge,
          appSettings.darkMode && styles.popupContainerDark
        ]}>
          <View style={[
            styles.popupHeader,
            appSettings.darkMode && styles.popupHeaderDark
          ]}>
            <Text style={[
              styles.popupTitle,
              appSettings.darkMode && styles.popupTitleDark
            ]}>Privacy Policy</Text>
            <TouchableOpacity onPress={() => setPrivacyModalVisible(false)}>
              <X size={24} color={appSettings.darkMode ? '#fff' : '#666'} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.popupContent}>
            <Text style={[
              styles.privacyHeader,
              appSettings.darkMode && styles.privacyHeaderDark
            ]}>Privacy Policy for Kovais Beauty</Text>

            <Text style={[
              styles.privacyDate,
              appSettings.darkMode && styles.privacyDateDark
            ]}>Last updated: October 2025</Text>

            <View style={styles.privacySection}>
              <Text style={[
                styles.privacySectionTitle,
                appSettings.darkMode && styles.privacySectionTitleDark
              ]}>1. Information We Collect</Text>
              <Text style={[
                styles.privacyText,
                appSettings.darkMode && styles.privacyTextDark
              ]}>
                We collect information you provide directly to us, such as when you create an account, book appointments, or contact us for support.
              </Text>
            </View>

            <View style={styles.privacySection}>
              <Text style={[
                styles.privacySectionTitle,
                appSettings.darkMode && styles.privacySectionTitleDark
              ]}>2. How We Use Your Information</Text>
              <Text style={[
                styles.privacyText,
                appSettings.darkMode && styles.privacyTextDark
              ]}>
                We use the information we collect to provide and improve our services, process appointments and payments.
              </Text>
            </View>

            <View style={styles.privacySection}>
              <Text style={[
                styles.privacySectionTitle,
                appSettings.darkMode && styles.privacySectionTitleDark
              ]}>3. Information Sharing</Text>
              <Text style={[
                styles.privacyText,
                appSettings.darkMode && styles.privacyTextDark
              ]}>
                We do not sell, trade, or otherwise transfer your personal information to third parties without your consent.
              </Text>
            </View>

            <View style={styles.privacySection}>
              <Text style={[
                styles.privacySectionTitle,
                appSettings.darkMode && styles.privacySectionTitleDark
              ]}>4. Data Security</Text>
              <Text style={[
                styles.privacyText,
                appSettings.darkMode && styles.privacyTextDark
              ]}>
                We implement appropriate security measures to protect your personal information.
              </Text>
            </View>

            <Text style={[
              styles.privacyContact,
              appSettings.darkMode && styles.privacyContactDark
            ]}>
              For full privacy policy, visit our website or contact: privacy@kovaisbeauty.com
            </Text>
          </ScrollView>

          <TouchableOpacity
            style={[styles.closeModalButton, appSettings.darkMode && styles.closeModalButtonDark]}
            onPress={() => setPrivacyModalVisible(false)}
          >
            <Text style={styles.closeModalButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const AboutModal = () => (
    <Modal
      visible={aboutModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setAboutModalVisible(false)}
    >
      <View style={styles.popupOverlay}>
        <View style={[
          styles.popupContainerLarge,
          appSettings.darkMode && styles.popupContainerDark
        ]}>
          <View style={[
            styles.popupHeader,
            appSettings.darkMode && styles.popupHeaderDark
          ]}>
            <Text style={[
              styles.popupTitle,
              appSettings.darkMode && styles.popupTitleDark
            ]}>About Kovais Beauty</Text>
            <TouchableOpacity onPress={() => setAboutModalVisible(false)}>
              <X size={24} color={appSettings.darkMode ? '#fff' : '#666'} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.popupContent}>
            <View style={styles.aboutSection}>
              <Info size={40} color="#ABE7B2" style={styles.aboutIcon} />
              <Text style={[
                styles.aboutVersion,
                appSettings.darkMode && styles.aboutVersionDark
              ]}>Version: 1.0.0</Text>
              <Text style={[
                styles.aboutBuild,
                appSettings.darkMode && styles.aboutBuildDark
              ]}>Build: 100</Text>
            </View>

            <View style={styles.aboutSection}>
              <Text style={[
                styles.aboutLabel,
                appSettings.darkMode && styles.aboutLabelDark
              ]}>Developed by:</Text>
              <Text style={[
                styles.aboutValue,
                appSettings.darkMode && styles.aboutValueDark
              ]}>Kovais Team</Text>
            </View>

            <View style={styles.aboutSection}>
              <Text style={[
                styles.aboutDescription,
                appSettings.darkMode && styles.aboutDescriptionDark
              ]}>
                Your trusted partner for beauty and wellness services. Experience professional treatments with convenience and quality.
              </Text>
            </View>

            <View style={styles.aboutSection}>
              <Text style={[
                styles.aboutSupport,
                appSettings.darkMode && styles.aboutSupportDark
              ]}>For support: support@kovaisbeauty.com</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <>
      <Toast
        message={toastMessage}
        type={toastType}
        visible={toastVisible}
        onDismiss={() => setToastVisible(false)}
      />

      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="MainTabs">
            {() => (
              <MainTabNavigator
                openMenu={openMenu}
                openSettingsModal={openSettingsModal}
                isDarkMode={appSettings.darkMode}
              />
            )}
          </Stack.Screen>

          <Stack.Screen name="Gym" component={Gym} />
          <Stack.Screen name="AuthScreen" component={AuthScreen} />
          <Stack.Screen name="BookingScreen" component={BookingScreen} />
          <Stack.Screen name="Hotels" component={HotelBooking} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="SignUp" component={SignUp} />
          <Stack.Screen name="BarberShop" component={BarberShop} />
          <Stack.Screen name="SpaBooking" component={SpaBooking} />
          <Stack.Screen name="Functions" component={FunctionBooking} />
          <Stack.Screen name="Funeral" component={FuneralBooking} />
          <Stack.Screen name="BookingHistory" component={BookingHistory} />
          <Stack.Screen name="AboutScreen">
            {(props) => <AboutScreen {...props} isDarkMode={appSettings.darkMode} />}
          </Stack.Screen>
          <Stack.Screen name="ContactUsScreen">
            {(props) => <ContactUsScreen {...props} isDarkMode={appSettings.darkMode} />}
          </Stack.Screen>
          <Stack.Screen name="PrivacyPolicyScreen">
            {(props) => <PrivacyPolicyScreen {...props} isDarkMode={appSettings.darkMode} />}
          </Stack.Screen>
          <Stack.Screen name="Settings">
            {(props) => (
              <SettingsScreen
                {...props}
                appSettings={appSettings}
                changeLanguage={changeLanguage}
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>

      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeMenu}
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.overlayBackground}
            activeOpacity={1}
            onPress={closeMenu}
          />

          <Animated.View
            style={[
              styles.menuContainer,
              appSettings.darkMode && styles.menuContainerDark,
              {
                transform: [{ translateX: slideAnim }],
                right: 0,
              }
            ]}
          >
            <LinearGradient
              colors={appSettings.darkMode ? ['#1a1a1a', '#000000'] : ['#348f9f', '#2c3e50']}
              style={styles.menuHeader}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.menuHeaderContent}>
                <View style={styles.menuLogoContainer}>
                  <Image
                    source={require('./assets/klogo.png')}
                    style={styles.menuLogo}
                    resizeMode="contain"
                  />
                </View>
                <View>
                  <Text style={styles.menuTitle}>Kovais</Text>
                  <Text style={styles.menuSubtitle}>Beauty & Wellness</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={closeMenu}
                style={styles.closeButtonContainer}
                activeOpacity={0.7}
              >
                <X size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </LinearGradient>

            <FlatList
              data={menuItems}
              renderItem={renderMenuItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.menuList}
            />

            <View style={[
              styles.menuFooter,
              appSettings.darkMode && styles.menuFooterDark
            ]}>
              <Text style={[
                styles.versionText,
                appSettings.darkMode && styles.versionTextDark
              ]}>Version 1.0.0</Text>
              <Text style={[
                styles.copyrightText,
                appSettings.darkMode && styles.copyrightTextDark
              ]}>© 2024 Kovais Beauty</Text>
            </View>
          </Animated.View>
        </View>
      </Modal>

      <SettingsModal />
      <ContactModal />
      <PrivacyModal />
      <AboutModal />
      <LanguageModal />
    </>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#b6c8f0',
  },
  toast: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    zIndex: 9999,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  toastText: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 10,
    marginRight: 10,
  },
  dcontainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
    color: '#333',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  selectedButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  selectedText: {
    color: '#fff',
    fontWeight: '600',
  },
  menuButton: {
    width: 28,
    height: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
    marginVertical: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  overlayBackground: {
    flex: 1,
    width: screenWidth - 280,
  },
  menuContainer: {
    position: 'absolute',
    top: 0,
    backgroundColor: '#ffffff',
    height: '100%',
    width: 280,
    shadowColor: '#000',
    shadowOffset: {
      width: -3,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  menuContainerDark: {
    backgroundColor: '#1a1a1a',
    shadowColor: '#ABE7B2',
    shadowOpacity: 0.4,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  menuLogoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuLogo: {
    width: 45,
    height: 45,
  },
  menuTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  menuSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
    fontWeight: '500',
  },
  closeButtonContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuList: {
    paddingTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
  },
  menuItemDark: {
    backgroundColor: '#0d0d0d',
    borderBottomColor: '#333333',
  },
  menuItemIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(52, 143, 159, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  menuItemTextDark: {
    color: '#ffffff',
  },
  redirectBadge: {
    backgroundColor: '#ABE7B2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    shadowColor: '#ABE7B2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  redirectText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  menuFooter: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  menuFooterDark: {
    backgroundColor: '#000000',
    borderTopColor: '#ABE7B2',
  },
  versionText: {
    fontSize: 12,
    color: '#999',
  },
  versionTextDark: {
    color: '#ABE7B2',
  },
  copyrightText: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
  copyrightTextDark: {
    color: '#ABE7B2',
  },
  fullModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  fullModalContainer: {
    backgroundColor: '#fff',
    height: screenHeight * 0.9,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  fullModalContainerDark: {
    backgroundColor: '#1a1a1a',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FAFAFA',
  },
  modalHeaderDark: {
    backgroundColor: '#0d0d0d',
    borderBottomColor: '#333',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalTitleDark: {
    color: '#ffffff',
  },
  modalCloseButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    right: -250
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  settingsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#ABE7B2',
  },
  sectionTitleDark: {
    color: '#ffffff',
    borderBottomColor: '#ABE7B2',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F0F0F0',
  },
  settingItemDark: {
    borderBottomColor: '#f5f3f3ff',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  settingTitleDark: {
    color: '#ffffff',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  settingSubtitleDark: {
    color: '#aaa',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  infoCardDark: {
    backgroundColor: '#0d0d0d',
    borderWidth: 1,
    borderColor: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  infoTextDark: {
    color: '#cccccc',
  },
  popupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  popupContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  popupContainerLarge: {
    backgroundColor: '#fff',
    borderRadius: 15,
    width: '90%',
    maxWidth: 450,
    maxHeight: screenHeight * 0.8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  popupContainerDark: {
    backgroundColor: '#1a1a1a',
  },
  popupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    backgroundColor: '#FAFAFA',
  },
  popupHeaderDark: {
    backgroundColor: '#0d0d0d',
    borderBottomColor: '#333',
  },
  popupTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  popupTitleDark: {
    color: '#ffffff',
  },
  popupContent: {
    padding: 20,
  },
  popupSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  popupSubtitleDark: {
    color: '#aaa',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedLanguage: {
    borderColor: '#ABE7B2',
    backgroundColor: '#f0fdf4',
  },
  languageText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  selectedLanguageText: {
    fontWeight: '600',
    color: '#ABE7B2',
  },
  contactOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    marginBottom: 12,
  },
  contactOptionDark: {
    backgroundColor: '#0d0d0d',
    borderWidth: 1,
    borderColor: '#333',
  },
  contactTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  contactTitleDark: {
    color: '#ffffff',
  },
  contactSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  contactSubtextDark: {
    color: '#aaa',
  },
  cancelButton: {
    padding: 15,
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonDark: {
    backgroundColor: '#333',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  cancelButtonTextDark: {
    color: '#ffffff',
  },
  privacyHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  privacyHeaderDark: {
    color: '#ffffff',
  },
  privacyDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  privacyDateDark: {
    color: '#aaa',
  },
  privacySection: {
    marginBottom: 20,
  },
  privacySectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  privacySectionTitleDark: {
    color: '#ffffff',
  },
  privacyText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  privacyTextDark: {
    color: '#aaa',
  },
  privacyContact: {
    fontSize: 14,
    color: '#ABE7B2',
    marginTop: 10,
    marginBottom: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  privacyContactDark: {
    color: '#ABE7B2',
  },
  closeModalButton: {
    padding: 15,
    backgroundColor: '#e87aadff',
    borderRadius: 10,
    alignItems: 'center',
    margin: 20,
    marginTop: 0,
  },
  closeModalButtonDark: {
    backgroundColor: '#ABE7B2',
  },
  closeModalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  aboutSection: {
    marginBottom: 25,
    alignItems: 'center',
  },
  aboutIcon: {
    marginBottom: 15,
  },
  aboutVersion: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  aboutVersionDark: {
    color: '#ffffff',
  },
  aboutBuild: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  aboutBuildDark: {
    color: '#aaa',
  },
  aboutLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  aboutLabelDark: {
    color: '#aaa',
  },
  aboutValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  aboutValueDark: {
    color: '#ffffff',
  },
  aboutDescription: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  aboutDescriptionDark: {
    color: '#aaa',
  },
  aboutFeaturesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    alignSelf: 'flex-start',
  },
  aboutFeaturesTitleDark: {
    color: '#ffffff',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  featureText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
  featureTextDark: {
    color: '#aaa',
  },
  aboutSupport: {
    fontSize: 14,
    color: '#ABE7B2',
    fontWeight: '600',
    textAlign: 'center',
  },
  aboutSupportDark: {
    color: '#ABE7B2',
  },
  aboutButtonContainer: {
    padding: 20,
    paddingTop: 0,
  },
  rateAppButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#ABE7B2',
    borderRadius: 10,
    marginBottom: 12,
  },
  rateAppButtonDark: {
    backgroundColor: '#ABE7B2',
  },
  rateAppButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
});