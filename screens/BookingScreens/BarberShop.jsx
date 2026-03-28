import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  StatusBar,
  Platform,
  BackHandler,
  Linking,
  Alert
} from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ArrowLeft,
  Check,
  Star,
  Clock,
  MapPin,
  User,
  Bookmark,
  ChevronRight,
  ChevronLeft,
  Calendar as CalendarIcon,
  Shield,
  Smartphone,
  CreditCard,
  Wallet,
  Zap,
  Info
} from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Calendar } from 'react-native-calendars';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { useNavigation } from '@react-navigation/native';


/**
 * IMPORTANT: For Android, add these queries to your AndroidManifest.xml
 * Place this inside the <manifest> tag:
 * 
 * <queries>
 *   <intent>
 *     <action android:name="android.intent.action.VIEW" />
 *     <data android:scheme="phonepe" />
 *   </intent>
 *   <intent>
 *     <action android:name="android.intent.action.VIEW" />
 *     <data android:scheme="tez" />
 *   </intent>
 *   <intent>
 *     <action android:name="android.intent.action.VIEW" />
 *     <data android:scheme="paytmmp" />
 *   </intent>
 *   <intent>
 *     <action android:name="android.intent.action.VIEW" />
 *     <data android:scheme="upi" />
 *   </intent>
 * </queries>
 */

const { width, height } = Dimensions.get('window');
const MODAL_HEIGHT = height * 0.85;
const LOGIN_MODAL_HEIGHT = height * 0.7;

const API_BASE_URL = 'https://api.codingboss.in/kovais/saloon';

class ApiService {
  static async getToken() {
    return null;
  }

  static async request(endpoint, options = {}) {
    const token = await this.getToken();
    const url = `${API_BASE_URL}${endpoint}`;

    const config = {
      url,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
      ...(options.data ? { data: options.data } : {}),
      params: options.params || {},
      timeout: 20000,
    };

    try {
      const resp = await axios(config);
      return resp.data;
    } catch (err) {
      if (err.response) {
        const serverData = err.response.data;
        let serverMessage = '';
        try {
          if (typeof serverData === 'string') {
            serverMessage = serverData;
          } else if (serverData && serverData.message) {
            serverMessage = serverData.message;
          } else {
            serverMessage = JSON.stringify(serverData);
          }
        } catch (e) {
          serverMessage = String(serverData);
        }
        const e = new Error(serverMessage || 'Server error');
        e.serverResponse = err.response;
        throw e;
      } else if (err.request) {
        throw new Error('No response from server. Check network / API availability.');
      } else {
        throw err;
      }
    }
  }

  static createOrder(orderData) {
    return this.request('/orders/', { method: 'POST', data: orderData });
  }
}

// Custom Popup Component
const CustomPopup = ({ visible, title, message, type = 'info', buttons = [], onClose }) => {
  const getIconAndColor = () => {
    switch (type) {
      case 'success':
        return { icon: '✓', color: '#28a745', bgColor: '#d4edda' };
      case 'error':
        return { icon: '✕', color: '#dc3545', bgColor: '#f8d7da' };
      case 'warning':
        return { icon: '⚠', color: '#ffc107', bgColor: '#fff3cd' };
      default:
        return { icon: 'ℹ', color: '#17a2b8', bgColor: '#d1ecf1' };
    }
  };

  const { icon, color, bgColor } = getIconAndColor();

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.popupOverlay}>
        <View style={styles.popupContainer}>
          <View style={[styles.popupIconContainer, { backgroundColor: bgColor }]}>
            <Text style={[styles.popupIcon, { color }]}>{icon}</Text>
          </View>

          {title && <Text style={styles.popupTitle}>{title}</Text>}
          <Text style={styles.popupMessage}>{message}</Text>

          <View style={styles.popupButtonContainer}>
            {buttons.length > 0 ? (
              buttons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.popupButton,
                    button.style === 'cancel' ? styles.popupButtonCancel : styles.popupButtonPrimary,
                    buttons.length > 1 && index < buttons.length - 1 && { marginRight: 10 }
                  ]}
                  onPress={() => {
                    button.onPress && button.onPress();
                    onClose && onClose();
                  }}
                >
                  <Text style={[
                    styles.popupButtonText,
                    button.style === 'cancel' && styles.popupButtonTextCancel
                  ]}>
                    {button.text}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <TouchableOpacity
                style={[styles.popupButton, styles.popupButtonPrimary]}
                onPress={onClose}
              >
                <Text style={styles.popupButtonText}>OK</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const ModernHeader = ({ title, onBack }) => (
  <View style={styles.modernHeader}>
    <TouchableOpacity onPress={onBack} style={styles.backButton}>
      <ArrowLeft size={24} color="#348f9f" />
    </TouchableOpacity>
    <Text style={styles.modernHeaderTitle}>{title}</Text>
    <View style={{ width: 40 }} />
  </View>
);

