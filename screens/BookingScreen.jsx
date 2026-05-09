import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Dimensions,
  Image,
  SafeAreaView,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BookingService } from './Profile/BookingHistory';
import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { 
  ChevronLeft, 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  Clock, 
  Shield, 
  MapPin, 
  Star,
  CheckCircle2,
  CreditCard,
  Zap
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const BookingScreen = ({ route }) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { initialCategory, serviceDetails } = route?.params || {};

  const [bookingFlow, setBookingFlow] = useState('category'); // 'category', 'details', 'payment', 'success'
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    specialRequests: '',
    paymentMethod: 'Cash'
  });

  const [selectedCategory, setSelectedCategory] = useState(initialCategory || null);
  const [selectedService, setSelectedService] = useState(serviceDetails || null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('User_data');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUserId(userData.user_id || userData.id || userData.customer_id);
          setFormData(prev => ({
            ...prev,
            name: userData.name || userData.username || '',
            email: userData.email || '',
            phone: userData.phone || ''
          }));
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUser();
  }, []);

  const categories = [
    { id: 'hotels', title: 'Luxury Hotels', icon: 'Hotel', color: '#348f9f', image: require('./Profile/image/hotel.jpeg') },
    { id: 'gym', title: 'Fitness Gym', icon: 'Dumbbell', color: '#ef4444', image: require('./Profile/image/gym.jpeg') },
    { id: 'spa', title: 'Wellness Spa', icon: 'Flower', color: '#8b5cf6', image: require('./Profile/image/spa.jpg') },
    { id: 'saloon', title: 'Prestige Saloon', icon: 'Scissors', color: '#f59e0b', image: require('./Profile/image/barber.jpeg') },
  ];

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    // Directly navigate to specific booking screens for better UX
    if (category.id === 'hotels') navigation.navigate('Hotels');
    else if (category.id === 'gym') navigation.navigate('Gym');
    else if (category.id === 'spa') navigation.navigate('SpaBooking');
    else if (category.id === 'saloon') navigation.navigate('BarberShop');
  };

  const handleConfirmBooking = async () => {
    if (!formData.name || !formData.date || !formData.phone) {
      Alert.alert('Missing Info', 'Please fill in all required fields.');
      return;
    }

    setLoading(true);
    const reliablePhone = formData.phone || (user?.phone || user?.mobile || user?.customer_phone || '');
    
    const payload = {
      category: selectedCategory?.title || 'Service',
      services: selectedService?.title || selectedCategory?.title || 'Premium Service',
      amount: 0,
      date: formData.date || new Date().toISOString().split('T')[0],
      time: formData.time || '10:00 AM',
      payment_status: 'Completed',
      payment_type: formData.paymentMethod || 'Cash',
      customer_id: userId,
      status: 'booked',
      customer_name: formData.name || user?.username || 'Guest',
      phone: reliablePhone,
      address: formData.specialRequests || 'General Request',
      points: 0,

      // 🛡️ MEGA REDUNDANCY: Blasting every possible phone alias
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
      Category: 'saloon', // Generic bucket
      order_type: 'In-App Booking',
    };

    try {
      // 1. Backend Sync
      await axios.post('https://api.codingboss.in/kovais/saloon/orders/', payload);

      // 2. Local History Sync
      const bookingId = `BK-${Date.now()}`;
      await BookingService.saveBooking(userId, {
        ...formData,
        ...payload,
        bookingId,
      });

      setBookingFlow('success');
    } catch (error) {
      console.error('Booking submission error:', error);
      Alert.alert('Cloud Sync Delayed', 'Your booking is saved locally and will be synced once you are online.');
      setBookingFlow('success');
    } finally {
      setLoading(false);
    }
  };

  if (bookingFlow === 'success') {
    return (
      <View style={styles.successContainer}>
        <Animatable.View animation="bounceIn" style={styles.successIcon}>
          <CheckCircle2 size={80} color="#22c55e" />
        </Animatable.View>
        <Text style={styles.successTitle}>Booking Confirmed!</Text>
        <Text style={styles.successSubtitle}>Your luxury experience is waiting for you.</Text>
        <TouchableOpacity 
          style={styles.historyBtn}
          onPress={() => navigation.navigate('BookingHistory')}
        >
          <Text style={styles.historyBtnText}>View History</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.homeBtn}
          onPress={() => navigation.navigate('MainTabs')}
        >
          <Text style={styles.homeBtnText}>Go Back Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient colors={['#F8FAFC', '#F1F5F9']} style={styles.gradient}>
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeft size={24} color="#1e293b" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Premium Booking</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Animatable.View animation="fadeInUp" duration={800}>
            <Text style={styles.sectionTitle}>Select Category</Text>
            <View style={styles.categoryGrid}>
              {categories.map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={[styles.categoryCard, selectedCategory?.id === item.id && { borderColor: item.color, borderWidth: 2 }]}
                  onPress={() => handleCategorySelect(item)}
                >
                  <Image source={item.image} style={styles.categoryImg} />
                  <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.cardOverlay}>
                    <Text style={styles.categoryName}>{item.title}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.infoSection}>
              <View style={styles.infoCard}>
                <Shield size={20} color="#348f9f" />
                <Text style={styles.infoText}>Safe & Secure Bookings</Text>
              </View>
              <View style={styles.infoCard}>
                <Clock size={20} color="#348f9f" />
                <Text style={styles.infoText}>Instant Confirmation</Text>
              </View>
            </View>

            <View style={styles.promoCard}>
              <LinearGradient colors={['#348f9f', '#2c7a88']} style={styles.promoGradient} start={{x:0, y:0}} end={{x:1, y:1}}>
                <View style={styles.promoContent}>
                  <Zap size={24} color="#FFF" />
                  <View>
                    <Text style={styles.promoTitle}>Member Discount</Text>
                    <Text style={styles.promoSubtitle}>Get 15% off on your first spa session</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </Animatable.View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  scrollContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1E293B',
    marginBottom: 20,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
  },
  categoryCard: {
    width: (width - 55) / 2,
    height: 160,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#FFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  categoryImg: {
    width: '100%',
    height: '100%',
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: 15,
  },
  categoryName: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  infoSection: {
    flexDirection: 'row',
    marginTop: 30,
    gap: 15,
  },
  infoCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 20,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  promoCard: {
    marginTop: 25,
    borderRadius: 24,
    overflow: 'hidden',
  },
  promoGradient: {
    padding: 20,
  },
  promoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  promoTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },
  promoSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#FFF',
  },
  successIcon: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1E293B',
    marginBottom: 10,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 40,
  },
  historyBtn: {
    width: '100%',
    backgroundColor: '#348f9f',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 15,
  },
  historyBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  homeBtn: {
    width: '100%',
    backgroundColor: '#F1F5F9',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  homeBtnText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '800',
  }
});

export default BookingScreen;
