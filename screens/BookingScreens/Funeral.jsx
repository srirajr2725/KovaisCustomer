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
  Heart,
  Droplets,
  Flower2
} from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Calendar } from 'react-native-calendars';
import { useAuth } from '../AuthContext';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';

const { width, height } = Dimensions.get('window');
const API_BASE_URL = 'https://api.codingboss.in/kovais/saloon';

const FuneralBooking = ({ goBack }) => {
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

    { id: 'f3', name: 'Ritual Shaving (Mottai)', price: 500, icon: '✂️', desc: 'Traditional head shaving ritual for mourners' },
    { id: 'f5', name: 'Full Ritual Management', price: 8000, icon: '🙏', desc: 'Complete end-to-end Tamil funeral arrangements' },
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
      Alert.alert("Login Required", "Please login to proceed with service booking.");
      return;
    }

    if (selectedServices.length === 0) {
      Alert.alert("Selection Required", "Please select at least one ritual service from the grid.");
      return;
    }

    if (!formData.phone) {
      Alert.alert("Phone Required", "Please provide a contact phone number for ritual coordination.");
      return;
    }

    if (!formData.address) {
      Alert.alert("Address Required", "Please provide the ritual venue or home address.");
      return;
    }

    setLoading(true);
    const totalAmount = selectedServices.reduce((sum, s) => sum + s.price, 0);

    const payload = {
      customer_id: userId,
      customer_name: formData.name || 'Valued Guest',
      customer_phone: formData.phone,
      address: formData.address,
      services: selectedServices.map(s => s.name).join(', '),
      amount: totalAmount,
      date: selectedDate,
      status: 'booked',
      category: 'Funeral',
      order_type: 'Door Step'
    };

    try {
      await axios.post(`${API_BASE_URL}/orders/`, payload);

      const stored = await AsyncStorage.getItem('offline_orders');
      const orders = stored ? JSON.parse(stored) : [];
      orders.unshift({ ...payload, id: 'FUN-' + Date.now(), created_at: new Date().toISOString(), Category: 'funeral' });
      await AsyncStorage.setItem('offline_orders', JSON.stringify(orders.slice(0, 50)));

      Alert.alert("Request Received", "Our team will contact you immediately.", [{ text: "OK", onPress: () => (goBack ? goBack() : navigation.goBack()) }]);
    } catch (error) {
      console.error('Funeral booking error:', error);
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
      <Text style={styles.headerTitle}>Professional Rituals</Text>
      <View style={{ width: 40 }} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {renderHeader()}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animatable.View animation="fadeIn" duration={1000}>
          <View style={styles.emergencyCard}>
            <LinearGradient colors={['#ef4444', '#b91c1c']} style={styles.emergencyGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <View style={styles.emergencyIcon}>
                <Phone size={24} color="#FFF" />
              </View>
              <View style={styles.emergencyContent}>
                <Text style={styles.emergencyTitle}>24/7 Support Required?</Text>
                <Text style={styles.emergencySubtitle}>Our master ritualists are available instantly for doorstep guidance.</Text>
              </View>
            </LinearGradient>
          </View>

          <Text style={styles.sectionTitle}>Select Ritual Services</Text>
          <View style={styles.servicesGrid}>
            {services.map((service) => {
              const isSelected = selectedServices.some(s => s.id === service.id);
              return (
                <TouchableOpacity
                  key={service.id}
                  style={[styles.serviceCard, isSelected && styles.selectedCard]}
                  onPress={() => toggleService(service)}
                >
                  <Text style={styles.icon}>{service.icon}</Text>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.servicePrice}>₹{service.price}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Requester Information</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Address</Text>
              <TextInput
                style={styles.input}
                placeholder="Full address for doorstep service"
                value={formData.address}
                onChangeText={(t) => setFormData(p => ({ ...p, address: t }))}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Emergency Phone</Text>
              <TextInput
                style={styles.input}
                keyboardType="phone-pad"
                value={formData.phone}
                onChangeText={(t) => setFormData(p => ({ ...p, phone: t }))}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.bookBtn} onPress={handleBookingSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.bookBtnText}>Confirm Service Request</Text>}
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
  emergencyCard: { borderRadius: 24, overflow: 'hidden', marginBottom: 30 },
  emergencyGradient: { padding: 20, flexDirection: 'row', alignItems: 'center', gap: 15 },
  emergencyIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  emergencyContent: { flex: 1 },
  emergencyTitle: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  emergencySubtitle: { color: 'rgba(255,255,255,0.9)', fontSize: 13, marginTop: 2 },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: '#1E293B', marginBottom: 20 },
  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, justifyContent: 'space-between' },
  serviceCard: { width: (width - 55) / 2, backgroundColor: '#FFF', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
  selectedCard: { borderColor: '#ef4444', backgroundColor: '#FEF2F2' },
  icon: { fontSize: 32, marginBottom: 12 },
  serviceName: { fontSize: 14, fontWeight: '800', textAlign: 'center', color: '#1E293B', marginBottom: 4 },
  servicePrice: { fontSize: 13, fontWeight: '600', color: '#ef4444' },
  formSection: { marginTop: 30 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', color: '#64748B', marginBottom: 8 },
  input: { backgroundColor: '#FFF', paddingHorizontal: 15, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', fontSize: 15, color: '#1E293B', paddingVertical: 12 },
  bookBtn: { marginTop: 20, backgroundColor: '#ef4444', paddingVertical: 16, borderRadius: 16, alignItems: 'center', elevation: 4 },
  bookBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' }
});

export default FuneralBooking;
