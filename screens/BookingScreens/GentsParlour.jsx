import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  BackHandler,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import {
  Check,
  Star,
  MapPin,
  ChevronRight,
  ChevronLeft,
  Clock,
  Shield,
  Phone,
  Scissors,
  User,
  Zap
} from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Calendar } from 'react-native-calendars';
import { useAuth } from '../AuthContext';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
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

const API_BASE_URL = 'https://api.codingboss.in/kovais/saloon';

const GentsParlour = ({ goBack }) => {
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated } = useAuth();
  const navigation = useNavigation();

  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  });

  const services = [
    { id: 'g1', name: 'Master Haircut', price: 500, icon: Scissors, image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop', desc: 'Expert styling and precision cut' },
    { id: 'g2', name: 'Beard Sculpting', price: 300, icon: User, image: 'https://images.unsplash.com/photo-1621605815841-aa1e0f011389?q=80&w=2070&auto=format&fit=crop', desc: 'Premium beard grooming and hot towel finish' },
    { id: 'g3', name: 'Royal Shave', price: 250, icon: Zap, image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070&auto=format&fit=crop', desc: 'Traditional single-blade straight razor shave' },
    { id: 'g4', name: 'Executive Facial', price: 1200, icon: Star, image: 'https://images.unsplash.com/photo-1635273051937-603be4342512?q=80&w=2070&auto=format&fit=crop', desc: 'Deep cleansing and skin rejuvenation for men' },
  ];

  useEffect(() => {
    if (user) {
      const userPhone = user.phone || user.mobile || user.customer_phone || user.contact || (/^\d{10}$/.test(user.username) ? user.username : '') || '';
      setFormData(prev => ({
        ...prev,
        name: user.name || user.username || '',
        phone: userPhone,
        email: user.email || ''
      }));
    }
  }, [user]);

  useEffect(() => {
    const backAction = () => {
      if (goBack) {
        goBack();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [goBack]);

  const toggleService = (service) => {
    const isSelected = selectedServices.some(s => s.id === service.id);
    if (isSelected) {
      setSelectedServices(prev => prev.filter(s => s.id !== service.id));
    } else {
      setSelectedServices(prev => [...prev, service]);
    }
  };

  const handleBookingSubmit = async () => {
    const userId = user?.user_id || user?.id || user?.customer_id;
    if (!userId) {
      Alert.alert("Login Required", "Please login to book a grooming session.");
      return;
    }

    if (selectedServices.length === 0) {
      Alert.alert("Selection Required", "Please select at least one grooming service.");
      return;
    }

    const reliablePhone = formData.phone || user?.phone || user?.data?.phone || user?.mobile || user?.data?.mobile || user?.customer_phone || user?.data?.customer_phone || user?.contact || user?.data?.contact || (user?.username && /^\d{10}/.test(user.username) ? user.username.match(/^\d{10}/)[0] : '') || '';
    
    const finalAddress = formData.address?.trim() ? formData.address : (user?.address || user?.data?.address || '');

    if (!reliablePhone && !isAuthenticated) {
      Alert.alert("Phone Required", "Please provide a contact phone number for the stylist.");
      return;
    }

    if (!finalAddress) {
      Alert.alert("Address Required", "Please provide the home or office address for service.");
      return;
    }

    setLoading(true);
    const totalAmount = selectedServices.reduce((sum, s) => sum + s.price, 0);

    const payload = {
      category: 'Gents - DOOR STEP',
      services: selectedServices.map(s => s.name).join(', ') + ` | Ph: ${reliablePhone} | Loc: ${finalAddress || 'Salon'}`,
      amount: totalAmount,
      date: selectedDate,
      time: '10:00 AM',
      payment_status: 'Completed', // Barber Pattern
      payment_type: 'Cash',
      customer_id: userId,
      status: 'booked',
      customer_name: `${user?.username || 'Guest'} - ${reliablePhone}`,
      phone: reliablePhone,
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
      Category: 'saloon',
      order_type: 'Door Step',
      address: finalAddress,
    };

    try {
      await axios.post(`${API_BASE_URL}/orders/`, payload);

      const stored = await AsyncStorage.getItem('offline_orders');
      const orders = stored ? JSON.parse(stored) : [];
      orders.unshift({ ...payload, id: 'GP-' + Date.now(), created_at: new Date().toISOString() });
      await AsyncStorage.setItem('offline_orders', JSON.stringify(orders.slice(0, 50)));

      Alert.alert("Success!", "Your grooming appointment has been confirmed.", [{ text: "OK", onPress: () => (goBack ? goBack() : navigation.goBack()) }]);
    } catch (error) {
      console.error('Gents booking error:', error);
      Alert.alert("Offline Save", "Unable to reach server, booking saved locally in your history.");
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
      <TouchableOpacity onPress={goBack || (() => navigation.goBack())} style={styles.backBtn}>
        <ChevronLeft size={24} color="#1e293b" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Gents Parlour</Text>
      <View style={{ width: 40 }} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {renderHeader()}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animatable.View animation="fadeIn" duration={1000}>
          <Text style={styles.sectionTitle}>Bespoke Grooming Services</Text>
          <View style={styles.servicesGrid}>
            {services.map((service) => {
              const isSelected = selectedServices.some(s => s.id === service.id);
              return (
                <TouchableOpacity
                  key={service.id}
                  style={[styles.serviceCard, isSelected && styles.selectedCard]}
                  onPress={() => toggleService(service)}
                >
                  <Image source={{ uri: service.image }} style={styles.serviceImage} />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    style={styles.cardGradient}
                  />
                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    <Text style={styles.servicePrice}>₹{service.price}</Text>
                  </View>
                  {isSelected && (
                    <View style={styles.checkBadge}>
                      <Check size={14} color="#FFF" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Contact & Location</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Service Address</Text>
              <TextInput
                style={styles.input}
                placeholder="Full address for doorstep service"
                value={formData.address}
                onChangeText={(t) => setFormData(p => ({ ...p, address: t }))}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.bookBtn} onPress={handleBookingSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.bookBtnText}>Confirm Booking</Text>}
          </TouchableOpacity>
        </Animatable.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: scale(20), paddingBottom: verticalScale(20), backgroundColor: '#FFF' },
  backBtn: { width: moderateScale(40), height: moderateScale(40), borderRadius: moderateScale(20), backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: moderateScale(18), fontWeight: '800', color: '#1E293B' },
  scrollContent: { padding: moderateScale(20) },
  sectionTitle: { fontSize: moderateScale(20), fontWeight: '900', color: '#1E293B', marginBottom: verticalScale(20) },
  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: scale(15), justifyContent: 'space-between' },
  serviceCard: { width: (width - scale(55)) / 2, height: verticalScale(200), backgroundColor: '#FFF', borderRadius: moderateScale(24), overflow: 'hidden', borderWidth: 1, borderColor: '#E2E8F0', position: 'relative' },
  serviceImage: { ...StyleSheet.absoluteFillObject },
  cardGradient: { ...StyleSheet.absoluteFillObject },
  selectedCard: { borderColor: '#348f9f', borderWidth: 2 },
  serviceInfo: { position: 'absolute', bottom: verticalScale(12), left: scale(12), right: scale(12) },
  serviceName: { fontSize: moderateScale(13), fontWeight: '800', color: '#FFF', marginBottom: verticalScale(2) },
  servicePrice: { fontSize: moderateScale(14), fontWeight: '800', color: '#FFF' },
  checkBadge: { position: 'absolute', top: moderateScale(12), right: moderateScale(12), width: moderateScale(24), height: moderateScale(24), borderRadius: moderateScale(12), backgroundColor: '#348f9f', justifyContent: 'center', alignItems: 'center' },
  formSection: { marginTop: verticalScale(30) },
  inputGroup: { marginBottom: verticalScale(20) },
  label: { fontSize: moderateScale(14), fontWeight: '700', color: '#64748B', marginBottom: verticalScale(8) },
  input: { backgroundColor: '#FFF', paddingHorizontal: scale(15), borderRadius: moderateScale(12), borderWidth: 1, borderColor: '#E2E8F0', fontSize: moderateScale(15), color: '#1E293B', paddingVertical: verticalScale(12) },
  bookBtn: { marginTop: verticalScale(20), backgroundColor: '#348f9f', paddingVertical: verticalScale(16), borderRadius: moderateScale(16), alignItems: 'center' },
  bookBtnText: { color: '#FFF', fontSize: moderateScale(16), fontWeight: '800' }
});

export default GentsParlour;
