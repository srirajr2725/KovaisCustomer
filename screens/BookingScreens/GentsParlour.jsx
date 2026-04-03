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

const { width, height } = Dimensions.get('window');
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
      setFormData(prev => ({
        ...prev,
        name: user.name || user.username || '',
        phone: user.phone || '',
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

    if (!formData.phone) {
      Alert.alert("Phone Required", "Please provide a contact phone number for the stylist.");
      return;
    }

    if (!formData.address) {
      Alert.alert("Address Required", "Please provide the home or office address for service.");
      return;
    }

    setLoading(true);
    const totalAmount = selectedServices.reduce((sum, s) => sum + s.price, 0);

    const payload = {
      customer_id: userId,
      customer: userId,
      user_id: userId,
      user: userId,
      customer_name: formData.name || 'Valued Guest',
      customer_phone: formData.phone,
      mobile: formData.phone,
      phone: formData.phone,
      mobile_no: formData.phone,
      phone_number: formData.phone,
      mobile_number: formData.phone,
      contact: formData.phone,
      contact_number: formData.phone,
      customer_mobile: formData.phone,
      customer_contact: formData.phone,
      customer_mobile_number: formData.phone,
      customer_phone_number: formData.phone,
      address: formData.address,
      services: selectedServices.map(s => s.name).join(', '),
      amount: totalAmount,
      date: selectedDate,
      status: 'booked',
      category: 'Gents',
      Category: 'saloon',
      order_type: 'Door Step'
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
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                keyboardType="phone-pad"
                value={formData.phone}
                onChangeText={(t) => setFormData(p => ({ ...p, phone: t }))}
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
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', color: '#64748B', marginBottom: 8 },
  input: { backgroundColor: '#FFF', paddingHorizontal: 15, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', fontSize: 15, color: '#1E293B', paddingVertical: 12 },
  bookBtn: { marginTop: 20, backgroundColor: '#348f9f', paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  bookBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' }
});

export default GentsParlour;
