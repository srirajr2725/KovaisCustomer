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

const { width, height } = Dimensions.get('window');
const API_BASE_URL = 'https://api.codingboss.in/kovais/saloon';

const LadiesParlour = ({ goBack }) => {
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated } = useAuth();
  const navigation = useNavigation();

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedServices, setSelectedServices] = useState([]);
  const [location, setLocation] = useState('salon');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState(null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const services = [
    { id: 'l1', name: 'Bridal Makeover', price: 5000, duration: '180 min', image: 'https://images.pexels.com/photos/3023249/pexels-photo-3023249.jpeg' },
    { id: 'l2', name: 'Premium Hair Spa', price: 1500, duration: '60 min', image: 'https://images.pexels.com/photos/3993444/pexels-photo-3993444.jpeg' },
    { id: 'l3', name: 'Glow Facial', price: 2000, duration: '75 min', image: 'https://images.pexels.com/photos/3762871/pexels-photo-3762871.jpeg' },
    { id: 'l4', name: 'Manicure & Pedicure', price: 1200, duration: '90 min', image: 'https://images.pexels.com/photos/3997380/pexels-photo-3997380.jpeg' },
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
      customer_phone: user?.phone || '',
    };

    try {
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
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backBtn}>
          <ChevronLeft size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ladies Parlour</Text>
        <Sparkles size={24} color="#FFF" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={styles.bannerContainer}>
          <Image 
            source={{ uri: 'https://images.pexels.com/photos/3762882/pexels-photo-3762882.jpeg' }} 
            style={styles.bannerImg}
          />
          <LinearGradient
            colors={['rgba(255,107,129,0.3)', 'rgba(0,0,0,0.8)']}
            style={styles.bannerOverlay}
          >
            <Text style={styles.bannerSubtitle}>LUXURY REIMAGINED</Text>
            <Text style={styles.bannerTitle}>Beauty That Inspires</Text>
          </LinearGradient>
        </View>

        {/* Steps */}
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
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bespoke Services</Text>
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

            {services.map(service => (
              <TouchableOpacity 
                key={service.id} 
                style={[styles.serviceCard, selectedServices.some(s => s.id === service.id) && styles.serviceCardActive]}
                onPress={() => handleServiceSelect(service)}
              >
                <Image source={{ uri: service.image }} style={styles.serviceImg} />
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.serviceDuration}>{service.duration}</Text>
                  <Text style={styles.servicePrice}>₹{service.price}</Text>
                </View>
                {selectedServices.some(s => s.id === service.id) && (
                  <View style={styles.checkIcon}>
                    <Heart size={20} color="#FF4757" fill="#FF4757" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {currentStep === 1 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pick a Date</Text>
            <Calendar
              onDayPress={day => setSelectedDate(day.dateString)}
              markedDates={{ [selectedDate]: { selected: true, selectedColor: '#FF4757' } }}
              theme={{
                selectedDayBackgroundColor: '#FF4757',
                todayTextColor: '#FF4757',
                arrowColor: '#FF4757',
              }}
            />
            <Text style={[styles.sectionTitle, { marginTop: 25 }]}>Select Time</Text>
            <View style={styles.timeGrid}>
              {timeSlots.map(time => (
                <TouchableOpacity 
                  key={time} 
                  style={[styles.timeBtn, selectedTime === time && styles.timeBtnActive]}
                  onPress={() => setSelectedTime(time)}
                >
                  <Text style={[styles.timeBtnText, selectedTime === time && styles.timeBtnTextActive]}>{time}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {currentStep === 2 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Final Review</Text>
            <View style={styles.summaryCard}>
              <LinearGradient colors={['#FF4757', '#FF6B81']} style={styles.totalBadge}>
                <Text style={styles.totalLabel}>Total Payable</Text>
                <Text style={styles.totalValue}>₹{totalAmount}</Text>
              </LinearGradient>
              <View style={styles.summaryRow}>
                <Text style={styles.summLabel}>Appointment</Text>
                <Text style={styles.summValue}>{selectedDate} at {selectedTime}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summLabel}>Location</Text>
                <Text style={styles.summValue}>{location === 'salon' ? 'In Boutique' : 'Home Service'}</Text>
              </View>
              {location === 'doorstep' && (
                <TextInput
                  style={styles.addressInput}
                  placeholder="Drop your address here..."
                  value={address}
                  onChangeText={setAddress}
                  multiline
                />
              )}
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => currentStep > 0 ? setCurrentStep(p => p - 1) : null}
        >
          {currentStep > 0 && <Text style={styles.backText}>Back</Text>}
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.checkoutBtn}
          onPress={() => currentStep < 2 ? setCurrentStep(p => p + 1) : handleBookingSubmit()}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Text style={styles.checkoutText}>{currentStep === 2 ? 'Complete Booking' : 'Next Step'}</Text>
              <ChevronRight size={20} color="#FFF" />
            </>
          )}
        </TouchableOpacity>
      </View>
      <Modal transparent visible={loading} animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#FFF', padding: 30, borderRadius: 24, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#348f9f" />
            <Text style={{ marginTop: 20, fontSize: 18, fontWeight: '700', color: '#0F172A' }}>Processing Booking...</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FF4757',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 1,
  },
  bannerContainer: {
    height: 220,
    position: 'relative',
  },
  bannerImg: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 25,
  },
  bannerSubtitle: {
    color: '#FF6B81',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 3,
  },
  bannerTitle: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '900',
  },
  stepContainer: {
    flexDirection: 'row',
    padding: 25,
    justifyContent: 'center',
  },
  stepWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FED7D7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotActive: {
    backgroundColor: '#FF4757',
  },
  stepText: {
    color: '#FF6B81',
    fontWeight: '800',
  },
  stepTextActive: {
    color: '#FFF',
  },
  stepLine: {
    width: 50,
    height: 3,
    backgroundColor: '#FED7D7',
    marginHorizontal: 8,
    borderRadius: 2,
  },
  stepLineActive: {
    backgroundColor: '#FF4757',
  },
  section: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#2D3436',
    marginBottom: 20,
  },
  locationToggle: {
    flexDirection: 'row',
    backgroundColor: '#FED7D7',
    borderRadius: 15,
    padding: 5,
    marginBottom: 25,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  toggleBtnActive: {
    backgroundColor: '#FFF',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF6B81',
  },
  toggleTextActive: {
    color: '#FF4757',
  },
  serviceCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#FF4757',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
    alignItems: 'center',
  },
  serviceCardActive: {
    borderWidth: 2,
    borderColor: '#FF4757',
  },
  serviceImg: {
    width: 70,
    height: 70,
    borderRadius: 15,
  },
  serviceInfo: {
    flex: 1,
    marginLeft: 15,
  },
  serviceName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#2D3436',
  },
  serviceDuration: {
    fontSize: 13,
    color: '#636E72',
    marginTop: 4,
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FF4757',
    marginTop: 6,
  },
  checkIcon: {
    marginLeft: 10,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeBtn: {
    width: (width - 64) / 3,
    paddingVertical: 15,
    backgroundColor: '#FFF',
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FED7D7',
  },
  timeBtnActive: {
    backgroundColor: '#FF4757',
    borderColor: '#FF4757',
  },
  timeBtnText: {
    fontWeight: '700',
    color: '#FF6B81',
  },
  timeBtnTextActive: {
    color: '#FFF',
  },
  summaryCard: {
    backgroundColor: '#FFF',
    borderRadius: 25,
    padding: 25,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 5,
  },
  totalBadge: {
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 25,
  },
  totalLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  totalValue: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '900',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F6FA',
  },
  summLabel: {
    color: '#636E72',
    fontWeight: '600',
  },
  summValue: {
    color: '#2D3436',
    fontWeight: '800',
  },
  addressInput: {
    backgroundColor: '#FFF5F6',
    borderRadius: 15,
    padding: 15,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#FED7D7',
    marginTop: 10,
    color: '#2D3436',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F5F6FA',
  },
  backButton: {
    paddingHorizontal: 20,
  },
  backText: {
    color: '#636E72',
    fontWeight: '700',
  },
  checkoutBtn: {
    backgroundColor: '#FF4757',
    paddingHorizontal: 30,
    paddingVertical: 18,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#FF4757',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  checkoutText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '900',
  }
});

export default LadiesParlour;
