// BookingScreen.js - Enhanced with booking history integration
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Import the BookingService (make sure to create the BookingHistory.js file first)
import { BookingService } from './BookingHistory';

const BookingScreen = ({ route }) => {
  const [selected, setSelected] = useState(null);
  const [bookingFlow, setBookingFlow] = useState('category');
  const [bookingData, setBookingData] = useState(null);
  const navigation = useNavigation();
  
  // Get userId from route params or your auth context
  const userId = route?.params?.userId || 'user123'; // Replace with your actual userId logic

  const handleBookNow = (serviceData) => {
    setBookingData(serviceData);
    setBookingFlow('details');
  };

  const handleBookingConfirm = (bookingDetails) => {
    setBookingData({ ...bookingData, ...bookingDetails });
    setBookingFlow('payment');
  };

  const handlePaymentComplete = async (paymentData) => {
    const finalBookingData = { ...bookingData, ...paymentData };
    setBookingData(finalBookingData);
    
    try {
      // Save booking to history after successful payment
      await BookingService.saveBooking(userId, {
        serviceName: finalBookingData.title,
        serviceProvider: getServiceProvider(finalBookingData.category),
        location: getServiceLocation(finalBookingData.category),
        price: finalBookingData.price,
        duration: finalBookingData.duration || getDuration(finalBookingData.category),
        notes: finalBookingData.specialRequests || '',
        serviceType: finalBookingData.type,
        category: finalBookingData.category,
        bookingDate: finalBookingData.date,
        bookingTime: finalBookingData.time,
        customerName: finalBookingData.customerName,
        customerEmail: finalBookingData.customerEmail,
        customerPhone: finalBookingData.customerPhone,
        paymentMethod: finalBookingData.paymentMethod,
        paymentId: finalBookingData.paymentId,
        bookingId: finalBookingData.bookingId,
        status: 'confirmed'
      });

      Alert.alert(
        'Booking Confirmed!',
        `Your booking has been confirmed and added to your booking history!\n\nBooking ID: ${paymentData.bookingId}\nService: ${finalBookingData.title}\nDate: ${finalBookingData.date}\nTime: ${finalBookingData.time}`,
        [
          {
            text: 'View History',
            onPress: () => {
              navigation.navigate('Profile', { activeTab: 'history' });
              resetBookingFlow();
            }
          },
          {
            text: 'OK',
            onPress: resetBookingFlow
          }
        ]
      );
    } catch (error) {
      console.error('Error saving booking to history:', error);
      Alert.alert(
        'Booking Confirmed!',
        `Your booking has been confirmed!\n\nBooking ID: ${paymentData.bookingId}\nService: ${finalBookingData.title}\nDate: ${finalBookingData.date}\nTime: ${finalBookingData.time}\n\nNote: There was an issue saving to history, but your booking is valid.`,
        [
          {
            text: 'OK',
            onPress: resetBookingFlow
          }
        ]
      );
    }
  };

  const resetBookingFlow = () => {
    setSelected(null);
    setBookingFlow('category');
    setBookingData(null);
  };

  // Helper functions to get service details
  const getServiceProvider = (category) => {
    const providers = {
      'Hotels': 'Hotel Reservations',
      'Barber Shop': 'Professional Barbers',
      'Spa Center': 'Wellness Spa',
      'Gym': 'Fitness Center'
    };
    return providers[category] || 'Service Provider';
  };

  const getServiceLocation = (category) => {
    const locations = {
      'Hotels': 'City Center',
      'Barber Shop': 'Main Street',
      'Spa Center': 'Wellness District',
      'Gym': 'Fitness Plaza'
    };
    return locations[category] || 'Location TBD';
  };

  const getDuration = (category) => {
    const durations = {
      'Hotels': '1 night',
      'Barber Shop': '30-45 min',
      'Spa Center': '60-90 min',
      'Gym': '60 min'
    };
    return durations[category] || '60 min';
  };

  const goBack = () => {
    if (bookingFlow === 'details') {
      setBookingFlow('category');
    } else if (bookingFlow === 'payment') {
      setBookingFlow('details');
    } else {
      setSelected(null);
      setBookingFlow('category');
      setBookingData(null);
    }
  };

  const renderSelected = () => {
    if (bookingFlow === 'details') {
      return (
        <BookingDetailsScreen
          bookingData={bookingData}
          onConfirm={handleBookingConfirm}
          goBack={goBack}
        />
      );
    }

    if (bookingFlow === 'payment') {
      return (
        <PaymentScreen
          bookingData={bookingData}
          onPaymentComplete={handlePaymentComplete}
          goBack={goBack}
        />
      );
    }

    switch (selected) {
      case 'Hotels':
        return <HotelsComponent goBack={goBack} onBookNow={handleBookNow} />;
      case 'BarberShop':
        return <BarberShopComponent goBack={goBack} onBookNow={handleBookNow} />;
      case 'SpaCenter':
        return <SpaCenterComponent goBack={goBack} onBookNow={handleBookNow} />;
      case 'Gym':
        return <GymComponent goBack={goBack} onBookNow={handleBookNow} />;
      default:
        return (
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={() => setSelected('Hotels')}>
              <Text style={styles.buttonText}>Hotels</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => setSelected('BarberShop')}>
              <Text style={styles.buttonText}>Barber Shop</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => setSelected('SpaCenter')}>
              <Text style={styles.buttonText}>Spa Center</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => setSelected('Gym')}>
              <Text style={styles.buttonText}>Gym</Text>
            </TouchableOpacity>
            
            {/* Add booking history button */}
            <TouchableOpacity 
              style={[styles.button, styles.historyButton]} 
              onPress={() => navigation.navigate('Profile', { activeTab: 'history' })}
            >
              <Text style={styles.buttonText}>📜 My Booking History</Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  return <View style={styles.container}>{renderSelected()}</View>;
};

