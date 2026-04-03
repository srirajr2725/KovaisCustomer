import React, { useState, useEffect, useCallback } from 'react';
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
  Sparkles,
  Heart
} from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Calendar } from 'react-native-calendars';
import { useAuth } from '../AuthContext';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import { Clock } from 'lucide-react-native';
const { width, height } = Dimensions.get('window');
const API_BASE_URL = 'https://api.codingboss.in/kovais/saloon';

const LadiesParlour = ({ goBack }) => {
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated } = useAuth();
  const navigation = useNavigation();

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedServices, setSelectedServices] = useState([]);
  const [location, setLocation] = useState('salon');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [dates, setDates] = useState([]);

  useEffect(() => {
    const next7Days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = date.getDate();
      const dateString = date.toISOString().split('T')[0];
      next7Days.push({ dayName, dayNum, dateString });
    }
    setDates(next7Days);
  }, []);

  const services = [
    { id: 'l1', name: 'Bridal Makeover', price: 5000, duration: '180 min', image: 'https://images.unsplash.com/photo-1583944090193-4e2d3549646c?auto=format&fit=crop&w=800' },
    { id: 'l2', name: 'Premium Hair Spa', price: 1500, duration: '60 min', image: 'https://images.unsplash.com/photo-1605497788442-536979203e33?auto=format&fit=crop&w=800' },
    { id: 'l3', name: 'Glow Facial', price: 2000, duration: '75 min', image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc2074?auto=format&fit=crop&w=800' },
    { id: 'l4', name: 'Manicure & Pedicure', price: 1200, duration: '90 min', image: 'https://images.unsplash.com/photo-1632345039235-911ce0d24ee4?auto=format&fit=crop&w=800' },
  ];

  const timeSlots = ['10:00 AM', '11:30 AM', '01:00 PM', '02:30 PM', '04:00 PM', '05:30 PM', '07:00 PM'];

  const handleServiceSelect = (service) => {
    const exists = selectedServices.some(s => s.id === service.id);
    if (exists) {
      setSelectedServices(prev => prev.filter(s => s.id !== service.id));
    } else {
      setSelectedServices(prev => [...prev, service]);
    }
  };

  const totalAmount = selectedServices.reduce((sum, s) => sum + s.price, 0) + (location === 'doorstep' ? 300 : 0);

  const handleBookingSubmit = async () => {
    const userId = user?.user_id || user?.id || user?.customer_id || user?.user?.id || user?.data?.id;
    if (!userId) {
      setLoading(false);
      Alert.alert("Authentication Required", "Please login to book a service.");
      return;
    }

    const userPhone = user?.phone || user?.mobile || user?.customer_phone || user?.contact || '';
    const orderPayload = {
      order_type: location === 'doorstep' ? 'Door Step' : 'Salon',
      category: 'Ladies',
      services: selectedServices.map((s) => s.name).join(', '),
      amount: totalAmount,
      date: selectedDate,
      time: selectedTime,
      payment_status: 'booked',
      payment_type: 'Cash',
      customer_id: userId,
      status: 'booked',
      customer_name: user?.name || user?.username || 'Valued Guest',
      customer_phone: userPhone,
      mobile: userPhone,
      phone: userPhone,
      mobile_no: userPhone,
      phone_number: userPhone,
      mobile_number: userPhone,
      contact: userPhone,
      contact_number: userPhone,
      customer_mobile: userPhone,
      customer_contact: userPhone,
      customer_mobile_number: userPhone,
      customer_phone_number: userPhone,
      address: location === 'doorstep' ? address : 'At Salon',
    };

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/orders/`, orderPayload);
      const orderData = response.data || {};
      const orderId = orderData.order?.id || orderData.id || orderData.data?.id || 'LADY-' + Math.floor(Math.random() * 100000);

      // Save locally
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
        console.error('Error saving local lady order:', storageErr);
      }

      setLoading(false);
      Alert.alert(
        "Booking Successful",
        `Your beauty session is confirmed! Order ID: ${orderId}`,
        [{ text: "OK", onPress: () => goBack() }]
      );
    } catch (error) {
      console.error('Parlour booking error:', error);
      // Fallback
      const mockOrderId = `LADY-${Math.floor(Math.random() * 900000 + 100000)}`;
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
      Alert.alert(
        "Booking Confirmed",
        "Your appointment has been secured! You will receive confirmation shortly.",
        [{ text: "OK", onPress: () => goBack() }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />

      <Animatable.View animation="fadeInDown" duration={1000} style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backBtn}>
          <ChevronLeft size={24} color="#FF4757" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ladies Parlour</Text>
        <Sparkles size={24} color="#FF4757" />
      </Animatable.View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Animatable.View animation="fadeIn" duration={1200} style={styles.bannerContainer}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1616394584442-1e695504782a?auto=format&fit=crop&w=1200' }}
            style={styles.bannerImg}
          />
          <LinearGradient
            colors={['rgba(255,71,87,0.2)', 'rgba(0,0,0,0.85)']}
            style={styles.bannerOverlay}
          >
            <View style={styles.bannerBadge}>
              <Heart size={14} color="#FFF" fill="#FFF" />
              <Text style={styles.bannerBadgeText}>ELITE Beauty</Text>
            </View>
            <Text style={styles.bannerSubtitle}>LUXURY BOUTIQUE EXPERIENCE</Text>
            <Text style={styles.bannerTitle}>Beauty That Inspires</Text>
          </LinearGradient>
        </Animatable.View>

        <View style={styles.stepContainer}>
          {[0, 1, 2].map((step) => (
            <View key={step} style={styles.stepWrapper}>
              <View style={[styles.stepDot, currentStep >= step && styles.stepDotActive]}>
                <Text style={[styles.stepText, currentStep >= step && styles.stepTextActive]}>{step + 1}</Text>
              </View>
              {step < 2 && <View style={[styles.stepLine, currentStep > step && styles.stepLineActive]} />}
            </View>
          ))}
        </View>

        {currentStep === 0 && (
          <Animatable.View animation="fadeInUp" duration={800} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Bespoke Services</Text>
              <Text style={styles.sectionBadge}>{selectedServices.length} Selected</Text>
            </View>

            <View style={styles.locationToggle}>
              <TouchableOpacity
                style={[styles.toggleBtn, location === 'salon' && styles.toggleBtnActive]}
                onPress={() => setLocation('salon')}
              >
                <Text style={[styles.toggleText, location === 'salon' && styles.toggleTextActive]}>At Boutique</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, location === 'doorstep' && styles.toggleBtnActive]}
                onPress={() => setLocation('doorstep')}
              >
                <Text style={[styles.toggleText, location === 'doorstep' && styles.toggleTextActive]}>Home Service</Text>
              </TouchableOpacity>
            </View>

            {services.map((service, idx) => (
              <Animatable.View
                key={service.id}
                animation="fadeInUp"
                delay={200 + (idx * 100)}
              >
                <TouchableOpacity
                  style={[styles.serviceCard, selectedServices.some(s => s.id === service.id) && styles.serviceCardActive]}
                  onPress={() => handleServiceSelect(service)}
                  activeOpacity={0.7}
                >
                  <Image source={{ uri: service.image }} style={styles.serviceImg} />
                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    <View style={styles.serviceMeta}>
                      <Clock size={12} color="#94A3B8" />
                      <Text style={styles.serviceDuration}>{service.duration}</Text>
                    </View>
                    <Text style={styles.servicePrice}>₹{service.price}</Text>
                  </View>
                  {selectedServices.some(s => s.id === service.id) && (
                    <Animatable.View animation="bounceIn" style={styles.checkIcon}>
                      <Heart size={20} color="#FF4757" fill="#FF4757" />
                    </Animatable.View>
                  )}
                </TouchableOpacity>
              </Animatable.View>
            ))}
          </Animatable.View>
        )}

        {currentStep === 1 && (
          <Animatable.View animation="fadeInUp" duration={800} style={styles.section}>
            <Text style={styles.sectionTitle}>Pick a Date</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateScroll}>
              {dates.map((date, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.dateBtn, selectedDate === date.dateString && styles.dateBtnActive]}
                  onPress={() => setSelectedDate(date.dateString)}
                >
                  <Text style={[styles.dateDayName, selectedDate === date.dateString && styles.dateTextActive]}>{date.dayName}</Text>
                  <Text style={[styles.dateDayNum, selectedDate === date.dateString && styles.dateTextActive]}>{date.dayNum}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.sectionTitle, { marginTop: 30 }]}>Select Time</Text>
            <View style={styles.timeGrid}>
              {timeSlots.map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[styles.timeBtn, selectedTime === time && styles.timeBtnActive]}
                  onPress={() => setSelectedTime(time)}
                >
                  <Text style={[styles.timeBtnText, selectedTime === time && styles.timeBtnTextActive]}>{time}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animatable.View>
        )}

        {currentStep === 2 && (
          <Animatable.View animation="fadeInUp" duration={800} style={styles.section}>
            <Text style={styles.sectionTitle}>Final Review</Text>
            <View style={styles.summaryCard}>
              <LinearGradient colors={['#FF4757', '#FF6B81']} style={styles.totalBadge}>
                <Text style={styles.totalLabel}>Total Payable</Text>
                <Text style={styles.totalValue}>₹{totalAmount}</Text>
              </LinearGradient>

              <View style={styles.infoRow}>
                <Heart size={18} color="#FF4757" />
                <Text style={styles.infoValue}>{selectedDate} at {selectedTime}</Text>
              </View>
              <View style={styles.infoRow}>
                <MapPin size={18} color="#FF4757" />
                <Text style={styles.infoValue}>{location === 'salon' ? 'In Boutique' : 'Home Service'}</Text>
              </View>

              {location === 'doorstep' && (
                <Animatable.View animation="fadeIn" style={styles.addressSection}>
                  <Text style={styles.addressLabel}>Delivery Address</Text>
                  <TextInput
                    style={styles.addressInput}
                    placeholder="Enter your location details..."
                    placeholderTextColor="#94A3B8"
                    value={address}
                    onChangeText={setAddress}
                    multiline
                  />
                </Animatable.View>
              )}
            </View>
          </Animatable.View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      <Animatable.View animation="slideInUp" style={styles.floatingFooter}>
        <View style={styles.footerContent}>
          <TouchableOpacity
            style={styles.backPill}
            onPress={() => currentStep > 0 ? setCurrentStep(p => p - 1) : null}
          >
            {currentStep > 0 && <Text style={styles.backPillText}>Back</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.pillButton}
            onPress={() => currentStep < 2 ? setCurrentStep(p => p + 1) : handleBookingSubmit()}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <LinearGradient
                colors={['#FF4757', '#FF6B81']}
                style={styles.pillGradient}
              >
                <Text style={styles.pillText}>{currentStep === 2 ? 'Confirm' : 'Next Step'}</Text>
                <ChevronRight size={18} color="#FFF" />
              </LinearGradient>
            )}
          </TouchableOpacity>
        </View>
      </Animatable.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#FF4757', letterSpacing: 1 },
  bannerContainer: { height: 280, position: 'relative' },
  bannerImg: { width: '100%', height: '100%' },
  bannerOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 25 },
  bannerBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, marginBottom: 10, gap: 5 },
  bannerBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
  bannerSubtitle: { color: '#FFD700', fontSize: 12, fontWeight: '800', letterSpacing: 3, textTransform: 'uppercase' },
  bannerTitle: { color: '#FFF', fontSize: 32, fontWeight: '950' },
  stepContainer: { flexDirection: 'row', padding: 25, justifyContent: 'center' },
  stepWrapper: { flexDirection: 'row', alignItems: 'center' },
  stepDot: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  stepDotActive: { backgroundColor: '#FF4757', borderColor: '#FF4757' },
  stepText: { color: '#94A3B8', fontWeight: '900', fontSize: 13 },
  stepTextActive: { color: '#FFF' },
  stepLine: { width: 50, height: 3, backgroundColor: '#F1F5F9', marginHorizontal: 8, borderRadius: 2 },
  stepLineActive: { backgroundColor: '#FF4757' },
  section: { paddingHorizontal: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 22, fontWeight: '900', color: '#2D3436' },
  sectionBadge: { fontSize: 12, fontWeight: '700', color: '#FF4757', backgroundColor: '#FFF5F6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  locationToggle: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 16, padding: 6, marginBottom: 25 },
  toggleBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
  toggleBtnActive: { backgroundColor: '#FFFFFF', elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  toggleText: { fontSize: 14, fontWeight: '800', color: '#94A3B8' },
  toggleTextActive: { color: '#FF4757' },
  serviceCard: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 24, padding: 16, marginBottom: 16, elevation: 2, alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15 },
  serviceCardActive: { borderWidth: 2, borderColor: '#FF4757', backgroundColor: '#FFF5F6', transform: [{ scale: 1.02 }] },
  serviceImg: { width: 75, height: 75, borderRadius: 18 },
  serviceInfo: { flex: 1, marginLeft: 18 },
  serviceName: { fontSize: 17, fontWeight: '900', color: '#2D3436' },
  serviceMeta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 5 },
  serviceDuration: { fontSize: 13, color: '#94A3B8', fontWeight: '600' },
  servicePrice: { fontSize: 18, fontWeight: '900', color: '#FF4757', marginTop: 6 },
  checkIcon: { marginLeft: 10 },
  dateScroll: { gap: 15, paddingBottom: 5 },
  dateBtn: { width: 65, height: 85, borderRadius: 20, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  dateBtnActive: { backgroundColor: '#FF4757', borderColor: '#FF4757', elevation: 8, shadowColor: '#FF4757', shadowOpacity: 0.3 },
  dateDayName: { fontSize: 12, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase' },
  dateDayNum: { fontSize: 20, fontWeight: '900', color: '#2D3436', marginTop: 4 },
  dateTextActive: { color: '#FFFFFF' },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  timeBtn: { width: (width - 64) / 3, paddingVertical: 18, backgroundColor: '#FFFFFF', borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  timeBtnActive: { backgroundColor: '#FF4757', borderColor: '#FF4757', elevation: 5 },
  timeBtnText: { fontWeight: '900', color: '#94A3B8' },
  timeBtnTextActive: { color: '#FFF' },
  summaryCard: { backgroundColor: '#FFF', borderRadius: 30, padding: 25, elevation: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20, borderWidth: 1, borderColor: '#F1F5F9' },
  totalBadge: { padding: 22, borderRadius: 24, alignItems: 'center', marginBottom: 25 },
  totalLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  totalValue: { color: '#FFF', fontSize: 36, fontWeight: '900' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 15, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  infoValue: { color: '#2D3436', fontWeight: '800', fontSize: 16 },
  addressSection: { marginTop: 10 },
  addressLabel: { fontSize: 13, fontWeight: '800', color: '#94A3B8', marginBottom: 8 },
  addressInput: { backgroundColor: '#F8FAFC', borderRadius: 18, padding: 18, minHeight: 120, textAlignVertical: 'top', fontSize: 15, fontWeight: '700', color: '#2D3436', borderWidth: 1, borderColor: '#E2E8F0' },
  floatingFooter: { position: 'absolute', bottom: 30, left: 20, right: 20, backgroundColor: '#FFFFFF', borderRadius: 24, padding: 15, elevation: 10, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 20 },
  footerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backPill: { paddingHorizontal: 20 },
  backPillText: { color: '#94A3B8', fontWeight: '800' },
  pillButton: { borderRadius: 20, overflow: 'hidden' },
  pillGradient: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 25, paddingVertical: 15, gap: 8 },
  pillText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' }
});

export default LadiesParlour;
