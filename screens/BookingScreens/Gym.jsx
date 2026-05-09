
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  StyleSheet,
  Dimensions,
  Alert,
  SafeAreaView,
  StatusBar,
  BackHandler,
  Linking,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Check, Star, Clock, MapPin, User, Bookmark, Trophy, Calendar as CalendarIcon, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';

const { width, height } = Dimensions.get('window');
const MODAL_HEIGHT = height * 0.85;
const LOGIN_MODAL_HEIGHT = height * 0.7;

const Gym = ({ goBack }) => {
  const insets = useSafeAreaInsets();
  // User Management
  const { user, isAuthenticated, login: authLogin, logout: authLogout, updatePoints } = useAuth();
  const navigation = useNavigation();
  const [points, setPoints] = useState(user?.points || 0);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    if (user) {
      const userPhone = user.phone || user.mobile || user.customer_phone || user.contact || (/^\d{10}$/.test(user.username) ? user.username : '') || '';
      setFormData({
        name: user.name || user.username || '',
        phone: userPhone,
        email: user.email || ''
      });
    }
  }, [user]);

  const [selectedGender, setSelectedGender] = useState('');
  const [selectedAge, setSelectedAge] = useState('');
  const [selectedAmount, setSelectedAmount] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [bookedStatus, setBookedStatus] = useState('booked');
  const [usedPoints, setUsedPoints] = useState(0);
  const [value, setValue] = useState('');
  const [plan, setPlan] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // New states for enhanced payment modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showUpiAppsModal, setShowUpiAppsModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);

  const [pointsError, setPointsError] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');

  const [userData, setUserData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const handleBackPress = useCallback(() => {
    //console.log('🔙 Back button pressed');
    if (goBack && typeof goBack === 'function') {
      goBack();
      return true;
    } else if (navigation.canGoBack()) {
      navigation.goBack();
      return true;
    } else {
      //console.log('No navigation method available');
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

  useEffect(() => {
    if (user?.points !== undefined) {
      setPoints(user.points);
    }
  }, [user]);

  const successStories = [
    {
      name: 'Rajesh Kumar',
      achievement: 'Lost 25kg in 6 months',
      image: 'https://img.freepik.com/free-photo/portrait-handsome-smiling-stylish-young-man-model-dressed-red-checkered-shirt-fashion-man-posing_158538-4909.jpg',
      testimonial: 'KOVAIS Gym transformed my life with their 24/7 access. The trainers are amazing at any hour! ',
    },
    {
      name: 'Priya Sharma',
      achievement: 'Built muscle & strength',
      image: 'https://img.freepik.com/free-photo/young-beautiful-woman-pink-warm-sweater-natural-look-smiling-portrait-isolated-long-hair_285396-896.jpg',
      testimonial: 'Best gym in town! Great equipment and 24 Hours supportive environment.',
    },
    {
      name: 'Arjun Patel',
      achievement: 'Marathon runner now',
      image: 'https://img.freepik.com/free-photo/handsome-confident-smiling-man-with-hands-hips_176420-18743.jpg',
      testimonial: "Started from zero fitness level, now I'm running marathons!",
    },
  ];

  const timeSlots = [
    '09:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '01:00 PM',
    '02:00 PM',
    '03:00 PM',
    '04:00 PM',
    '05:00 PM',
    '06:00 PM',
  ];

  const membershipPlans = [
    {
      amount: '399',
      duration: '1 /Month',
      title: '24/7 Basic Plan',
      savings: 'Full 24h Access',
      popular: false,
    },
    {
      amount: '1099',
      duration: '3 /Months',
      title: '24/7 Pro Plan',
      savings: 'Save 8% + 24h Access',
      popular: false,
    },
    {
      amount: '2199',
      duration: '6 /Months',
      title: '24/7 Elite Plan',
      savings: 'Save 15% + 24h Access',
      popular: false,
    },
    {
      amount: '4099',
      duration: '1 /Year',
      title: '24/7 Ultimate Year',
      savings: 'Save 25% + 24h Access',
      popular: false,
    },
  ];

  const isProceedEnabled =
    selectedGender && selectedAge && selectedAmount && selectedTime && plan;

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getUserId = () => {
    if (!user) return null;
    return user.user_id || user.id || user.customer_id || null;
  };

  const isSlotBooked = slot => {
    const bookedSlots = [];
    return bookedSlots.includes(slot);
  };

  const isPastSlot = slot => {
    if (!selectedDate) return false;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const selectedDay = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
    );

    if (today.getTime() === selectedDay.getTime()) {
      const [time, modifier] = slot.split(' ');
      let [hours, minutes] = time.split(':').map(Number);

      if (modifier === 'PM' && hours !== 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;

      const slotDateTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        hours,
        minutes || 0,
      );

      return slotDateTime.getTime() <= now.getTime();
    }

    return false;
  };

  const handlePlanClick = useCallback((amount, duration) => {
    setSelectedAmount(amount);
    setPlan(duration);
  }, []);

  const handleSelectSlot = useCallback(slot => {
    setSelectedTime(slot);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setShowPaymentModal(false);
    setPointsError('');
    setBookingError('');
  }, []);

  const consolidateUserInfo = (data) => {
    if (!data) return { name: '', phone: '', email: '' };
    const raw = data.data || data;
    return {
      name: raw.name || raw.username || raw.full_name || '',
      phone: raw.phone || raw.customer_phone || raw.mobile || '',
      email: raw.email || raw.customer_email || '',
    };
  };

  const handlePayment = useCallback(() => {
    if (isAuthenticated && selectedTime) {
      setShowLoginModal(false);
      setShowModal(true); // Open confirmation modal first
    } else {
      setShowLoginModal(true);
      setShowModal(false);
    }
  }, [isAuthenticated, selectedTime]);

  const handleProceedToPayment = () => {
    // ✅ Extract reliable phone for validation
    const phoneToCheck = formData.phone || user?.phone || user?.mobile || user?.customer_phone || user?.contact || (/^\d{10}$/.test(user?.username) ? user.username : '');
    
    if (!/^\d{10}$/.test(phoneToCheck)) {
      setBookingError('Please enter a valid 10-digit mobile number in the Mobile Number field above.');
      return;
    }
    setBookingError('');
    setShowModal(false);
    setShowPaymentModal(true);
  };

  const handleUsePoints = useCallback(() => {
    const pointsToUse = parseInt(value);

    if (isNaN(pointsToUse) || pointsToUse <= 0) {
      setPointsError('Please enter a valid number of points.');
      return;
    }

    if (pointsToUse > points) {
      setPointsError(`You only have ${points} points available.`);
      return;
    }

    if (pointsToUse > selectedAmount) {
      setPointsError(`You can't use more points than the price. Price is ₹${selectedAmount}.`);
      return;
    }

    const newPoints = points - pointsToUse;
    const totalAmount = selectedAmount - pointsToUse;

    setUsedPoints(pointsToUse);
    setPoints(newPoints);
    setSelectedAmount(totalAmount);
    setValue('');
    setPointsError('');

    //console.log(`Applied ${pointsToUse} points. New price: ₹${totalAmount}`);
  }, [points, selectedAmount, value]);

  const onDateChange = useCallback((event, selectedDate) => {
    const currentDate = selectedDate || new Date();
    setShowDatePicker(Platform.OS === 'ios');
    setSelectedDate(currentDate);
  }, []);

  // UPI Payment Integration
  const initiateUpiPayment = async (upiApp) => {
    //console.log('💳 Initiating UPI Payment:', upiApp);

    const upiId = 'yourbusiness@paytm'; // Replace with your UPI ID
    const name = 'KOVAIS Gym';
    const transactionNote = `Gym-Membership-${Date.now()}`;

    let upiUrl = '';

    switch (upiApp) {
      case 'phonepe':
        upiUrl = `phonepe://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${selectedAmount}&tn=${encodeURIComponent(transactionNote)}&cu=INR`;
        break;

      case 'googlepay':
        upiUrl = `tez://upi/pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${selectedAmount}&tn=${encodeURIComponent(transactionNote)}&cu=INR`;
        break;

      case 'paytm':
        upiUrl = `paytmmp://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${selectedAmount}&tn=${encodeURIComponent(transactionNote)}&cu=INR`;
        break;

      default:
        upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${selectedAmount}&tn=${encodeURIComponent(transactionNote)}&cu=INR`;
    }

    try {
      const supported = await Linking.canOpenURL(upiUrl);

      if (supported) {
        //console.log('✅ Opening UPI app:', upiApp);
        await Linking.openURL(upiUrl);

        setTimeout(() => {
          Alert.alert(
            'Payment Status',
            'Have you completed the payment?',
            [
              {
                text: 'Not Yet',
                style: 'cancel',
                onPress: () => console.log('Payment cancelled by user')
              },
              {
                text: 'Yes, Paid',
                onPress: () => gymRequest('completed', 'online')
              }
            ]
          );
        }, 2000);

      } else {
        //console.log('❌ App not installed:', upiApp);
        Alert.alert(
          'App Not Found',
          `${upiApp.toUpperCase()} is not installed on your device. Please install it or choose another payment method.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      //console.log('❌ Error opening UPI app:', error);
      Alert.alert(
        'Error',
        'Unable to open payment app. Please try another method.',
        [{ text: 'OK' }]
      );
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

      //console.log('Signup successful:', response.data);

      setErrorMessage('');
      setBookingSuccess('Account created successfully! Please sign in with your new account.');

      setTimeout(() => {
        setIsNewUser(false);
        setUserData({
          username: userData.username,
          email: '',
          password: '',
        });
        setBookingSuccess('');
      }, 2000);
    } catch (error) {
      console.error('Signup error:', error.response?.data || error);
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

      //console.log('Login successful:', response.data);

      await authLogin(response.data);
      setPoints(response.data.points || 0);

      setBookingSuccess('Login successful! Welcome back.');

      setTimeout(() => {
        setErrorMessage('');
        setBookingSuccess('');
        setShowLoginModal(false);
        setUserData(prev => ({ ...prev, password: '' }));
      }, 1500);
    } catch (error) {
      console.error('Login error:', error.response?.data || error);
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

  const gymRequest = async (paymentStatus, paymentType) => {
    if (!selectedGender || !selectedAge || !selectedAmount || !selectedTime || !plan) {
      setBookingError('Please select all fields before proceeding.');
      return;
    }

    if (!paymentStatus || !paymentType) {
      setBookingError('Payment information is missing.');
      return;
    }

    setLoading(true);
    setShowPaymentModal(false);

    try {
      const userId = getUserId();
      if (!userId) {
        setBookingError('User not found. Please login again.');
        setShowLoginModal(true);
        return;
      }

      const info = consolidateUserInfo(user);
      const reliablePhone = formData.phone || user?.phone || user?.data?.phone || user?.mobile || user?.data?.mobile || user?.customer_phone || user?.data?.customer_phone || user?.contact || user?.data?.contact || (user?.username && /^\d{10}/.test(user.username) ? user.username.match(/^\d{10}/)[0] : '') || '';

      const payload = {
        // 💎 THE "CATEGORY" IS THE ONLY FIELD THE ADMIN PANEL DISPLAYS ACCURATELY
        // We will stuff EVERYTHING into it to ensure the admin sees it.
        category: `${selectedGender === 'Men' ? 'Gents' : 'Ladies'} | PH: ${reliablePhone} | DT: ${formatDate(selectedDate)} @ ${selectedTime}`, 
        
        services: `Gym Plan: ${plan} | Date: ${formatDate(selectedDate)} | Time: ${selectedTime} | CALL: ${reliablePhone} | Loc: At Gym Studio`,
        service: `Gym Plan: ${plan}`, // Singular redundancy
        amount: selectedAmount,
        date: formatDate(selectedDate),
        time: selectedTime,

        payment_status: 'Completed', // Barber Pattern
        payment_type: paymentType || 'Cash',
        customer_id: userId,
        status: 'booked',
        customer_name: `${user?.username || info.name || 'Guest'} - ${reliablePhone}`,
        phone: reliablePhone,
        points: usedPoints,
        mobile: reliablePhone,
        mobile_no: reliablePhone,
        phone_number: reliablePhone,
        mobile_number: reliablePhone,
        contact: reliablePhone,
        contact_number: reliablePhone,
        customer_phone: reliablePhone,
        customer_mobile: reliablePhone,
        customer_contact: reliablePhone,
        customer_mobile_number: reliablePhone,
        customer_phone_number: reliablePhone,
        registrator_phone: reliablePhone,
        registrator_mobile: reliablePhone,
        logged_phone: reliablePhone,

        // Safety context
        Category: 'gym',
        order_type: 'Gym Membership',
        user_id: userId,
        user: userId,
      };

      //console.log('Booking request:', payload);

      const response = await axios.post(
        'https://api.codingboss.in/kovais/gym/orders/',
        payload
      );

      //console.log('Booking successful:', response.data);

      setBookingSuccess('Membership confirmed! Your membership has been activated.');
      setBookingError('');
      setLoading(false);
      setShowSuccessModal(true); // Replace standard Alert with premium UI

    } catch (error) {
      console.error('Booking error:', error.response?.data || error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Something went wrong! Please try again.';
      setBookingError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePayupi = useCallback(() => {
    handleCloseModal();
    setTimeout(() => {
      gymRequest('completed', 'online');
    }, 300);
  }, [selectedGender, selectedAge, selectedAmount, selectedTime, plan, selectedDate, bookedStatus, usedPoints, user, formData]);

  const handleFreeService = useCallback(() => {
    handleCloseModal();
    setTimeout(() => {
      gymRequest('pending', 'offline');
    }, 300);
  }, [selectedGender, selectedAge, selectedAmount, selectedTime, plan, selectedDate, bookedStatus, usedPoints, user, formData]);

  // Enhanced Payment Modal (from Barber component)
  const renderPaymentModal = () => {
    const paymentMethods = [
      {
        id: 'upi',
        title: 'UPI',
        subtitle: 'Google Pay, PhonePe, Paytm & more',
        icon: '📱',
        type: 'online',
        status: 'completed'
      },
      {
        id: 'card',
        title: 'Credit/Debit Card',
        subtitle: 'Visa, Mastercard, Rupay & more',
        icon: '💳',
        type: 'online',
        status: 'completed'
      },
      {
        id: 'netbanking',
        title: 'Net Banking',
        subtitle: 'All major banks',
        icon: '🏦',
        type: 'online',
        status: 'completed'
      },
      {
        id: 'wallet',
        title: 'Wallets',
        subtitle: 'Paytm, PhonePe, Amazon Pay',
        icon: '👛',
        type: 'online',
        status: 'completed'
      },
      {
        id: 'cod',
        title: 'Cash on Visit',
        subtitle: 'Pay when you visit the gym',
        icon: '💵',
        type: 'offline',
        status: 'pending'
      },
    ];

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showPaymentModal}
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowPaymentModal(false)}
          />
          <View style={styles.paymentModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Payment Method</Text>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.paymentSummary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Amount to Pay:</Text>
                <Text style={styles.summaryAmount}>₹{selectedAmount}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Plan:</Text>
                <Text style={styles.summaryValue}>{plan}</Text>
              </View>
            </View>

            <ScrollView style={styles.paymentMethodsList} showsVerticalScrollIndicator={false}>
              <Text style={styles.paymentSectionTitle}>ONLINE PAYMENT</Text>

              {paymentMethods.filter(m => m.type === 'online').map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.paymentMethodCard,
                    selectedPaymentMethod === method.id && styles.paymentMethodCardSelected
                  ]}
                  onPress={() => setSelectedPaymentMethod(method.id)}
                >
                  <View style={styles.paymentMethodLeft}>
                    <Text style={styles.paymentMethodIcon}>{method.icon}</Text>
                    <View style={styles.paymentMethodInfo}>
                      <Text style={styles.paymentMethodTitle}>{method.title}</Text>
                      <Text style={styles.paymentMethodSubtitle}>{method.subtitle}</Text>
                    </View>
                  </View>
                  <View style={[
                    styles.radioButton,
                    selectedPaymentMethod === method.id && styles.radioButtonSelected
                  ]}>
                    {selectedPaymentMethod === method.id && (
                      <View style={styles.radioButtonInner} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}

              <Text style={[styles.paymentSectionTitle, { marginTop: 20 }]}>OTHER OPTIONS</Text>

              {paymentMethods.filter(m => m.type === 'offline').map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.paymentMethodCard,
                    selectedPaymentMethod === method.id && styles.paymentMethodCardSelected
                  ]}
                  onPress={() => setSelectedPaymentMethod(method.id)}
                >
                  <View style={styles.paymentMethodLeft}>
                    <Text style={styles.paymentMethodIcon}>{method.icon}</Text>
                    <View style={styles.paymentMethodInfo}>
                      <Text style={styles.paymentMethodTitle}>{method.title}</Text>
                      <Text style={styles.paymentMethodSubtitle}>{method.subtitle}</Text>
                    </View>
                  </View>
                  <View style={[
                    styles.radioButton,
                    selectedPaymentMethod === method.id && styles.radioButtonSelected
                  ]}>
                    {selectedPaymentMethod === method.id && (
                      <View style={styles.radioButtonInner} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.paymentModalFooter}>
              <TouchableOpacity
                style={[
                  styles.confirmPaymentButton,
                  !selectedPaymentMethod && styles.buttonDisabled
                ]}
                onPress={() => {
                  if (!selectedPaymentMethod) return;

                  const method = paymentMethods.find(m => m.id === selectedPaymentMethod);
                  //console.log('💳 Payment method selected:', method.title);

                  if (method.id === 'upi') {
                    setShowPaymentModal(false);
                    setShowUpiAppsModal(true);
                  } else if (method.id === 'cod') {
                    gymRequest('pending', 'offline');
                  } else {
                    Alert.alert(
                      'Coming Soon',
                      `${method.title} integration will be available soon. Please use UPI or Cash on Visit for now.`,
                      [{ text: 'OK' }]
                    );
                  }
                }}
                disabled={!selectedPaymentMethod || loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.confirmPaymentButtonText}>
                    {selectedPaymentMethod === 'cod' ? 'Confirm Membership' : `Pay ₹${selectedAmount}`}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // UPI Apps Selection Modal
  const renderUpiAppsModal = () => {
    const upiApps = [
      {
        id: 'phonepe',
        name: 'PhonePe',
        icon: require('../assets/phonepe-icon.png'),
        color: '#f8f9fa' // Added missing color property
      },
      {
        id: 'googlepay',
        name: 'Google Pay',
        icon: require('../assets/google-pay-icon.png'),
        color: '#f8f9fa'
      },
      {
        id: 'paytm',
        name: 'Paytm',
        icon: require('../assets/paytm_icon-icons.com_62778.png'),
        color: '#f8f9fa'
      },
      {
        id: 'other',
        name: 'Other UPI Apps',
        icon: require('../assets/icons8-bhim-48.png'),
        color: '#f8f9fa'
      }
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
                <Text style={styles.summaryAmount}>₹{selectedAmount}</Text>
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
                    <View style={[styles.upiAppIconContainer, { backgroundColor: app.color }]}>
                      <Image source={app.icon} style={{ width: 40, height: 40, borderRadius: 6 }} />
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

  const renderGenderSelection = () => (
    <View style={styles.selectionSection}>
      <Text style={styles.sectionTitle}>Select Your Category</Text>
      <View style={styles.selectionGrid}>
        <TouchableOpacity
          style={[
            styles.selectionCard,
            selectedGender === 'Men' && styles.selectedCard,
          ]}
          onPress={() => setSelectedGender('Men')}>
          <Image
            source={{
              uri: 'https://img.freepik.com/free-photo/handsome-confident-smiling-man-with-hands-hips_176420-18743.jpg',
            }}
            style={styles.selectionImage}
          />
          <Text style={styles.selectionTitle}>Men</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.selectionCard,
            selectedGender === 'Women' && styles.selectedCard,
          ]}
          onPress={() => setSelectedGender('Women')}>
          <Image
            source={{
              uri: 'https://img.freepik.com/premium-photo/girl-red-shirt-stands-front-window-with-sun-shining-through-window_427757-32950.jpg',
            }}
            style={styles.selectionImage}
          />
          <Text style={styles.selectionTitle}>Women</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderAgeSelection = () => (
    <View style={[styles.selectionSection, styles.lightBackground]}>
      <Text style={styles.sectionTitle}>Select Your Age Group</Text>
      <View style={styles.selectionGrid}>
        {['Under 18', 'Above 20', 'Above 30'].map(age => (
          <TouchableOpacity
            key={age}
            style={[
              styles.selectionCard,
              selectedAge === age && styles.selectedCard,
            ]}
            onPress={() => setSelectedAge(age)}>
            <Image
              source={{
                uri:
                  age === 'Under 18'
                    ? 'https://img.freepik.com/free-photo/children-sport_23-2148108576.jpg'
                    : age === 'Above 20'
                      ? 'https://img.freepik.com/free-photo/medium-shot-people-training-with-kettlebells_23-2149307721.jpg'
                      : 'https://img.freepik.com/free-photo/group-happy-people-standing-against-wall-gym_23-2147949689.jpg',
              }}
              style={styles.selectionImage}
            />
            <Text style={styles.selectionTitle}>{age}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderDateTimeSelection = () => (
    <View style={styles.dateTimeSection}>
      <Text style={styles.sectionTitle}>Choose Your Schedule</Text>

      <TouchableOpacity
        style={styles.datePickerButton}
        onPress={() => setShowDatePicker(true)}>
        <CalendarIcon size={20} color="#93BFC7" />
        <Text style={styles.datePickerText}>
          {selectedDate ? selectedDate.toLocaleDateString() : 'Select a date'}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={selectedDate}
          mode="date"
          is24Hour={true}
          display="default"
          onChange={onDateChange}
          minimumDate={new Date()}
        />
      )}

      <Text style={styles.timeSlotsTitle}>Available Time Slots</Text>
      <View style={styles.timeSlotsGrid}>
        {timeSlots.map(slot => {
          const disabled = isSlotBooked(slot) || isPastSlot(slot);
          return (
            <TouchableOpacity
              key={slot}
              style={[
                styles.timeSlot,
                disabled && styles.timeSlotDisabled,
                selectedTime === slot && styles.timeSlotSelected,
              ]}
              onPress={() => handleSelectSlot(slot)}
              disabled={disabled}>
              <Clock
                size={16}
                color={
                  disabled ? '#999' : selectedTime === slot ? '#fff' : '#93BFC7'
                }
              />
              <Text
                style={[
                  styles.timeSlotText,
                  disabled && styles.timeSlotTextDisabled,
                  selectedTime === slot && styles.timeSlotTextSelected,
                ]}>
                {slot}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderMembershipPlans = () => (
    <View style={[styles.membershipSection, styles.lightBackground]}>
      <Text style={styles.sectionTitle}>Choose Your Membership Plan</Text>

      <View style={styles.plansGrid}>
        {membershipPlans.map((planItem, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.planCard,
              selectedAmount === planItem.amount && styles.selectedPlanCard,
              planItem.popular && styles.popularPlan,
            ]}
            onPress={() => handlePlanClick(planItem.amount, planItem.duration)}>
            {planItem.popular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularBadgeText}>BEST VALUE</Text>
              </View>
            )}

            <Trophy size={30} color="#ABE7B2" />
            <Text style={styles.planTitle}>{planItem.title}</Text>
            <Text style={styles.planPrice}>₹{planItem.amount}</Text>
            <Text style={styles.planDuration}>
              / {planItem.duration.split(' /')[1]}
            </Text>

            {planItem.savings && (
              <View style={styles.savingsBadge}>
                <Text style={styles.savingsText}>{planItem.savings}</Text>
              </View>
            )}

            <View style={styles.planFeatures}>
              <Text style={styles.featureText}>
                ✓ Access to all gym facilities
              </Text>
              <Text style={styles.featureText}>✓ Unlimited group classes</Text>
              <Text style={styles.featureText}>✓ Locker facility</Text>
              <Text style={styles.featureText}>✓ Free Wi-Fi</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderCTA = () => (
    <View style={styles.ctaSection}>
      <Text style={styles.ctaTitle}>Ready to Transform Your Life?</Text>
      <Text style={styles.ctaSubtitle}>
        Join hundreds of satisfied members who have achieved their fitness goals
        at KOVAIS Gym.
      </Text>
      <TouchableOpacity
        style={[styles.ctaButton, !isProceedEnabled && styles.disabledButton]}
        onPress={handlePayment}
        disabled={!isProceedEnabled}>
        <Text style={styles.ctaButtonText}>
          {isProceedEnabled ? 'Proceed to Join' : 'Complete Selection Above'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const LoginModal = useMemo(
    () => (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showLoginModal}
        onRequestClose={() => setShowLoginModal(false)}
        hardwareAccelerated={true}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowLoginModal(false)}
          />
          <View style={styles.modalWrapper}>
            <View style={styles.loginModalContentFixed}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Join Kovai's Gym</Text>
                <TouchableOpacity onPress={() => setShowLoginModal(false)}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[styles.tab, !isNewUser && styles.activeTab]}
                  onPress={() => {
                    setIsNewUser(false);
                    setErrorMessage('');
                    setBookingSuccess('');
                  }}>
                  <Text
                    style={[
                      styles.tabText,
                      !isNewUser && styles.activeTabText,
                    ]}>
                    Login
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tab, isNewUser && styles.activeTab]}
                  onPress={() => {
                    setIsNewUser(true);
                    setErrorMessage('');
                    setBookingSuccess('');
                  }}>
                  <Text
                    style={[styles.tabText, isNewUser && styles.activeTabText]}>
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.loginScrollContent}
                showsVerticalScrollIndicator={false}
                bounces={false}
                keyboardShouldPersistTaps="handled">
                <View style={styles.form}>
                  {bookingSuccess ? (
                    <View style={styles.successMessageContainer}>
                      <CheckCircle size={20} color="#28a745" />
                      <Text style={styles.successMessageText}>{bookingSuccess}</Text>
                    </View>
                  ) : null}

                  {errorMessage ? (
                    <View style={styles.errorMessageContainer}>
                      <AlertCircle size={20} color="#dc3545" />
                      <Text style={styles.errorMessageText}>{errorMessage}</Text>
                    </View>
                  ) : null}

                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="Mobile Number / Username"
                      placeholderTextColor="#b0aeaeff"
                      value={userData.username}
                      onChangeText={text =>
                        setUserData({ ...userData, username: text })
                      }
                    />
                  </View>

                  {isNewUser && (
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.input}
                        placeholder="Email address"
                        placeholderTextColor="#b0aeaeff"
                        value={userData.email}
                        onChangeText={text =>
                          setUserData({ ...userData, email: text })
                        }
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                    </View>
                  )}

                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="Password"
                      placeholderTextColor="#b0aeaeff"
                      value={userData.password}
                      onChangeText={text =>
                        setUserData({ ...userData, password: text })
                      }
                      secureTextEntry={!showPassword}
                    />
                      <TouchableOpacity
                        style={styles.passwordToggle}
                        onPress={() => setShowPassword(!showPassword)}>
                        {showPassword ? (
                          <EyeOff size={20} color="#666" />
                        ) : (
                          <Eye size={20} color="#666" />
                        )}
                      </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.authButton,
                      loading && styles.disabledButton,
                    ]}
                    onPress={isNewUser ? signUp : loginUser}
                    disabled={loading}>
                    {loading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.authButtonText}>
                        {isNewUser ? 'Create Account' : 'Login'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>
    ),
    [showLoginModal, isNewUser, userData, errorMessage, bookingSuccess, loading, showPassword],
  );

  const renderSuccessModal = () => (
    <Modal visible={showSuccessModal} transparent animationType="fade">
      <View style={styles.successOverlay}>
        <Animatable.View animation="zoomIn" duration={500} style={styles.successCard}>
          <LinearGradient colors={['#348f9f', '#2a7a88']} style={styles.successIconContainer}>
            <CheckCircle size={50} color="#FFFFFF" strokeWidth={3} />
          </LinearGradient>
          
          <Text style={styles.successTitle}>Booking Confirmed!</Text>
          <Text style={styles.successSubtitle}>Welcome to Kovais Gym family</Text>
          
          <View style={styles.successDetailsCard}>
            <View style={styles.successDetailRow}>
              <Text style={styles.successDetailLabel}>Membership:</Text>
              <Text style={styles.successDetailValue}>{plan}</Text>
            </View>
            <View style={styles.successDetailRow}>
              <Text style={styles.successDetailLabel}>Amount Paid:</Text>
              <Text style={styles.successDetailAmount}>₹{selectedAmount}</Text>
            </View>
            <View style={styles.successDetailRow}>
              <Text style={styles.successDetailLabel}>Booking Date:</Text>
              <Text style={styles.successDetailValue}>{formatDate(selectedDate)}</Text>
            </View>
            <View style={styles.successDetailRow}>
              <Text style={styles.successDetailLabel}>Start Time:</Text>
              <Text style={styles.successDetailValue}>{selectedTime}</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.successFinishBtn}
            onPress={() => {
              setShowSuccessModal(false);
              setSelectedGender('');
              setSelectedAge('');
              setSelectedAmount('');
              setSelectedTime('');
              setPlan('');
              setUsedPoints(0);
              setSelectedPaymentMethod(null);
              setBookingSuccess('');
            }}
          >
            <LinearGradient colors={['#348f9f', '#2a7a88']} style={styles.successFinishGradient}>
              <Text style={styles.successFinishText}>GET STARTED</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animatable.View>
      </View>
    </Modal>
  );

  const renderBookingDetailsModal = () => (
    <Modal visible={showModal} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setShowModal(false)} />
        <View style={styles.paymentModalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>CONFIRM BOOKING</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ padding: 20 }}>
            <View style={styles.paymentSummary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Plan Selected:</Text>
                <Text style={styles.summaryValue}>{plan}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Price:</Text>
                <Text style={styles.summaryAmount}>₹{selectedAmount}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Time Slot:</Text>
                <Text style={styles.summaryValue}>{selectedTime}</Text>
              </View>
            </View>

            <View style={{ marginTop: 20 }}>
              <Text style={styles.sectionTitle}>CONFIRM CONTACT DETAILS</Text>
              <View style={styles.inputContainer}>
                <Text style={[styles.summaryLabel, { marginBottom: 8 }]}>MOBILE NUMBER</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: '#F8FAFC' }]}
                  placeholder="Enter 10-digit mobile number"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  maxLength={10}
                  value={formData.phone}
                  onChangeText={(text) => setFormData({ ...formData, phone: text })}
                />
              </View>
            </View>
            
            {bookingError ? <Text style={{ color: '#dc3545', textAlign: 'center', marginTop: 10 }}>{bookingError}</Text> : null}
          </ScrollView>

          <View style={styles.paymentModalFooter}>
            <TouchableOpacity
              style={styles.confirmPaymentButton}
              onPress={handleProceedToPayment}
            >
              <Text style={styles.confirmPaymentButtonText}>PROCEED TO PAYMENT</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Standardized Modern Header */}
      <View style={[styles.modernHeader, { paddingTop: insets.top, height: 60 + insets.top }]}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <ArrowLeft size={24} color="#348f9f" />
        </TouchableOpacity>
        <Text style={styles.modernHeaderTitle}>KOVAIS Gym</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        {renderGenderSelection()}
        {renderAgeSelection()}
        {renderDateTimeSelection()}
        {renderMembershipPlans()}
        {renderCTA()}
      </ScrollView>

      {renderBookingDetailsModal()}
      {renderPaymentModal()}
      {renderUpiAppsModal()}
      {renderSuccessModal()}
      {LoginModal}
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
  modernHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1.5,
    borderBottomColor: '#348f9f',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modernHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#348f9f',
  },
  selectionSection: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#348f9f',
    marginBottom: 20,
  },
  selectionGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  selectionCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#F2F2F7',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  selectedCard: {
    borderColor: '#348f9f',
    backgroundColor: '#EAF6F8',
  },
  selectionImage: {
    width: '100%',
    height: 120,
  },
  selectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    padding: 12,
    color: '#1C1C1E',
  },
  dateTimeSection: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#348f9f',
    marginBottom: 25,
  },
  datePickerText: {
    fontSize: 15,
    marginLeft: 12,
    color: '#1C1C1E',
    fontWeight: '600',
  },
  timeSlotsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 15,
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeSlot: {
    width: (width - 60) / 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    gap: 6,
  },
  timeSlotSelected: {
    backgroundColor: '#EAF6F8',
    borderColor: '#348f9f',
  },
  timeSlotDisabled: {
    opacity: 0.4,
    backgroundColor: '#FAFAFA',
  },
  timeSlotText: {
    fontSize: 13,
    color: '#1C1C1E',
    fontWeight: '600',
  },
  timeSlotTextSelected: {
    color: '#348f9f',
    fontWeight: '700',
  },
  membershipSection: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  plansGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  planCard: {
    width: (width - 52) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    marginBottom: 12,
    shadowColor: '#348f9f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  selectedPlanCard: {
    borderColor: '#348f9f',
    backgroundColor: '#EAF6F8',
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1C1E',
    marginTop: 12,
  },
  planPrice: {
    fontSize: 22,
    fontWeight: '900',
    color: '#348f9f',
    marginTop: 6,
  },
  planDuration: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '600',
  },
  planFeatures: {
    marginTop: 15,
    gap: 6,
  },
  featureText: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '500',
  },
  ctaSection: {
    padding: 30,
    alignItems: 'center',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  ctaTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#348f9f',
    textAlign: 'center',
    marginBottom: 10,
  },
  ctaSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 25,
  },
  ctaButton: {
    backgroundColor: '#348f9f',
    paddingVertical: 16,
    paddingHorizontal: 35,
    borderRadius: 15,
    shadowColor: '#348f9f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  // Modal & Payment Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  paymentModalContent: {
    height: MODAL_HEIGHT,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1C1C1E',
  },
  closeButton: {
    fontSize: 24,
    color: '#8E8E93',
  },
  paymentSummary: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '600',
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: '900',
    color: '#34C759',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1C1C1E',
    fontWeight: '700',
  },
  paymentMethodsList: {
    flex: 1,
    padding: 20,
  },
  paymentSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8E8E93',
    marginBottom: 15,
    letterSpacing: 1,
  },
  paymentMethodCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: '#F2F2F7',
    marginBottom: 12,
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
    fontSize: 28,
    marginRight: 15,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  paymentMethodSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
  },
  radioButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#348f9f',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#348f9f',
  },
  paymentModalFooter: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  confirmPaymentButton: {
    backgroundColor: '#34C759',
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
  },
  confirmPaymentButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
  },
  upiAppsModalContent: {
    height: height * 0.6,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  upiAppsList: {
    flex: 1,
    padding: 20,
  },
  upiAppCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: '#F2F2F7',
    marginBottom: 12,
  },
  upiAppLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  upiAppIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 10,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  upiAppName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  upiAppArrow: {
    fontSize: 24,
    color: '#C7C7CC',
  },
  upiAppsFooter: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  upiAppsFooterText: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 18,
  },
  // Auth Modal Styles
  loginModalContent: {
    height: LOGIN_MODAL_HEIGHT,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#348f9f',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
  },
  activeTabText: {
    color: '#348f9f',
    fontWeight: '800',
  },
  form: {
    padding: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#F2F2F7',
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1C1C1E',
  },
  passwordToggle: {
    padding: 5,
  },
  authButton: {
    backgroundColor: '#348f9f',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#348f9f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  authButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  lightBackground: {
    backgroundColor: '#F8F9FA',
  },
  popularBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#348f9f',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  popularBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  savingsBadge: {
    backgroundColor: '#EAF6F8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  savingsText: {
    color: '#348f9f',
    fontSize: 11,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.5,
  },
  timeSlotTextDisabled: {
    color: '#999',
  },
  popularPlan: {
    borderColor: '#348f9f',
  },
  // Success Modal Styles
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  successIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#348f9f',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1C1C1E',
    marginBottom: 10,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    color: '#348f9f',
    fontWeight: '600',
    marginBottom: 25,
    textAlign: 'center',
  },
  successDetailsCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  successDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  successDetailLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  successDetailValue: {
    fontSize: 15,
    color: '#1C1C1E',
    fontWeight: '700',
  },
  successDetailAmount: {
    fontSize: 18,
    color: '#34C759',
    fontWeight: '900',
  },
  successFinishBtn: {
    width: '100%',
    borderRadius: 15,
    overflow: 'hidden',
  },
  successFinishGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successFinishText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
});

export default Gym;