// Enhanced Hotels Component with better booking data
const HotelsComponent = ({ goBack, onBookNow }) => {
  const hotelData = [
    {
      id: 1,
      name: "Grand Palace Hotel",
      description: "Luxury 5-star hotel with ocean view",
      price: "250.00",
      rating: 4.8,
      image: "🏨",
      provider: "Grand Palace Hotels",
      location: "Downtown Waterfront"
    },
    {
      id: 2,
      name: "City Center Inn",
      description: "Modern hotel in downtown area",
      price: "120.00",
      rating: 4.2,
      image: "🏢",
      provider: "City Hotels Group",
      location: "City Center"
    },
    {
      id: 3,
      name: "Beach Resort",
      description: "Beachfront resort with spa facilities",
      price: "350.00",
      rating: 4.9,
      image: "🏖️",
      provider: "Beach Resort Chain",
      location: "Oceanside"
    }
  ];

  const handleBookNow = (hotel) => {
    onBookNow({
      id: hotel.id,
      title: hotel.name,
      description: hotel.description,
      price: hotel.price,
      type: 'hotel',
      category: 'Hotels',
      rating: hotel.rating,
      provider: hotel.provider,
      location: hotel.location,
      duration: '1 night'
    });
  };

  return (
    <ScrollView style={styles.serviceContainer}>
      <View style={styles.serviceHeader}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.serviceTitle}>Hotels</Text>
      </View>

      <View style={styles.serviceGrid}>
        {hotelData.map((hotel) => (
          <View key={hotel.id} style={styles.serviceCard}>
            <Text style={styles.serviceEmoji}>{hotel.image}</Text>
            <Text style={styles.serviceName}>{hotel.name}</Text>
            <Text style={styles.serviceDesc}>{hotel.description}</Text>
            <Text style={styles.serviceRating}>⭐ {hotel.rating}</Text>
            <Text style={styles.serviceLocation}>📍 {hotel.location}</Text>
            <Text style={styles.servicePrice}>${hotel.price}/night</Text>
            <TouchableOpacity
              style={styles.bookButton}
              onPress={() => handleBookNow(hotel)}
            >
              <Text style={styles.bookButtonText}>Book Now</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

// Enhanced Barber Shop Component
const BarberShopComponent = ({ goBack, onBookNow }) => {
  const serviceData = [
    {
      id: 1,
      name: "Hair Cut & Styling",
      description: "Professional haircut with styling",
      price: "25.00",
      duration: "45 min",
      image: "✂️",
      provider: "Master Barber",
      location: "Main Street Salon"
    },
    {
      id: 2,
      name: "Beard Trim",
      description: "Professional beard trimming and shaping",
      price: "15.00",
      duration: "20 min",
      image: "🧔",
      provider: "Beard Specialist",
      location: "Main Street Salon"
    },
    {
      id: 3,
      name: "Hair Wash & Treatment",
      description: "Deep cleaning with hair treatment",
      price: "30.00",
      duration: "30 min",
      image: "🧴",
      provider: "Hair Care Expert",
      location: "Main Street Salon"
    }
  ];

  const handleBookNow = (service) => {
    onBookNow({
      id: service.id,
      title: service.name,
      description: service.description,
      price: service.price,
      type: 'barber',
      category: 'Barber Shop',
      duration: service.duration,
      provider: service.provider,
      location: service.location
    });
  };

  return (
    <ScrollView style={styles.serviceContainer}>
      <View style={styles.serviceHeader}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.serviceTitle}>Barber Shop</Text>
      </View>

      <View style={styles.serviceGrid}>
        {serviceData.map((service) => (
          <View key={service.id} style={styles.serviceCard}>
            <Text style={styles.serviceEmoji}>{service.image}</Text>
            <Text style={styles.serviceName}>{service.name}</Text>
            <Text style={styles.serviceDesc}>{service.description}</Text>
            <Text style={styles.serviceDuration}>⏱️ Duration: {service.duration}</Text>
            <Text style={styles.serviceLocation}>📍 {service.location}</Text>
            <Text style={styles.servicePrice}>${service.price}</Text>
            <TouchableOpacity
              style={styles.bookButton}
              onPress={() => handleBookNow(service)}
            >
              <Text style={styles.bookButtonText}>Book Now</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

// Enhanced Spa Center Component
const SpaCenterComponent = ({ goBack, onBookNow }) => {
  const serviceData = [
    {
      id: 1,
      name: "Full Body Massage",
      description: "Relaxing full body massage therapy",
      price: "80.00",
      duration: "90 min",
      image: "💆‍♀️",
      provider: "Certified Therapist",
      location: "Wellness Spa Center"
    },
    {
      id: 2,
      name: "Facial Treatment",
      description: "Deep cleansing facial with moisturizing",
      price: "60.00",
      duration: "60 min",
      image: "🧖‍♀️",
      provider: "Skincare Specialist",
      location: "Wellness Spa Center"
    },
    {
      id: 3,
      name: "Manicure & Pedicure",
      description: "Complete nail care treatment",
      price: "45.00",
      duration: "75 min",
      image: "💅",
      provider: "Nail Technician",
      location: "Wellness Spa Center"
    }
  ];

  const handleBookNow = (service) => {
    onBookNow({
      id: service.id,
      title: service.name,
      description: service.description,
      price: service.price,
      type: 'spa',
      category: 'Spa Center',
      duration: service.duration,
      provider: service.provider,
      location: service.location
    });
  };

  return (
    <ScrollView style={styles.serviceContainer}>
      <View style={styles.serviceHeader}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.serviceTitle}>Spa Center</Text>
      </View>

      <View style={styles.serviceGrid}>
        {serviceData.map((service) => (
          <View key={service.id} style={styles.serviceCard}>
            <Text style={styles.serviceEmoji}>{service.image}</Text>
            <Text style={styles.serviceName}>{service.name}</Text>
            <Text style={styles.serviceDesc}>{service.description}</Text>
            <Text style={styles.serviceDuration}>⏱️ Duration: {service.duration}</Text>
            <Text style={styles.serviceLocation}>📍 {service.location}</Text>
            <Text style={styles.servicePrice}>${service.price}</Text>
            <TouchableOpacity
              style={styles.bookButton}
              onPress={() => handleBookNow(service)}
            >
              <Text style={styles.bookButtonText}>Book Now</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

// Enhanced Gym Component
const GymComponent = ({ goBack, onBookNow }) => {
  const serviceData = [
    {
      id: 1,
      name: "Personal Training Session",
      description: "One-on-one fitness training",
      price: "50.00",
      duration: "60 min",
      image: "🏋️‍♂️",
      provider: "Certified Trainer",
      location: "Fitness Center"
    },
    {
      id: 2,
      name: "Group Fitness Class",
      description: "High-energy group workout session",
      price: "20.00",
      duration: "45 min",
      image: "🤸‍♀️",
      provider: "Fitness Instructor",
      location: "Fitness Center"
    },
    {
      id: 3,
      name: "Yoga Session",
      description: "Relaxing yoga and meditation",
      price: "25.00",
      duration: "60 min",
      image: "🧘‍♀️",
      provider: "Yoga Instructor",
      location: "Fitness Center"
    }
  ];

  const handleBookNow = (service) => {
    onBookNow({
      id: service.id,
      title: service.name,
      description: service.description,
      price: service.price,
      type: 'gym',
      category: 'Gym',
      duration: service.duration,
      provider: service.provider,
      location: service.location
    });
  };

  return (
    <ScrollView style={styles.serviceContainer}>
      <View style={styles.serviceHeader}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.serviceTitle}>Gym</Text>
      </View>

      <View style={styles.serviceGrid}>
        {serviceData.map((service) => (
          <View key={service.id} style={styles.serviceCard}>
            <Text style={styles.serviceEmoji}>{service.image}</Text>
            <Text style={styles.serviceName}>{service.name}</Text>
            <Text style={styles.serviceDesc}>{service.description}</Text>
            <Text style={styles.serviceDuration}>⏱️ Duration: {service.duration}</Text>
            <Text style={styles.serviceLocation}>📍 {service.location}</Text>
            <Text style={styles.servicePrice}>${service.price}</Text>
            <TouchableOpacity
              style={styles.bookButton}
              onPress={() => handleBookNow(service)}
            >
              <Text style={styles.bookButtonText}>Book Now</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

// Your existing BookingDetailsScreen component (unchanged)
const BookingDetailsScreen = ({ bookingData, onConfirm, goBack }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  const timeSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];
  
  const getNextDays = () => {
    const days = [];
    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push({
        date: date.toISOString().split('T')[0],
        display: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      });
    }
    return days;
  };

  const handleConfirm = () => {
    if (!selectedDate || !selectedTime || !customerName || !customerEmail || !customerPhone) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    const bookingDetails = {
      date: selectedDate,
      time: selectedTime,
      customerName,
      customerEmail,
      customerPhone,
      specialRequests,
      bookingId: `BK${Date.now()}`,
      timestamp: new Date().toISOString()
    };

    onConfirm(bookingDetails);
  };

  return (
    <ScrollView style={styles.detailsContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.detailsHeader}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.detailsTitle}>Booking Details</Text>
      </View>

      {/* Service Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Service Summary</Text>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryService}>{bookingData?.title}</Text>
          <Text style={styles.summaryDesc}>{bookingData?.description}</Text>
          <Text style={styles.summaryPrice}>${bookingData?.price}</Text>
          {bookingData?.duration && (
            <Text style={styles.summaryDuration}>Duration: {bookingData.duration}</Text>
          )}
          {bookingData?.location && (
            <Text style={styles.summaryLocation}>📍 {bookingData.location}</Text>
          )}
        </View>
      </View>

      {/* Date Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Date</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
          {getNextDays().map((day) => (
            <TouchableOpacity
              key={day.date}
              style={[styles.dateCard, selectedDate === day.date && styles.selectedCard]}
              onPress={() => setSelectedDate(day.date)}
            >
              <Text style={[styles.dateText, selectedDate === day.date && styles.selectedText]}>
                {day.display}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Time Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Time</Text>
        <View style={styles.timeGrid}>
          {timeSlots.map((time) => (
            <TouchableOpacity
              key={time}
              style={[styles.timeCard, selectedTime === time && styles.selectedCard]}
              onPress={() => setSelectedTime(time)}
            >
              <Text style={[styles.timeText, selectedTime === time && styles.selectedText]}>
                {time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Customer Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customer Information</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Full Name *"
          value={customerName}
          onChangeText={setCustomerName}
          placeholderTextColor="#999"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Email Address *"
          value={customerEmail}
          onChangeText={setCustomerEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#999"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Phone Number *"
          value={customerPhone}
          onChangeText={setCustomerPhone}
          keyboardType="phone-pad"
          placeholderTextColor="#999"
        />
        
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Special Requests (Optional)"
          value={specialRequests}
          onChangeText={setSpecialRequests}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          placeholderTextColor="#999"
        />
      </View>

      <TouchableOpacity style={styles.proceedButton} onPress={handleConfirm}>
        <Text style={styles.proceedButtonText}>Proceed to Payment</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// Your existing PaymentScreen component (unchanged)
const PaymentScreen = ({ bookingData, onPaymentComplete, goBack }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('card');

  const calculateTotal = () => {
    const basePrice = parseFloat(bookingData?.price || 0);
    const tax = basePrice * 0.1;
    const serviceFee = 2.99;
    return (basePrice + tax + serviceFee).toFixed(2);
  };

  const handlePayment = () => {
    setIsProcessing(true);

    // Realistic static simulation
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      
      setTimeout(() => {
        const paymentData = {
          paymentMethod: activeTab,
          paymentId: `PAY${Date.now()}`,
          bookingId: bookingData?.bookingId || `BK${Date.now()}`,
          amount: calculateTotal(),
          status: 'completed',
          processedAt: new Date().toISOString()
        };
        onPaymentComplete(paymentData);
      }, 1200);
    }, 1800);
  };

  if (isProcessing) {
    return (
      <View style={[styles.processingWrapper, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}>
        <ActivityIndicator size="large" color="#348f9f" />
        <Text style={styles.processingTitle}>Securing Booking</Text>
        <Text style={styles.processingSub}>Validating Transaction...</Text>
      </View>
    );
  }

  if (isSuccess) {
    return (
      <View style={[styles.successWrapper, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}>
        <View style={styles.successIconCircle}>
            <Text style={styles.successCheck}>✓</Text>
        </View>
        <Text style={styles.successMainTitle}>Success</Text>
        <Text style={styles.successMainSub}>Booking confirmed successfully.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.paymentContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.detailsHeader, { paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 40) : 20 }]}>
          <TouchableOpacity style={styles.backButton} onPress={goBack}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.detailsTitle}>Checkout</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.luxeSummaryLabel}>SUMMARY</Text>
          <View style={styles.summaryCard}>
              <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Amount</Text>
                  <Text style={styles.priceValue}>${bookingData?.price}</Text>
              </View>
              <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Service Fee</Text>
                  <Text style={styles.priceValue}>$2.99</Text>
              </View>
              <View style={styles.divider} />
              <View style={[styles.priceRow, { marginTop: 4 }]}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>${calculateTotal()}</Text>
              </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.luxeSummaryLabel}>PAYMENT METHOD</Text>
          <View style={styles.methodPicker}>
              <TouchableOpacity 
                  style={[styles.methodBtn, activeTab === 'card' && styles.methodBtnActive]}
                  onPress={() => setActiveTab('card')}
              >
                  <Text style={[styles.methodBtnTxt, activeTab === 'card' && styles.methodBtnTxtActive]}>CARD</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                  style={[styles.methodBtn, activeTab === 'upi' && styles.methodBtnActive]}
                  onPress={() => setActiveTab('upi')}
              >
                  <Text style={[styles.methodBtnTxt, activeTab === 'upi' && styles.methodBtnTxtActive]}>UPI</Text>
              </TouchableOpacity>
          </View>

          {activeTab === 'card' ? (
              <View style={styles.luxeForm}>
                  <TextInput style={styles.luxeStaticInput} placeholder="Card Number" placeholderTextColor="#94A3B8" keyboardType="numeric" />
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                      <TextInput style={[styles.luxeStaticInput, { flex: 1 }]} placeholder="MM/YY" placeholderTextColor="#94A3B8" keyboardType="numeric" />
                      <TextInput style={[styles.luxeStaticInput, { flex: 1 }]} placeholder="CVV" placeholderTextColor="#94A3B8" secureTextEntry keyboardType="numeric" />
                  </View>
              </View>
          ) : (
              <View style={styles.luxeForm}>
                  <TextInput style={styles.luxeStaticInput} placeholder="UPI ID (e.g. user@okaxis)" placeholderTextColor="#94A3B8" autoCapitalize="none" />
              </View>
          )}
        </View>

        <TouchableOpacity style={styles.luxePayBtn} onPress={handlePayment}>
            <Text style={styles.luxePayBtnTxt}>PAY NOW</Text>
        </TouchableOpacity>
        
        <Text style={styles.luxeTrustText}>
          SECURE 256-BIT SSL ENCRYPTED
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  // Luxe Ultra Styles
  processingWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  processingTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1E293B',
    marginTop: 24,
  },
  processingSub: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
    fontWeight: '600',
  },
  successWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  successIconCircle: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: '#F0FDFA',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 30,
  },
  successCheck: {
      fontSize: 48,
      color: '#10B981',
      fontWeight: '900',
  },
  successMainTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#10B981',
    marginBottom: 8,
  },
  successMainSub: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  luxeSummaryLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#348f9f',
    letterSpacing: 2,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  methodPicker: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 6,
    marginBottom: 24,
  },
  methodBtn: {
    flex: 1,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  methodBtnActive: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  methodBtnTxt: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  methodBtnTxtActive: {
    color: '#1E293B',
  },
  luxeForm: {
    gap: 12,
  },
  luxeStaticInput: {
    height: 56,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  luxePayBtn: {
    backgroundColor: '#1E293B',
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    marginHorizontal: 15,
  },
  luxePayBtnTxt: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  luxeTrustText: {
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    marginTop: 20,
    marginBottom: 40,
    letterSpacing: 1,
  },
  // Main container styles
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#f8f9fa',
  },
  buttonContainer: {
    width: '100%',
    marginTop: 16,
  },
  button: {
    backgroundColor: '#57c357ff',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginVertical: 8,
    alignItems: 'center',
  },
  historyButton: {
    backgroundColor: '#2196F3',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  
  // Service component styles
  serviceContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  serviceTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  backButton: {
    paddingRight: 15,
  },
  backText: {
    fontSize: 16,
    color: '#57c357ff',
    fontWeight: '600',
  },
  serviceGrid: {
    padding: 15,
  },
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  serviceEmoji: {
    fontSize: 30,
    textAlign: 'center',
    marginBottom: 10,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  serviceDesc: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 20,
  },
  serviceRating: {
    fontSize: 14,
    color: '#57c357ff',
    textAlign: 'center',
    marginBottom: 5,
  },
  serviceDuration: {
    fontSize: 14,
    color: '#57c357ff',
    textAlign: 'center',
    marginBottom: 5,
  },
  serviceLocation: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 5,
  },
  servicePrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#57c357ff',
    textAlign: 'center',
    marginBottom: 15,
  },
  bookButton: {
    backgroundColor: '#57c357ff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignSelf: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Booking details styles
  detailsContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 8,
    borderRadius: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  summaryCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
  },
  summaryService: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  summaryDesc: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  summaryPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#57c357ff',
    marginBottom: 5,
  },
  summaryDuration: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  summaryLocation: {
    fontSize: 14,
    color: '#666',
  },
  dateScroll: {
    marginHorizontal: -10,
  },
  dateCard: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 5,
    minWidth: 80,
    alignItems: 'center',
  },
  selectedCard: {
    backgroundColor: '#57c357ff',
  },
  dateText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  selectedText: {
    color: '#fff',
    fontWeight: '600',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeCard: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
    width: '48%',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  proceedButton: {
    backgroundColor: '#57c357ff',
    paddingVertical: 16,
    marginHorizontal: 15,
    marginVertical: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  proceedButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  
  // Payment screen styles
  paymentContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  paymentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  priceBreakdown: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 10,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  priceValue: {
    fontSize: 14,
    color: '#333',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#57c357ff',
  },
  paymentMethods: {
    gap: 10,
  },
  paymentOption: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
  },
  selectedPayment: {
    borderColor: '#57c357ff',
    backgroundColor: '#f0f8f0',
  },
  paymentText: {
    fontSize: 16,
    color: '#333',
  },
  selectedPaymentText: {
    color: '#57c357ff',
    fontWeight: '600',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  payButton: {
    backgroundColor: '#57c357ff',
    paddingVertical: 16,
    marginHorizontal: 15,
    marginVertical: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  payButtonDisabled: {
    backgroundColor: '#ccc',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  securityNote: {
    paddingHorizontal: 15,
    paddingBottom: 30,
    alignItems: 'center',
  },
  securityText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default BookingScreen;