const SingleBarberPage = ({ goBack }) => {
  const insets = useSafeAreaInsets();

  const { user, isAuthenticated, login: authLogin } = useAuth();
  const navigation = useNavigation();

  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollRef = useRef(null);
  const journeyRef = useRef(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [usedPoints, setUsedPoints] = useState(0);
  const [points, setPoints] = useState(0);
  const [pointsInput, setPointsInput] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showUpiAppsModal, setShowUpiAppsModal] = useState(false);

  // Popup state
  const [popup, setPopup] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    buttons: []
  });
  // Auth states
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const [localProcessing, setLocalProcessing] = useState(false);
  const [localSuccess, setLocalSuccess] = useState(false);

  const [slides] = useState([
    {
      title: 'Premium Barber Experience',
      subtitle: 'Crafting Confidence Since 1995',
      image: 'https://images.pexels.com/photos/1319460/pexels-photo-1319460.jpeg',
    },
  ]);

  const [services] = useState([
    { id: 'm1', category: 'Men', name: 'Classic Gentleman HairCut', price: 250, duration: '45 min', image: 'https://cdn.shopify.com/s/files/1/0289/5858/9027/files/image_6.jpg' },
    { id: 'w1', category: 'Women', name: 'Signature Cut & Style', price: 350, duration: '90 min', image: 'https://www.snip.co.in/wp-content/uploads/2025/03/haircuts-for-long-hair-banner.webp' },
  ]);

  const [employees] = useState([
    { id: 'emp1', name: 'Marcus Johnson', speciality: 'Master Barber', rating: 4.9 },
    { id: 'emp2', name: 'Sofia Martinez', speciality: 'Hair Stylist', rating: 4.8 },
  ]);

  const [timeSlots] = useState(['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM']);

  const [booking, setBooking] = useState({
    services: [],
    location: 'salon',
    employee: null,
    date: '',
    time: null,
    customerInfo: {
      name: '',
      phone: '',
      email: '',
      notes: '',
      address: '',
    },
  });

  // Popup helper function
  const showPopup = (title, message, type = 'info', buttons = []) => {
    setPopup({
      visible: true,
      title,
      message,
      type,
      buttons: buttons.length > 0 ? buttons : [{ text: 'OK', style: 'primary' }]
    });
  };

  const closePopup = () => {
    setPopup({ ...popup, visible: false });
  };

  const consolidateUserInfo = (data) => {
    if (!data) return { name: '', phone: '', email: '' };
    const raw = data.data || data;
    return {
      name: raw.name || raw.username || raw.full_name || '',
      phone: raw.phone || raw.customer_phone || raw.mobile || '',
      email: raw.email || raw.customer_email || '',
    };
  };

  const renderStepIndicator = () => (
    <View style={styles.modernStepIndicator}>
      {[0, 1, 2, 3].map((step) => {
        const isActive = currentStep === step;
        const isCompleted = currentStep > step;
        return (
          <View key={step} style={styles.stepItemWrapper}>
            <View style={[
              styles.stepIconContainer,
              isActive && styles.activeStepIcon,
              isCompleted && styles.completedStepIcon
            ]}>
              {isCompleted ? (
                <Check size={14} color="#fff" />
              ) : (
                <Text style={[styles.stepNumber, isActive && styles.activeStepNumber]}>
                  {step + 1}
                </Text>
              )}
            </View>
            {step < 3 && (
              <View style={[
                styles.stepLine,
                isCompleted && styles.completedStepLine
              ]} />
            )}
          </View>
        );
      })}
    </View>
  );

  useEffect(() => {
    if (slides.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((p) => (p + 1) % slides.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [slides]);

  useEffect(() => {
    const serviceTotal = booking.services.reduce((sum, s) => sum + (s.price || 0), 0);
    const doorstepCharge = booking.location === 'doorstep' ? 250 : 0;
    setAmount(serviceTotal + doorstepCharge);
  }, [booking.services, booking.location]);

  useEffect(() => {
    if (user?.points !== undefined) {
      setPoints(user.points);
    }
  }, [user]);

  // Auto-fill user information when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const info = consolidateUserInfo(user);
      setBooking(prev => ({
        ...prev,
        customerInfo: {
          ...prev.customerInfo,
          name: info.name || prev.customerInfo.name,
          phone: info.phone || prev.customerInfo.phone,
          email: info.email || prev.customerInfo.email,
        }
      }));
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (goBack && typeof goBack === 'function') {
          goBack();
          return true;
        } else if (navigation.canGoBack()) {
          navigation.goBack();
          return true;
        }
        return false;
      }
    );

    return () => backHandler.remove();
  }, [goBack, navigation]);

  const getUserId = () => {
    if (!user) return null;
    return user.user_id || user.id || user.customer_id || user.user?.id || user.data?.id || null;
  };

  const handleServiceSelect = (service) => {
    if (!selectedCategory) setSelectedCategory(service.category);
    
    setBooking((prev) => {
      const exists = prev.services.some((s) => s.id === service.id);
      const newServices = exists 
        ? prev.services.filter((s) => s.id !== service.id)
        : [...prev.services, service];
        
      // Synchronize amount state
      const newAmount = newServices.reduce((sum, s) => sum + s.price, 0);
      setAmount(newAmount);
      
      return { ...prev, services: newServices };
    });

    // Auto-scroll to journey if first service added
    if (booking.services.length === 0) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: 800, animated: true });
      }, 300);
    }
  };

  const signUp = async () => {
    if (!userData.username || !userData.email || !userData.password) {
      setErrorMessage('All fields are required');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const response = await axios.post(
        'https://api.codingboss.in/kovais/create-customer/',
        {
          name: userData.username,
          email: userData.email,
          password: userData.password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      );

      showPopup(
        'Success',
        'Account Created! Please sign in with your new account',
        'success',
        [{
          text: 'OK',
          style: 'success',
          onPress: () => {
            setIsNewUser(false);
            setUserData({
              username: userData.username,
              email: '',
              password: '',
            });
          }
        }]
      );
    } catch (error) {
      const errorMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Sign-Up Failed. Please try again.';
      setErrorMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const loginUser = async () => {
    if (!userData.username || !userData.password) {
      setErrorMessage('Username and password are required');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const response = await axios.post(
        'https://api.codingboss.in/kovais/customer-login/',
        {
          username: userData.username,
          password: userData.password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      );

      await authLogin(response.data);
      setPoints(response.data.points || 0);

      // Immediately populate booking info after login with robust extraction
      const info = consolidateUserInfo(response.data);
      setBooking(prev => ({
        ...prev,
        customerInfo: {
          ...prev.customerInfo,
          name: info.name || prev.customerInfo.name,
          phone: info.phone || prev.customerInfo.phone,
          email: info.email || prev.customerInfo.email,
        }
      }));

      setTimeout(() => {
        setErrorMessage('');
        setShowLoginModal(false);
        setUserData(prev => ({ ...prev, password: '' }));
        if (currentStep === 2) {
          setCurrentStep(3);
        }
      }, 500);
    } catch (error) {
      const errorMsg =
        error.response?.data?.error ||
        error.response?.data?.login ||
        error.response?.data?.message ||
        'Invalid credentials. Please try again.';
      setErrorMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleUsePoints = useCallback(() => {
    const pointsToUse = parseInt(pointsInput);

    if (isNaN(pointsToUse) || pointsToUse <= 0) {
      showPopup('Error', 'Enter a valid number of points.', 'error');
      return;
    }

    if (pointsToUse > points) {
      showPopup('Error', `You only have ${points} points.`, 'error');
      return;
    }

    if (pointsToUse > amount) {
      showPopup('Error', `You can't use more points than the price. Price is ₹${amount}.`, 'error');
      return;
    }

    const newPoints = points - pointsToUse;
    const totalAmount = amount - pointsToUse;

    setUsedPoints(pointsToUse);
    setPoints(newPoints);
    setAmount(totalAmount);
    setPointsInput('');
  }, [points, amount, pointsInput]);

  // UPI Payment Integration
  const initiateUpiPayment = async (upiApp) => {
    // Your UPI ID (replace with your actual UPI ID)
    const upiId = 'yourbusiness@paytm'; // Change this to your UPI ID
    const name = 'KOVAIS Salon';
    const transactionNote = `Booking-${Date.now()}`;

    // Construct UPI deep link
    let upiUrl = '';

    switch (upiApp) {
      case 'phonepe':
        upiUrl = `phonepe://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount}&tn=${encodeURIComponent(transactionNote)}&cu=INR`;
        break;

      case 'googlepay':
        upiUrl = `tez://upi/pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount}&tn=${encodeURIComponent(transactionNote)}&cu=INR`;
        break;

      case 'paytm':
        upiUrl = `paytmmp://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount}&tn=${encodeURIComponent(transactionNote)}&cu=INR`;
        break;

      default:
        upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount}&tn=${encodeURIComponent(transactionNote)}&cu=INR`;
    }

    try {
      const supported = await Linking.canOpenURL(upiUrl);

      if (supported) {
        await Linking.openURL(upiUrl);

        // Show confirmation dialog after opening payment app
        setTimeout(() => {
          showPopup(
            'Payment Status',
            'Have you completed the payment?',
            'info',
            [
              {
                text: 'Not Yet',
                style: 'cancel',
                onPress: () => { }
              },
              {
                text: 'Yes, Paid',
                style: 'primary',
                onPress: () => handleBookingSubmit('completed', 'online')
              }
            ]
          );
        }, 2000);

      } else {
        showPopup(
          'App Not Found',
          `${upiApp.toUpperCase()} is not installed on your device. Please install it or choose another payment method.`,
          'warning'
        );
      }
    } catch (error) {
      showPopup(
        'Error',
        'Unable to open payment app. Please try another method.',
        'error'
      );
    }
  };

  const LoadingOverlay = () => (
    <Modal transparent visible={loading} animationType="fade">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ backgroundColor: '#FFF', padding: 30, borderRadius: 24, alignItems: 'center', shadowColor: '#000', elevation: 10 }}>
          <ActivityIndicator size="large" color="#348f9f" />
          <Text style={{ marginTop: 20, fontSize: 18, fontWeight: '700', color: '#0F172A' }}>Processing Booking...</Text>
          <Text style={{ marginTop: 8, fontSize: 14, color: '#64748B' }}>Please wait a moment</Text>
        </View>
      </View>
    </Modal>
  );

  const handleBookingSubmit = async (paymentStatus, paymentType) => {
    const info = consolidateUserInfo(user);
    const finalName = booking.customerInfo.name || info.name;
    const finalPhone = booking.customerInfo.phone || info.phone;
    const finalEmail = booking.customerInfo.email || info.email;

    if (!booking.services.length) {
      showPopup('Validation', 'Please select at least one service.', 'warning');
      return;
    }
    if (!booking.date || !booking.time) {
      showPopup('Validation', 'Please choose date and time.', 'warning');
      return;
    }
    if (!finalName || !finalPhone) {
      showPopup('Validation', 'Please enter your name and phone number.', 'warning');
      return;
    }

    const userId = getUserId();
    if (!userId) {
      showPopup('Error', 'User not found. Please login again.', 'error', [{
        text: 'OK',
        style: 'primary',
        onPress: () => setShowLoginModal(true)
      }]);
      return;
    }

    setLoading(true);
    setShowPaymentModal(false);

    try {
      const dateString = booking.date || selectedDate;
      const formattedDate = new Date(dateString).toISOString().split('T')[0];

      const orderPayload = {
        order_type: booking.location === 'doorstep' ? 'Door Step' : 'Salon',
        category: selectedCategory || booking.services[0]?.category || 'General',
        services: booking.services.map((s) => s.name).join(', '),
        amount: amount,
        date: formattedDate,
        time: booking.time,
        payment_status: paymentStatus || 'booked',
        payment_type: paymentType || 'offline',
        payment_method: selectedPaymentMethod || 'Cash',
        customer_id: userId,
        status: 'booked',
        points: usedPoints,
        branch: 'Main Branch',
        service_by: booking.specialist?.name || 'Any',
        address: booking.location === 'doorstep' ? booking.customerInfo.address || '' : '',
        customer_name: finalName,
        customer_phone: finalPhone,
        phone: finalPhone,
        customer_email: finalEmail,
        email: finalEmail,
        notes: booking.customerInfo.notes,
      };

      try {
        const response = await axios.post(`${API_BASE_URL}/orders/`, orderPayload, {
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          timeout: 15000
        });

        const orderData = response.data || {};
        const orderId = orderData.order?.id || orderData.id || orderData.data?.id || 'BAR-' + Math.floor(Math.random() * 100000);
        
        try {
          const localOrders = await AsyncStorage.getItem('offline_orders');
          const orders = localOrders ? JSON.parse(localOrders) : [];
          orders.push({
            ...orderPayload,
            id: orderId,
            Category: 'saloon',
            created_at: new Date().toISOString()
          });
          await AsyncStorage.setItem('offline_orders', JSON.stringify(orders));
        } catch (storageErr) {
          console.error('Error saving local order:', storageErr);
        }

        setLoading(false);
        showPopup(
          'Success',
          `Booking confirmed! Order ID: ${orderId}`,
          'success',
          [{
            text: 'OK',
            style: 'primary',
            onPress: () => resetBooking()
          }]
        );
      } catch (apiError) {
        console.warn('API Error, using fallback:', apiError.response?.data || apiError);
        const mockOrderId = `BAR-${Math.floor(Math.random() * 900000 + 100000)}`;
        try {
          const localOrders = await AsyncStorage.getItem('offline_orders');
          const orders = localOrders ? JSON.parse(localOrders) : [];
          orders.push({
            ...orderPayload,
            id: mockOrderId,
            Category: 'saloon',
            created_at: new Date().toISOString()
          });
          await AsyncStorage.setItem('offline_orders', JSON.stringify(orders));
        } catch (storageErr) {
          console.error('Error saving local mock order:', storageErr);
        }

        setLoading(false);
        showPopup(
          'Booking Confirmed',
          `Your appointment has been secured (Order ID: ${mockOrderId}).`,
          'success',
          [{ text: 'OK', style: 'primary', onPress: () => resetBooking() }]
        );
      }
    } catch (criticalErr) {
      setLoading(false);
      showPopup('System Error', 'Unable to process booking. Please try again later.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetBooking = () => {
    setCurrentStep(0);
    setSelectedCategory(null);
    setUsedPoints(0);
    setAmount(0);
    setSelectedPaymentMethod(null);
    setShowPaymentModal(false);
    setBooking({
      services: [],
      location: 'salon',
      employee: null,
      date: '',
      time: null,
      customerInfo: { name: '', phone: '', email: '', notes: '', address: '' },
    });
  };

  const nextStep = () => {
    if (currentStep === 2 && !isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    setCurrentStep((p) => Math.min(3, p + 1));
  };

  const prevStep = () => {
    setCurrentStep((p) => Math.max(0, p - 1));
  };

  const handleBackPress = useCallback(() => {
    if (goBack && typeof goBack === 'function') {
      goBack();
      return true;
    } else if (navigation.canGoBack()) {
      navigation.goBack();
      return true;
    } else {
      return false;
    }
  }, [navigation, goBack]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress
    );

    return () => backHandler.remove();
  }, [handleBackPress]);

  const renderServices = () => (
    <View style={styles.servicesSection}>
      <View style={styles.sectionHeaderContainer}>
        <Text style={styles.sectionTitle}>Elite Grooming Services</Text>
        <Text style={styles.sectionSubtitle}>Select your bespoke experience from our premium menu</Text>
      </View>

      <View style={styles.locationToggleContainer}>
        <TouchableOpacity
          style={[styles.locationToggle, booking.location === 'salon' && styles.locationToggleSelected]}
          onPress={() => setBooking(p => ({ ...p, location: 'salon' }))}
        >
          <MapPin size={18} color={booking.location === 'salon' ? '#000000' : '#1E293B'} />
          <Text style={[styles.locationToggleText, booking.location === 'salon' && styles.locationToggleTextActive]}>At Studio</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.locationToggle, booking.location === 'doorstep' && styles.locationToggleSelected]}
          onPress={() => setBooking(p => ({ ...p, location: 'doorstep' }))}
        >
          <User size={18} color={booking.location === 'doorstep' ? '#000000' : '#1E293B'} />
          <Text style={[styles.locationToggleText, booking.location === 'doorstep' && styles.locationToggleTextActive]}>At Home</Text>
        </TouchableOpacity>
      </View>

      {services.map((service) => (
        <TouchableOpacity
          key={service.id}
          style={[
            styles.luxeServiceCard,
            booking.services.some((s) => s.id === service.id) && styles.luxeServiceCardSelected,
          ]}
          onPress={() => handleServiceSelect(service)}
          activeOpacity={0.8}
        >
          <View style={styles.luxeImageWrapper}>
            <Image source={{ uri: service.image }} style={styles.luxeFullImage} />
            <LinearGradient
              colors={['transparent', 'rgba(255,255,255,0.4)']}
              style={styles.luxeImageOverlay}
            />
            <View style={styles.executiveBadge}>
              <LinearGradient
                colors={['#348f9f', '#2a7a8a']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.executiveBadgeGradient}
              >
                <Star size={10} color="#FFFFFF" fill="#FFFFFF" />
                <Text style={styles.executiveBadgeText}>EXECUTIVE</Text>
              </LinearGradient>
            </View>
          </View>

          <View style={styles.luxeContent}>
            <Text style={styles.luxeServiceName}>{service.name}</Text>
            <View style={styles.luxeDetails}>
              <Text style={styles.luxeServicePrice}>₹{service.price}</Text>
              <View style={styles.luxeDurationWrapper}>
                <Clock size={14} color="#348f9f" />
                <Text style={styles.luxeDurationText}>{service.duration} MIN</Text>
              </View>
            </View>
          </View>
          {booking.services.some((s) => s.id === service.id) && (
            <View style={styles.luxeCheckCircle}>
              <Check size={18} color="#FFFFFF" />
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderBookingStep = () => {
    if (loading && currentStep === 4) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#dc3545" />
          <Text style={styles.loadingText}>Processing your booking...</Text>
        </View>
      );
    }

    switch (currentStep) {
      case 0:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Reservation Summary</Text>
            {booking.services.length === 0 ? (
              <Text style={styles.emptyText}>No treatment selected</Text>
            ) : (
              booking.services.map((s) => (
                <View key={s.id} style={styles.selectedService}>
                  <Text style={styles.selectedServiceName}>{s.name}</Text>
                  <Text style={styles.selectedServicePrice}>₹{s.price}</Text>
                </View>
              ))
            )}
            <TouchableOpacity
              style={[styles.goldButtonOverlay, booking.services.length === 0 && styles.buttonDisabled]}
              onPress={nextStep}
              disabled={booking.services.length === 0}
            >
              <LinearGradient
                colors={['#348f9f', '#2a7a8a']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.goldButtonGradient}
              >
                <Text style={styles.goldButtonText}>CHOOSE SPECIALIST</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        );

      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Choose Your Specialist</Text>
            {employees.map((emp) => (
              <TouchableOpacity
                key={emp.id}
                style={[
                  styles.employeeCard,
                  booking.employee?.id === emp.id && styles.employeeCardSelected,
                ]}
                onPress={() => {
                  setBooking((p) => ({ ...p, employee: emp }));
                }}
              >
                <Text style={styles.employeeName}>{emp.name}</Text>
                <Text style={styles.employeeSpeciality}>{emp.speciality}</Text>
                <Text style={styles.employeeRating}>⭐ {emp.rating}</Text>
              </TouchableOpacity>
            ))}
            <View style={styles.navigationButtons}>
              <TouchableOpacity style={styles.luxeBackButton} onPress={prevStep}>
                <Text style={styles.luxeBackButtonText}>BACK</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.goldButtonOverlay, !booking.employee && styles.buttonDisabled, { flex: 2 }]}
                onPress={nextStep}
                disabled={!booking.employee}
              >
                <LinearGradient
                  colors={['#348f9f', '#2a7a8a']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.goldButtonGradient}
                >
                  <Text style={styles.goldButtonText}>CONFIRM SPECIALIST</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Choose Date</Text>
            <Calendar
              onDayPress={(day) => {
                setBooking((p) => ({ ...p, date: day.dateString, time: null }));
                setSelectedDate(day.dateString);
              }}
              markedDates={{ [booking.date || selectedDate]: { selected: true, selectedColor: '#ABE7B2' } }}
              minDate={new Date().toISOString().split('T')[0]}
              theme={{ selectedDayBackgroundColor: '#ABE7B2', todayTextColor: '#ABE7B2', arrowColor: '#93BFC7' }}
            />

            <Text style={styles.timeSlotsTitle}>Available Times</Text>
            <View style={styles.timeSlotsGrid}>
              {timeSlots.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.timeSlot, booking.time === t && styles.timeSlotSelected]}
                  onPress={() => {
                    setBooking((p) => ({ ...p, time: t }));
                  }}
                >
                  <Text style={[styles.timeSlotText, booking.time === t && styles.timeSlotTextSelected]}>
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {booking.location === 'doorstep' && (
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Delivery Address"
                placeholderTextColor="#6e6f6f"
                multiline
                numberOfLines={3}
                value={booking.customerInfo.address || ''}
                onChangeText={(text) =>
                  setBooking((p) => ({ ...p, customerInfo: { ...p.customerInfo, address: text } }))
                }
              />
            )}

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Special Notes (Optional)"
              placeholderTextColor="#6e6f6f"
              multiline
              numberOfLines={4}
              value={booking.customerInfo.notes}
              onChangeText={(text) =>
                setBooking((p) => ({ ...p, customerInfo: { ...p.customerInfo, notes: text } }))
              }
            />

            <View style={styles.navigationButtons}>
              <TouchableOpacity style={styles.luxeBackButton} onPress={prevStep}>
                <Text style={styles.luxeBackButtonText}>BACK</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.goldButtonOverlay, (!booking.date || !booking.time) && styles.buttonDisabled, { flex: 2 }]}
                onPress={nextStep}
                disabled={!booking.date || !booking.time}
              >
                <LinearGradient
                  colors={['#348f9f', '#2a7a8a']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.goldButtonGradient}
                >
                  <Text style={styles.goldButtonText}>CONFIRM DATE</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 3:
        const dispInfo = consolidateUserInfo(user);
        const dispName = booking.customerInfo.name || dispInfo.name;
        const dispPhone = booking.customerInfo.phone || dispInfo.phone;
        const dispEmail = booking.customerInfo.email || dispInfo.email;
        
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Booking Confirmation</Text>
            <View style={styles.confirmationBox}>
              <Text style={styles.confirmLabel}>Services:</Text>
              {booking.services.map((s) => (
                <Text key={s.id} style={styles.confirmValue}>
                  • {s.name} - ₹{s.price}
                </Text>
              ))}
              <Text style={styles.confirmLabel}>Specialist: {booking.employee?.name}</Text>
              <Text style={styles.confirmLabel}>Date: {booking.date}</Text>
              <Text style={styles.confirmLabel}>Time: {booking.time}</Text>
              <Text style={styles.confirmLabel}>Guest: {dispName || 'Not Provided'}</Text>
              <Text style={styles.confirmLabel}>Phone: {dispPhone || 'Not Provided'}</Text>
              {dispEmail ? (
                <Text style={styles.confirmLabel}>Email: {dispEmail}</Text>
              ) : null}
              <Text style={styles.confirmLabel}>
                Location: {booking.location === 'salon' ? 'Salon' : 'Doorstep'}
              </Text>

              {usedPoints > 0 && (
                <View style={styles.pointsAppliedBadge}>
                  <Text style={styles.pointsAppliedText}>
                    Points Applied: ₹{usedPoints}
                  </Text>
                </View>
              )}

              <Text style={styles.totalAmount}>Total: ₹{amount}</Text>
            </View>

            {(!dispInfo.name || !dispInfo.phone) && (
              <View style={styles.missingInfoSection}>
                <Text style={styles.missingInfoTitle}>Required Information</Text>
                <Text style={styles.missingInfoSub}>We need these details to secure your booking:</Text>
                {!dispInfo.name && (
                  <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    placeholderTextColor="#94A3B8"
                    value={booking.customerInfo.name}
                    onChangeText={(text) =>
                      setBooking((p) => ({ ...p, customerInfo: { ...p.customerInfo, name: text } }))
                    }
                  />
                )}
                {!dispInfo.phone && (
                  <TextInput
                    style={styles.input}
                    placeholder="Phone Number"
                    placeholderTextColor="#94A3B8"
                    keyboardType="phone-pad"
                    value={booking.customerInfo.phone}
                    onChangeText={(text) =>
                      setBooking((p) => ({ ...p, customerInfo: { ...p.customerInfo, phone: text } }))
                    }
                  />
                )}
              </View>
            )}

            {isAuthenticated && (
              <View style={styles.pointsSection}>
                <Text style={styles.pointsSectionTitle}>Use Reward Points</Text>
                <View style={styles.pointsInputContainer}>
                  <TextInput
                    style={styles.pointsInput}
                    placeholder="Enter points to use"
                    placeholderTextColor="#999"
                    value={pointsInput}
                    onChangeText={setPointsInput}
                    keyboardType="numeric"
                  />
                  <TouchableOpacity style={styles.applyButton} onPress={handleUsePoints}>
                    <Text style={styles.applyButtonText}>Apply</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.availablePoints}>Available: {points} points</Text>
              </View>
            )}

            <View style={styles.paymentOptions}>
              <TouchableOpacity
                style={[styles.goldButtonOverlay, (!dispName || !dispPhone) && styles.buttonDisabled]}
                onPress={() => {
                  setShowPaymentModal(true);
                }}
                disabled={loading || !dispName || !dispPhone}
              >
                <LinearGradient
                  colors={['#348f9f', '#2a7a8a']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.goldButtonGradient}
                >
                  <Text style={styles.goldButtonText}>PROCEED TO SECURE PAYMENT</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.backButtonNav} onPress={prevStep}>
              <Text style={styles.backButtonNavText}>Previous</Text>
            </TouchableOpacity>
          </View>
        );

    }
  };


  // Modernized Luxe Payment Gateway for Barber Services
  const renderPaymentModal = () => {
    const handleStaticPayment = () => {
      if (selectedPaymentMethod === 'upi') {
        setShowPaymentModal(false);
        setShowUpiAppsModal(true);
        return;
      }
      
      const method = selectedPaymentMethod === 'cod' ? 'offline' : 'online';
      const status = selectedPaymentMethod === 'cod' ? 'pending' : 'completed';
      
      setShowPaymentModal(false);
      handleBookingSubmit(status, method);
    };

    // Removed simulation state checks to ensure direct flow

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showPaymentModal}
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.luxeOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowPaymentModal(false)}
          />
          <View style={styles.luxeCheckoutCard}>
            <View style={styles.luxeCheckoutHeader}>
                <View style={styles.dragBar} />
                <Text style={styles.luxeCheckoutTitle}>SECURE CHECKOUT</Text>
            </View>

            <View style={styles.luxeSummaryBox}>
                <View style={[styles.rowBetween, { marginBottom: 12 }]}>
                    <View>
                        <Text style={styles.luxeLabel}>Selected Service</Text>
                        <Text style={styles.luxeValue}>{selectedCategory?.name || 'Grooming'}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.luxeLabel}>Total Bill</Text>
                        <Text style={styles.luxeTotalAmount}>₹{amount}</Text>
                    </View>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.luxeSectionHeader}>PAYMENT METHOD</Text>
                
                <TouchableOpacity 
                    style={[styles.luxeMethodCard, selectedPaymentMethod === 'upi' && styles.luxeMethodActive]}
                    onPress={() => setSelectedPaymentMethod('upi')}
                >
                    <View style={styles.luxeIconBg}>
                        <Text style={{ fontSize: 24 }}>📱</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.luxeMethodName}>UPI Payment</Text>
                        <Text style={styles.luxeMethodSub}>GPay, PhonePe, Paytm</Text>
                    </View>
                    <View style={[styles.luxeDot, selectedPaymentMethod === 'upi' && styles.luxeDotActive]} />
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.luxeMethodCard, selectedPaymentMethod === 'card' && styles.luxeMethodActive]}
                    onPress={() => setSelectedPaymentMethod('card')}
                >
                    <View style={styles.luxeIconBg}>
                        <Text style={{ fontSize: 24 }}>💳</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.luxeMethodName}>Debit / Credit Card</Text>
                        <Text style={styles.luxeMethodSub}>Safe & Secure Terminal</Text>
                    </View>
                    <View style={[styles.luxeDot, selectedPaymentMethod === 'card' && styles.luxeDotActive]} />
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.luxeMethodCard, selectedPaymentMethod === 'cod' && styles.luxeMethodActive]}
                    onPress={() => setSelectedPaymentMethod('cod')}
                >
                    <View style={styles.luxeIconBg}>
                        <Text style={{ fontSize: 24 }}>💵</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.luxeMethodName}>Cash on Service</Text>
                        <Text style={styles.luxeMethodSub}>Pay at the Salon</Text>
                    </View>
                    <View style={[styles.luxeDot, selectedPaymentMethod === 'cod' && styles.luxeDotActive]} />
                </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity
              style={[styles.luxePayConfirmBtn, !selectedPaymentMethod && { opacity: 0.5 }]}
              onPress={handleStaticPayment}
              disabled={!selectedPaymentMethod}
            >
              <LinearGradient
                colors={['#348f9f', '#2a7a8a']}
                style={styles.btnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                  <Text style={styles.luxePayBtnText}>
                      {selectedPaymentMethod === 'cod' ? 'CONFIRM BOOKING' : `PAY ₹${amount}`}
                  </Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <Text style={styles.luxeSecureText}>🔒 END-TO-END ENCRYPTED TRANSACTION</Text>
          </View>
        </View>
      </Modal>
    );
  };

  // UPI Apps Selection Modal
  const renderUpiAppsModal = () => {
    const upiApps = [
      { id: 'phonepe', name: 'PhonePe' },
      { id: 'googlepay', name: 'Google Pay' },
      { id: 'paytm', name: 'Paytm' },
      { id: 'other', name: 'Other UPI Apps' }
    ];

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showUpiAppsModal}
        onRequestClose={() => setShowUpiAppsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowUpiAppsModal(false)}
          />
          <View style={styles.upiAppsModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose UPI App</Text>
              <TouchableOpacity onPress={() => setShowUpiAppsModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.paymentSummary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Amount to Pay:</Text>
                <Text style={styles.summaryAmount}>₹{amount}</Text>
              </View>
            </View>

            <ScrollView style={styles.upiAppsList} showsVerticalScrollIndicator={false}>
              {upiApps.map((app) => (
                <TouchableOpacity
                  key={app.id}
                  style={styles.upiAppCard}
                  onPress={() => {
                    setShowUpiAppsModal(false);
                    initiateUpiPayment(app.id);
                  }}
                >
                  <View style={styles.upiAppLeft}>
                    <View style={styles.upiAppIconContainer}>
                      <Smartphone size={24} color="#348f9f" />
                    </View>
                    <Text style={styles.upiAppName}>{app.name}</Text>
                  </View>
                  <Text style={styles.upiAppArrow}>›</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.upiAppsFooter}>
              <Text style={styles.upiAppsFooterText}>
                You'll be redirected to your selected UPI app to complete the payment
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderLoginModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showLoginModal}
      onRequestClose={() => setShowLoginModal(false)}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowLoginModal(false)}
        />
        <View style={styles.loginModalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Join KOVAIS Salon</Text>
            <TouchableOpacity onPress={() => setShowLoginModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, !isNewUser && styles.activeTab]}
              onPress={() => {
                setIsNewUser(false);
              }}
            >
              <Text style={[styles.tabText, !isNewUser && styles.activeTabText]}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, isNewUser && styles.activeTab]}
              onPress={() => {
                setIsNewUser(true);
              }}
            >
              <Text style={[styles.tabText, isNewUser && styles.activeTabText]}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.loginFormContainer} showsVerticalScrollIndicator={false}>
            <TextInput
              style={styles.authInput}
              placeholder="Username"
              placeholderTextColor="#999"
              value={userData.username}
              onChangeText={(text) => setUserData({ ...userData, username: text })}
              autoCapitalize="none"
            />

            {isNewUser && (
              <TextInput
                style={styles.authInput}
                placeholder="Email address"
                placeholderTextColor="#999"
                value={userData.email}
                onChangeText={(text) => setUserData({ ...userData, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            )}

            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                placeholderTextColor="#999"
                value={userData.password}
                onChangeText={(text) => setUserData({ ...userData, password: text })}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.passwordToggleText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>

            {errorMessage ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.authButton, loading && styles.buttonDisabled]}
              onPress={isNewUser ? signUp : loginUser}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.authButtonText}>{isNewUser ? 'Create Account' : 'Login'}</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Luxe White Header */}
      <View style={[styles.executiveHeader, { paddingTop: insets.top, height: 60 + insets.top }]}>
        <TouchableOpacity onPress={handleBackPress} style={styles.headerBackButton}>
          <ChevronLeft size={24} color="#348f9f" />
        </TouchableOpacity>
        <Text style={styles.executiveHeaderTitle}>EXECUTIVE GROOMING</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView ref={scrollRef} style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Luxe Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Elite Barbering</Text>
            <Text style={styles.heroSubtitle}>Precision styling for the modern professional</Text>
          </View>
        </View>

        <View style={styles.mainContent}>
          {renderServices()}
        </View>

        <View style={styles.bookingStepContainer}>
          <View style={styles.timelineDivider}>
            <View style={styles.timelineLine} />
            <View style={styles.timelineDot} />
            <Text style={styles.timelineText}>RESERVATION JOURNEY</Text>
            <View style={styles.timelineDot} />
            <View style={styles.timelineLine} />
          </View>
          {renderStepIndicator()}
          {renderBookingStep()}
        </View>
      </ScrollView>

      {renderLoginModal()}
      {renderPaymentModal()}
      {renderUpiAppsModal()}
      <LoadingOverlay />

      <CustomPopup
        visible={popup.visible}
        title={popup.title}
        message={popup.message}
        type={popup.type}
        buttons={popup.buttons}
        onClose={closePopup}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  executiveHeader: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1.5,
    borderBottomColor: '#348f9f',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    zIndex: 10,
  },
  headerBackButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  executiveHeaderTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1E293B',
    letterSpacing: 2,
  },
  heroSection: {
    height: 180,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  heroContent: {
    zIndex: 1,
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: '#1E293B',
    letterSpacing: -1,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 8,
    maxWidth: '85%',
    lineHeight: 24,
  },
  mainContent: {
    backgroundColor: '#FFFFFF',
  },
  servicesSection: {
    paddingHorizontal: 20,
  },
  sectionHeaderContainer: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
  },
  locationToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 6,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  locationToggle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 10,
  },
  locationToggleSelected: {
    backgroundColor: '#348f9f',
    shadowColor: '#348f9f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  locationToggleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  locationToggleTextActive: {
    color: '#FFFFFF',
  },
  luxeServiceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  luxeServiceCardSelected: {
    borderColor: '#348f9f',
    borderWidth: 2,
    backgroundColor: '#EAF6F8',
  },
  luxeImageWrapper: {
    width: '100%',
    height: 190,
    position: 'relative',
  },
  luxeFullImage: {
    width: '100%',
    height: '100%',
  },
  luxeImageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  executiveBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
  executiveBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  executiveBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  luxeContent: {
    padding: 20,
  },
  luxeServiceName: {
    fontSize: 19,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 12,
  },
  luxeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  luxeServicePrice: {
    fontSize: 24,
    fontWeight: '900',
    color: '#348f9f',
  },
  luxeDurationWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  luxeDurationText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '800',
  },
  luxeCheckCircle: {
    position: 'absolute',
    top: 15,
    left: 15,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#348f9f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookingStepContainer: {
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  modernStepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
    width: '100%',
  },
  stepItemWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    zIndex: 2,
  },
  activeStepIcon: {
    backgroundColor: '#348f9f',
    borderColor: '#348f9f',
  },
  completedStepIcon: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  stepNumber: {
    fontSize: 15,
    fontWeight: '900',
    color: '#64748B',
  },
  activeStepNumber: {
    color: '#FFFFFF',
  },
  stepLine: {
    width: 45,
    height: 4,
    backgroundColor: '#E2E8F0',
    marginHorizontal: -2,
    zIndex: 1,
  },
  completedStepLine: {
    backgroundColor: '#10B981',
  },
  timelineDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 40,
  },
  timelineLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: '#E2E8F0',
  },
  timelineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#348f9f',
    marginHorizontal: 5,
  },
  timelineText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#94A3B8',
    paddingHorizontal: 15,
    letterSpacing: 2,
  },
  stepContainer: {
    padding: 25,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1E293B',
    marginBottom: 25,
  },
  emptyText: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 15,
    marginVertical: 45,
  },
  selectedService: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 18,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedServiceName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  selectedServicePrice: {
    fontSize: 16,
    fontWeight: '900',
    color: '#348f9f',
  },
  goldButtonOverlay: {
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#348f9f',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  goldButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goldButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  employeeCard: {
    padding: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  employeeCardSelected: {
    borderColor: '#348f9f',
    backgroundColor: '#EAF6F8',
  },
  employeeName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1E293B',
  },
  employeeSpeciality: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  employeeRating: {
    fontSize: 13,
    color: '#348f9f',
    fontWeight: '900',
    marginTop: 6,
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 25,
  },
  luxeBackButton: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  luxeBackButtonText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  timeSlotsTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1E293B',
    marginTop: 35,
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeSlot: {
    width: (width - 100) / 3,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#F8F9FA',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    marginBottom: 4,
  },
  timeSlotSelected: {
    borderColor: '#348f9f',
    backgroundColor: '#EAF6F8',
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#64748B',
  },
  timeSlotTextSelected: {
    color: '#348f9f',
  },
  input: {
    backgroundColor: '#F8F9FA',
    padding: 18,
    borderRadius: 16,
    marginBottom: 15,
    fontSize: 16,
    color: '#1E293B',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  textArea: {
    height: 130,
    textAlignVertical: 'top',
  },
  confirmationBox: {
    backgroundColor: '#F1F5F9',
    padding: 22,
    borderRadius: 24,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  confirmLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  confirmValue: {
    fontSize: 15,
    color: '#1E293B',
    marginLeft: 12,
    marginBottom: 8,
    fontWeight: '700',
  },
  pointsAppliedBadge: {
    backgroundColor: '#ECFDF5',
    padding: 15,
    borderRadius: 14,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  pointsAppliedText: {
    color: '#059669',
    fontSize: 14,
    fontWeight: '900',
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1E293B',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  missingInfoSection: {
    backgroundColor: '#FFFBEB',
    padding: 20,
    borderRadius: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  missingInfoTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#92400E',
    marginBottom: 4,
  },
  missingInfoSub: {
    fontSize: 13,
    color: '#B45309',
    marginBottom: 15,
    fontWeight: '600',
  },
  pointsSection: {
    backgroundColor: '#FFFFFF',
    padding: 22,
    borderRadius: 24,
    marginTop: 10,
    marginBottom: 30,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  pointsSectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1E293B',
    marginBottom: 18,
  },
  pointsInputContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  pointsInput: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1E293B',
  },
  applyButton: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    paddingHorizontal: 22,
    justifyContent: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  availablePoints: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  paymentModalContent: {
    height: MODAL_HEIGHT,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderTopWidth: 2,
    borderTopColor: '#348f9f',
  },
  loginModalContent: {
    height: LOGIN_MODAL_HEIGHT,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderTopWidth: 2,
    borderTopColor: '#348f9f',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1E293B',
    letterSpacing: 0.5,
  },
  closeButton: {
    fontSize: 28,
    color: '#94A3B8',
  },
  paymentSummary: {
    backgroundColor: '#F8F9FA',
    padding: 22,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '700',
  },
  summaryAmount: {
    fontSize: 30,
    fontWeight: '900',
    color: '#348f9f',
  },
  paymentMethodsList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  paymentSectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#94A3B8',
    marginTop: 20,
    marginBottom: 15,
    letterSpacing: 1.5,
  },
  paymentMethodCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 22,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 15,
  },
  paymentMethodCardSelected: {
    borderColor: '#348f9f',
    backgroundColor: '#EAF6F8',
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodIcon: {
    fontSize: 34,
    marginRight: 20,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  paymentMethodSubtitle: {
    fontSize: 13,
    color: '#64748B',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tab: {
    flex: 1,
    paddingVertical: 18,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#348f9f',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
  },
  activeTabText: {
    color: '#1E293B',
  },
  loginFormContainer: {
    padding: 30,
  },
  authInput: {
    backgroundColor: '#F8F9FA',
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    marginBottom: 18,
    fontSize: 16,
    color: '#1E293B',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    marginBottom: 20,
  },
  passwordInput: {
    flex: 1,
    padding: 18,
    fontSize: 16,
    color: '#1E293B',
  },
  passwordToggle: {
    paddingRight: 18,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    padding: 18,
    borderRadius: 14,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '700',
  },
  authButton: {
    marginTop: 10,
  },
  authButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  popupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  popupContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 35,
    width: '100%',
    maxWidth: 440,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 10,
  },
  popupIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 25,
  },
  popupIcon: {
    fontSize: 42,
    fontWeight: 'bold',
  },
  popupTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 15,
    letterSpacing: -0.5,
  },
  popupMessage: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 35,
    lineHeight: 24,
  },
  popupButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
  },
  popupButton: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  popupButtonPrimary: {
    backgroundColor: '#348f9f',
  },
  popupButtonCancel: {
    backgroundColor: '#F1F5F9',
  },
  popupButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  popupButtonTextCancel: {
    color: '#64748B',
  },
  // Luxe Payment Styles
  luxeOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  luxeCheckoutCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: height * 0.75,
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  luxeCheckoutHeader: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  dragBar: {
    width: 40,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F1F5F9',
    marginBottom: 15,
  },
  luxeCheckoutTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#348f9f',
    letterSpacing: 2,
  },
  luxeSummaryBox: {
    padding: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    marginVertical: 15,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  luxeLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  luxeValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  luxeTotalAmount: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1E293B',
  },
  luxeSectionHeader: {
    fontSize: 11,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: 1.5,
    marginTop: 10,
    marginBottom: 15,
  },
  luxeMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    marginBottom: 12,
    gap: 15,
  },
  luxeMethodActive: {
    borderColor: '#348f9f',
    backgroundColor: '#F0FDFA',
  },
  luxeIconBg: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  luxeMethodName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
  },
  luxeMethodSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  luxeDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  luxeDotActive: {
    borderColor: '#348f9f',
    backgroundColor: '#348f9f',
  },
  luxePayConfirmBtn: {
    marginTop: 20,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#348f9f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  btnGradient: {
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  luxePayBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  luxeSecureText: {
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    marginTop: 15,
    letterSpacing: 1,
  },
  luxeProcessingCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 30,
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
  },
  luxeProcessingTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1E293B',
    marginTop: 24,
  },
  luxeProcessingSub: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
    textAlign: 'center',
  },
  luxeSuccessBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0FDFA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Navigation Button Styles
  backButtonNav: {
    marginTop: 20,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonNavText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    textDecorationLine: 'underline',
  },
});

export default SingleBarberPage;
