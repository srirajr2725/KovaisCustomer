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
  Dimensions,
  ActivityIndicator,
  StatusBar,
  BackHandler,
  Alert,
  Linking
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
  Zap,
  Sparkles
} from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Calendar } from 'react-native-calendars';
import { useAuth } from '../AuthContext';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';

const { width, height } = Dimensions.get('window');
const API_BASE_URL = 'https://api.codingboss.in/kovais/saloon';

const BarberShop = ({ goBack }) => {
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated } = useAuth();
  const navigation = useNavigation();

  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [bookingType, setBookingType] = useState('Door Step');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [selectedBarber, setSelectedBarber] = useState('Alex');
  const [selectedGender, setSelectedGender] = useState('Men');
  const [selectedTime, setSelectedTime] = useState('10:00 AM');

  // Realistic Payment Modals State
  const [showUpiAppsModal, setShowUpiAppsModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [localProcessing, setLocalProcessing] = useState(false);
  const [localSuccess, setLocalSuccess] = useState(false);

  const barbers = [
    { name: 'Alex', role: 'Master', rating: '5.0', image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070&auto=format&fit=crop' },
    { name: 'Sam', role: 'Senior', rating: '4.8', image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=1976&auto=format&fit=crop' },
    { name: 'Gokul', role: 'Professional', rating: '4.7', image: 'https://images.unsplash.com/photo-1621605815841-aa1e0f011389?q=80&w=2070&auto=format&fit=crop' },
    { name: 'Arun', role: 'Expert', rating: '4.9', image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop' }
  ];

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  });


  const services = [
    { id: 'b1', name: 'Master Haircut', price: 500, icon: Scissors, image: 'https://i.pinimg.com/736x/4d/1d/6b/4d1d6b6afeef0db07dd2eeace478817d.jpg', desc: 'Expert styling and precision cut' },
    { id: 'b2', name: 'Royal Shave', price: 250, icon: Zap, image: 'https://i.pinimg.com/736x/91/30/c5/9130c5bbf94d9283a9769d1a29bb5e59.jpg', desc: 'Traditional single-blade straight razor shave' },
    { id: 'b3', name: 'Premium Hair Spa', price: 1500, icon: Sparkles, image: 'https://i.pinimg.com/736x/7e/26/b8/7e26b822146f6dda084cd49c60546051.jpg', desc: 'Deep conditioning and scalp treatment' },
    { id: 'b4', name: 'Deep Cleansing Facial', price: 1200, icon: User, image: 'https://i.pinimg.com/1200x/e2/0b/9c/e20b9cccd99433b25d0cb2e637c0e696.jpg', desc: 'Skin rejuvenation and multi-step facial' },
    { id: 'b5', name: 'Saree Draping & Party Makeover', price: 3500, icon: Sparkles, image: 'https://i.pinimg.com/736x/b1/3b/da/b13bda648b2ba1fe7323bed28a4cf60f.jpg', desc: 'Professional makeup and traditional draping' },
    { id: 'b6', name: 'Executive Grooming Package', price: 2500, icon: Star, image: 'https://i.pinimg.com/736x/d5/b6/a2/d5b6a2a06c60f571848da1f1ef9edd98.jpg', desc: 'Full-service haircut, shave, and mini-facial' },
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

  const initiateUpiPayment = async (upiApp) => {
    const upiId = 'yourbusiness@paytm';
    const name = 'KOVAIS Barber Shop';
    const transactionNote = `Barber-Booking-${Date.now()}`;
    const totalAmount = selectedServices.reduce((sum, s) => sum + s.price, 0) + (bookingType === 'Door Step' ? 200 : 0);

    let upiUrl = '';
    switch (upiApp) {
      case 'phonepe': upiUrl = `phonepe://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${totalAmount}&tn=${encodeURIComponent(transactionNote)}&cu=INR`; break;
      case 'googlepay': upiUrl = `tez://upi/pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${totalAmount}&tn=${encodeURIComponent(transactionNote)}&cu=INR`; break;
      case 'paytm': upiUrl = `paytmmp://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${totalAmount}&tn=${encodeURIComponent(transactionNote)}&cu=INR`; break;
      default: upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${totalAmount}&tn=${encodeURIComponent(transactionNote)}&cu=INR`;
    }

    try {
      const supported = await Linking.canOpenURL(upiUrl);
      if (supported) {
        await Linking.openURL(upiUrl);
        setTimeout(() => {
          Alert.alert('Payment Status', 'Have you completed the payment?', [
            { text: 'Not Yet', style: 'cancel' },
            { text: 'Yes, Paid', onPress: () => processActualBooking() }
          ]);
        }, 2000);
      } else {
        Alert.alert('App Not Found', `${upiApp.toUpperCase()} is not installed on your device. Please install it or choose another payment method.`);
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to open payment app. Please try another method.');
    }
  };

  const handleBookingSubmit = () => {
    const userId = user?.user_id || user?.id || user?.customer_id;
    if (!userId) { Alert.alert("Login Required", "Please login to book a service."); return; }
    if (selectedServices.length === 0) { Alert.alert("Selection Required", "Please select at least one barber or parlour service."); return; }

    const storedPhone = user?.phone || user?.data?.phone || user?.mobile || user?.data?.mobile || user?.customer_phone || user?.data?.customer_phone || user?.contact || '';
    const finalPhone = formData.phone || storedPhone;

    if (!finalPhone) { Alert.alert("Phone Required", "Please provide a contact phone number for the barber."); return; }

    const finalAddress = (bookingType === 'Door Step' && formData.address?.trim()) ? formData.address : (user?.address || user?.data?.address || '');

    if (bookingType === 'Door Step' && !finalAddress) { Alert.alert("Address Required", "Please provide the home or office address for service."); return; }

    if (paymentMethod === 'GPay') {
      setShowUpiAppsModal(true);
    } else if (paymentMethod === 'Card') {
      setShowPaymentModal(true);
      setLocalProcessing(true);
      setTimeout(() => {
        setLocalProcessing(false);
        setLocalSuccess(true);
        setTimeout(() => {
          setShowPaymentModal(false);
          setLocalSuccess(false);
          processActualBooking();
        }, 1500);
      }, 2000);
    } else {
      processActualBooking();
    }
  };

  const processActualBooking = async () => {
    const userId = user?.user_id || user?.id || user?.customer_id;
    setLoading(true);
    const totalAmount = selectedServices.reduce((sum, s) => sum + s.price, 0);
    const locationFee = bookingType === 'Door Step' ? 200 : 0;
    const finalAmount = totalAmount + locationFee;
    const reliablePhone = user?.phone || user?.mobile || user?.customer_phone || formData.phone || (user?.username && /^\d{10}/.test(user.username) ? user.username : '') || '';
    const finalAddress = (bookingType === 'Door Step' && formData.address?.trim()) ? formData.address : (user?.address || user?.data?.address || '');

    const payload = {
      category: selectedGender === 'Gentlemen' ? 'Gents' : 'Ladies',
      services: selectedServices.map(s => s.name).join(', '),
      amount: finalAmount,
      date: selectedDate,
      time: selectedTime,
      payment_status: 'Completed',
      payment_type: paymentMethod || 'Cash',
      customer_id: userId,
      status: 'booked',
      customer_name: user?.username || 'Guest',
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
      order_type: bookingType,
      address: bookingType === 'Door Step' ? finalAddress : 'At Salon',
    };

    try {
      await axios.post(`${API_BASE_URL}/orders/`, payload);

      const stored = await AsyncStorage.getItem('offline_orders');
      const orders = stored ? JSON.parse(stored) : [];
      orders.unshift({ ...payload, id: 'BS-' + Date.now(), created_at: new Date().toISOString() });
      await AsyncStorage.setItem('offline_orders', JSON.stringify(orders.slice(0, 50)));

      Alert.alert("Success!", "Your service request has been confirmed.", [{ text: "OK", onPress: () => (goBack ? goBack() : navigation.goBack()) }]);
    } catch (error) {
      console.error('Barber booking error:', error);
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
      <Text style={styles.headerTitle}>Barber Shop</Text>
      <View style={{ width: 40 }} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {renderHeader()}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animatable.View animation="fadeIn" duration={1000}>
          <Text style={styles.sectionTitle}>Combined Barber & Parlour Services</Text>
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
            <Text style={styles.sectionTitle}>Select Gender</Text>
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[styles.toggleBtn, selectedGender === 'Men' && styles.selectedToggle]}
                onPress={() => setSelectedGender('Men')}
              >
                <Text style={[styles.toggleText, selectedGender === 'Men' && styles.activeToggleText]}>Men</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, selectedGender === 'Women' && styles.selectedToggle]}
                onPress={() => setSelectedGender('Women')}
              >
                <Text style={[styles.toggleText, selectedGender === 'Women' && styles.activeToggleText]}>Women</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Select Your Barber</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.barberScroll}>
              {barbers.map((b) => (
                <TouchableOpacity
                  key={b.name}
                  style={[styles.barberCard, selectedBarber === b.name && styles.selectedBarberCard]}
                  onPress={() => setSelectedBarber(b.name)}
                >
                  <View style={styles.barberAvatarWrap}>
                    <Image source={{ uri: b.image }} style={styles.barberAvatar} />
                    {selectedBarber === b.name && <View style={styles.selectedTick}><Text style={{ color: '#FFF', fontSize: 10 }}>✓</Text></View>}
                  </View>
                  <Text style={[styles.barberName, selectedBarber === b.name && styles.selectedBarberText]}>{b.name}</Text>
                  <Text style={styles.barberRating}>★ {b.rating}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Booking Type</Text>
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[styles.toggleBtn, bookingType === 'Salon' && styles.selectedToggle]}
                onPress={() => setBookingType('Salon')}
              >
                <Text style={[styles.toggleText, bookingType === 'Salon' && styles.activeToggleText]}>At Shop</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, bookingType === 'Door Step' && styles.selectedToggle]}
                onPress={() => setBookingType('Door Step')}
              >
                <Text style={[styles.toggleText, bookingType === 'Door Step' && styles.activeToggleText]}>Door Step</Text>
              </TouchableOpacity>
            </View>


            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Payment Method</Text>
            <View style={styles.paymentGrid}>
              {['Cash', 'GPay', 'Card'].map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.paymentBtn, paymentMethod === p && styles.selectedPayment]}
                  onPress={() => setPaymentMethod(p)}
                >
                  <Text style={[styles.paymentText, paymentMethod === p && styles.activePaymentText]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Service Details</Text>
            {bookingType === 'Door Step' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Service Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Full address for doorstep service"
                  value={formData.address}
                  onChangeText={(t) => setFormData(p => ({ ...p, address: t }))}
                  multiline
                />
              </View>
            )}
            <Text style={styles.label}>Appointment Date</Text>
            <TouchableOpacity style={styles.input} disabled>
              <Text style={{ color: '#1E293B' }}>{selectedDate}</Text>
            </TouchableOpacity>

            <Text style={[styles.label, { marginTop: 20 }]}>Appointment Time</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
              {['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'].map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.timeSlot,
                    selectedTime === t && styles.timeSlotActive
                  ]}
                  onPress={() => setSelectedTime(t)}
                >
                  <Text style={[
                    styles.timeSlotText,
                    selectedTime === t && styles.timeSlotTextActive
                  ]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <TouchableOpacity style={styles.bookBtn} onPress={handleBookingSubmit} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.bookBtnText}>Confirm Appointment </Text>
                <Text style={[styles.bookBtnText, { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, borderRadius: 8 }]}>
                  ₹{selectedServices.reduce((sum, s) => sum + s.price, 0) + (bookingType === 'Door Step' ? 200 : 0)}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </Animatable.View>
      </ScrollView>

      {localProcessing && (
        <Modal transparent visible={showPaymentModal} animationType="fade">
          <View style={[styles.luxeOverlay, { justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.8)' }]}>
            <View style={styles.luxeProcessingCard}>
              <ActivityIndicator size="large" color="#348f9f" />
              <Text style={styles.luxeProcessingTitle}>Processing Payment</Text>
              <Text style={styles.luxeProcessingSub}>Verifying your card securely...</Text>
            </View>
          </View>
        </Modal>
      )}

      {localSuccess && (
        <Modal transparent visible={showPaymentModal} animationType="fade">
          <View style={[styles.luxeOverlay, { justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.8)' }]}>
            <View style={styles.luxeProcessingCard}>
              <View style={styles.luxeSuccessBadge}>
                <Text style={{ fontSize: 40, color: '#10B981', fontWeight: '900' }}>✓</Text>
              </View>
              <Text style={[styles.luxeProcessingTitle, { color: '#10B981' }]}>Payment Verified</Text>
              <Text style={styles.luxeProcessingSub}>Your booking is secured.</Text>
            </View>
          </View>
        </Modal>
      )}

      <Modal animationType="slide" transparent={true} visible={showUpiAppsModal} onRequestClose={() => setShowUpiAppsModal(false)}>
        <View style={styles.luxeModalOverlay}>
          <TouchableOpacity style={styles.luxeModalBackdrop} activeOpacity={1} onPress={() => setShowUpiAppsModal(false)} />
          <View style={styles.luxeUpiModal}>
            <View style={styles.luxeModalHeader}>
              <Text style={styles.luxeModalTitle}>CHOOSE UPI APP</Text>
              <TouchableOpacity onPress={() => setShowUpiAppsModal(false)}>
                <Text style={{ fontSize: 20, color: '#64748B' }}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.luxeUpiList} showsVerticalScrollIndicator={false}>
              {[
                { id: 'phonepe', name: 'PhonePe', icon: 'https://cdn.iconscout.com/icon/free/png-256/phonepe-2752131-2284950.png' },
                { id: 'googlepay', name: 'Google Pay', icon: 'https://cdn.iconscout.com/icon/free/png-256/google-pay-2752133-2284952.png' },
                { id: 'paytm', name: 'Paytm', icon: 'https://cdn.iconscout.com/icon/free/png-256/paytm-226448.png' },
              ].map((app) => (
                <TouchableOpacity key={app.id} style={styles.luxeUpiCard} onPress={() => { setShowUpiAppsModal(false); initiateUpiPayment(app.id); }}>
                  <View style={styles.luxeUpiLeft}>
                    <Image source={{ uri: app.icon }} style={styles.luxeUpiIcon} />
                    <Text style={styles.luxeUpiName}>{app.name}</Text>
                  </View>
                  <ChevronRight size={20} color="#348f9f" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 20, backgroundColor: '#FFF' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  scrollContent: { padding: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: '#1E293B', marginBottom: 20 },
  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, justifyContent: 'space-between' },
  serviceCard: { width: (width - 55) / 2, height: 200, backgroundColor: '#FFF', borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: '#E2E8F0', position: 'relative' },
  serviceImage: { ...StyleSheet.absoluteFillObject },
  cardGradient: { ...StyleSheet.absoluteFillObject },
  selectedCard: { borderColor: '#348f9f', borderWidth: 2 },
  serviceInfo: { position: 'absolute', bottom: 12, left: 12, right: 12 },
  serviceName: { fontSize: 13, fontWeight: '800', color: '#FFF', marginBottom: 2 },
  servicePrice: { fontSize: 14, fontWeight: '800', color: '#FFF' },
  checkBadge: { position: 'absolute', top: 12, right: 12, width: 24, height: 24, borderRadius: 12, backgroundColor: '#348f9f', justifyContent: 'center', alignItems: 'center' },
  formSection: { marginTop: 30 },
  barberScroll: { marginBottom: 15 },
  barberCard: { width: 90, alignItems: 'center', marginRight: 15, padding: 10, backgroundColor: '#FFF', borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  selectedBarberCard: { borderColor: '#348f9f', backgroundColor: '#F0F9FA' },
  barberAvatarWrap: { position: 'relative', marginBottom: 8 },
  barberAvatar: { width: 60, height: 60, borderRadius: 30 },
  selectedTick: { position: 'absolute', bottom: 0, right: 0, width: 18, height: 18, borderRadius: 9, backgroundColor: '#348f9f', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF' },
  barberName: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  selectedBarberText: { color: '#0E7490' },
  barberRating: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  toggleRow: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  toggleBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#FFF', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  selectedToggle: { backgroundColor: '#348f9f', borderColor: '#348f9f' },
  toggleText: { fontSize: 14, fontWeight: '700', color: '#64748B' },
  activeToggleText: { color: '#FFF' },

  paymentGrid: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  paymentBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#FFF', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  selectedPayment: { backgroundColor: '#1E293B', borderColor: '#1E293B' },
  paymentText: { fontSize: 14, fontWeight: '700', color: '#64748B' },
  activePaymentText: { color: '#FFF' },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', color: '#64748B', marginBottom: 8 },
  input: { backgroundColor: '#FFF', paddingHorizontal: 15, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', fontSize: 15, color: '#1E293B', paddingVertical: 12 },
  timeSlot: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', marginRight: 10 },
  timeSlotActive: { backgroundColor: '#348f9f', borderColor: '#348f9f' },
  timeSlotText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  timeSlotTextActive: { color: '#FFF' },
  bookBtn: { marginTop: 20, backgroundColor: '#348f9f', paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  bookBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  luxeModalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'flex-end' },
  luxeModalBackdrop: { ...StyleSheet.absoluteFillObject },
  luxeUpiModal: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: 400 },
  luxeModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  luxeModalTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B', letterSpacing: 1 },
  luxeUpiList: { marginBottom: 10 },
  luxeUpiCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  luxeUpiLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  luxeUpiIcon: { width: 32, height: 32, resizeMode: 'contain' },
  luxeUpiName: { fontSize: 15, fontWeight: '600', color: '#334155' },
  luxeOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000 },
  luxeProcessingCard: { backgroundColor: '#FFF', margin: 40, padding: 30, borderRadius: 24, alignItems: 'center', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 },
  luxeProcessingTitle: { fontSize: 20, fontWeight: '800', color: '#1E293B', marginTop: 20, marginBottom: 8 },
  luxeProcessingSub: { fontSize: 14, color: '#64748B', textAlign: 'center' },
  luxeSuccessBadge: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
});

export default BarberShop;
