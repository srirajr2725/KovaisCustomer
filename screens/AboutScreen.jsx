// AboutScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  StatusBar,
  SafeAreaView,
  Platform,
} from 'react-native';
import { 
  ChevronLeft, 
  MapPin, 
  Star, 
  Clock, 
  X,
  Zap,
  ShieldCheck,
  Heart,
  ChevronRight
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const data = [
  {
    id: '1',
    title: 'Luxury AC Room',
    image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=1000&auto=format&fit=crop',
    description: 'Experience ultimate comfort in our luxury air-conditioned rooms.',
    bookingType: 'Hotel',
    details: {
      fullDescription: 'Experience ultimate comfort in our luxury air-conditioned rooms designed for the modern traveler. Each room features premium amenities and elegant furnishing.',
      features: [
        'Split AC with individual temperature control',
        'King-size bed with premium mattress',
        'Free high-speed WiFi',
        '42-inch LED TV with cable channels',
        '24/7 room service',
        'Daily housekeeping',
        'Premium toiletries'
      ],
      price: '₹3,500/night',
      rating: '4.8',
    }
  },
  {
    id: '2',
    title: 'Fine Spa',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUTNVSkQc138Xe4jwv8WANRk4lWqaqh3fYCyT3mR-zVJ6J4n6lVxxDmLVxM3dMh9VHuPs&usqp=CAU',
    description: 'Enjoy relaxing spa therapies and body treatments.',
    bookingType: 'Spa',
    details: {
      fullDescription: 'Rejuvenate your mind, body, and soul at our world-class spa facility. Our expert therapists provide personalized treatments using premium products.',
      features: [
        'Full body massage therapy',
        'Aromatherapy sessions',
        'Hot stone massage',
        'Couple spa packages',
        'Steam and sauna facilities',
        'Meditation room',
        'Professional therapists'
      ],
      price: 'From ₹2,000',
      rating: '4.9',
    }
  },
  {
    id: '3',
    title: 'Modern Gym',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop',
    description: 'Stay fit with state-of-the-art gym facilities.',
    bookingType: 'Gym',
    details: {
      fullDescription: 'Maintain your fitness routine with our fully equipped modern gymnasium. Features latest equipment and professional training support.',
      features: [
        'Latest cardio equipment',
        'Complete weight training setup',
        'Personal trainer available',
        'Yoga and stretching area',
        'Changing rooms with lockers',
        'Towel service',
        '24/7 access for guests',
        'Air-conditioned environment'
      ],
      price: 'Included',
      rating: '4.7',
    }
  },
  {
    id: '4',
    title: 'Grooming Lounge',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1000&auto=format&fit=crop',
    description: 'Premium grooming services for your style.',
    bookingType: 'Barber',
    details: {
      fullDescription: 'Exclusive grooming services for men including executive haircuts, beard styling, and facials. High-clarity equipment and expert barbers.',
      features: [
        'Classic and modern haircuts',
        'Royal beard grooming',
        'Facial and skin treatments',
        'Hair coloring services',
        'Relaxing head massage',
        'Premium styling products',
        'Appointments preferred'
      ],
      price: 'From ₹500',
      rating: '5.0',
    }
  }
];

const ExecutiveHeader = ({ title, onBack, isDarkMode }) => (
  <View style={[styles.luxeExecutiveHeader, isDarkMode && styles.luxeExecutiveHeaderDark]}>
    <View style={styles.luxeHeaderContent}>
      {onBack && (
        <TouchableOpacity onPress={onBack} style={[styles.luxeHeaderBackBtn, isDarkMode && styles.luxeHeaderBackBtnDark]}>
          <ChevronLeft size={24} color="#348f9f" />
        </TouchableOpacity>
      )}
      <View style={styles.luxeHeaderTitleWrapper}>
        <Text style={styles.luxeHeaderPrestige}>PRESTIGE</Text>
        <Text style={[styles.luxeHeaderMainTitle, isDarkMode && styles.luxeHeaderMainTitleDark]}>{title}</Text>
      </View>
      <View style={[styles.luxeHeaderProfile, isDarkMode && styles.luxeHeaderProfileDark]}>
        <ShieldCheck size={20} color="#348f9f" />
      </View>
    </View>
  </View>
);

const DetailModal = ({ visible, item, onClose, onBooking, isDarkMode }) => {
  if (!item) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={[styles.modalOverlay, isDarkMode && styles.modalOverlayDark]}>
        <View style={[styles.modalContainer, isDarkMode && styles.modalContainerDark]}>
          <Image source={{ uri: item.image }} style={styles.modalImage} />
          
          <TouchableOpacity style={styles.modalClose} onPress={onClose}>
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.modalHeaderInfo}>
              <View style={styles.badgeRow}>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeBadgeText}>{item.bookingType}</Text>
                </View>
                <View style={styles.ratingBadge}>
                  <Star size={12} color="#348f9f" fill="#348f9f" />
                  <Text style={styles.ratingText}>{item.details.rating}</Text>
                </View>
              </View>
              <Text style={[styles.modalTitle, isDarkMode && styles.modalTitleDark]}>{item.title}</Text>
              <Text style={styles.modalPrice}>{item.details.price}</Text>
            </View>

            <View style={[styles.modalDivider, isDarkMode && styles.modalDividerDark]} />

            <View style={styles.modalContentSection}>
              <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>Experience Overview</Text>
              <Text style={[styles.modalDescription, isDarkMode && styles.modalDescriptionDark]}>{item.details.fullDescription}</Text>
            </View>

            <View style={styles.modalContentSection}>
              <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>Premium Amenities</Text>
              {item.details.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Zap size={14} color="#348f9f" />
                  <Text style={[styles.featureText, isDarkMode && styles.featureTextDark]}>{feature}</Text>
                </View>
              ))}
            </View>
          </ScrollView>

          <View style={[styles.modalFooter, isDarkMode && styles.modalFooterDark]}>
            <TouchableOpacity 
              style={styles.modalPrimaryBtn}
              onPress={() => {
                onClose();
                onBooking(item.bookingType);
              }}
            >
              <Text style={styles.modalPrimaryBtnTxt}>Reserve Now</Text>
              <ChevronRight size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const AboutScreen = ({ navigateToBooking, goBack, navigation, isDarkMode }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleBack = () => {
    if (goBack) {
      goBack();
    } else if (navigation) {
      navigation.goBack();
    }
  };

  const handleBooking = (type) => {
    if (navigateToBooking) {
      navigateToBooking(type);
    } else if (navigation) {
      const screenMap = {
        'Hotel': 'Hotels',
        'Spa': 'SpaBooking',
        'Gym': 'Gym',
        'Barber': 'BarberShop'
      };
      navigation.navigate(screenMap[type] || 'Home');
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={isDarkMode ? "#121212" : "#FFFFFF"} />
      <ExecutiveHeader title="About Kovais" onBack={handleBack} isDarkMode={isDarkMode} />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
      >
        {/* Luxury Hero Section */}
        <View style={[styles.luxeHeroSection, isDarkMode && styles.luxeHeroSectionDark]}>
          <Text style={styles.luxeHeroPre}>DISCOVER</Text>
          <Text style={[styles.luxeHeroTitle, isDarkMode && styles.luxeHeroTitleDark]}>Prestige Experience</Text>
          <Text style={[styles.luxeHeroSub, isDarkMode && styles.luxeHeroSubDark]}>
            Unveiling a new world of hospitality and wellness where every detail is curated for your excellence.
          </Text>
        </View>

        {/* Facility Grid */}
        <View style={styles.gridContainer}>
          {data.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.luxeCard, isDarkMode && styles.luxeCardDark]} 
              activeOpacity={0.9}
              onPress={() => {
                setSelectedItem(item);
                setModalVisible(true);
              }}
            >
              <Image source={{ uri: item.image }} style={styles.luxeCardImage} />
              <View style={styles.luxeCardContent}>
                <View style={styles.luxeCardHeader}>
                  <Text style={[styles.luxeCardTitle, isDarkMode && styles.luxeCardTitleDark]}>{item.title}</Text>
                  <View style={styles.luxeRating}>
                    <Star size={12} color="#348f9f" fill="#348f9f" />
                    <Text style={styles.luxeRatingValue}>{item.details.rating}</Text>
                  </View>
                </View>
                <Text style={[styles.luxeCardDesc, isDarkMode && styles.luxeCardDescDark]} numberOfLines={2}>{item.description}</Text>
                
                <View style={[styles.luxeCardDivider, isDarkMode && styles.luxeCardDividerDark]} />
                
                <View style={styles.luxeCardFooter}>
                  <View style={[styles.luxeBadge, isDarkMode && styles.luxeBadgeDark]}>
                    <Text style={styles.luxeBadgeTxt}>{item.bookingType}</Text>
                  </View>
                  <TouchableOpacity style={styles.luxeCircleBtn}>
                    <ChevronRight size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Commitment Banner */}
        <View style={[styles.luxeTrustBanner, isDarkMode && styles.luxeTrustBannerDark]}>
          <View style={styles.trustItem}>
            <ShieldCheck size={32} color="#348f9f" />
            <Text style={[styles.trustItemTitle, isDarkMode && styles.trustItemTitleDark]}>Secured</Text>
          </View>
          <View style={styles.trustItem}>
            <Zap size={32} color="#348f9f" />
            <Text style={[styles.trustItemTitle, isDarkMode && styles.trustItemTitleDark]}>Instant</Text>
          </View>
          <View style={styles.trustItem}>
            <Heart size={32} color="#348f9f" />
            <Text style={[styles.trustItemTitle, isDarkMode && styles.trustItemTitleDark]}>Premium</Text>
          </View>
        </View>
      </ScrollView>

      <DetailModal 
        visible={modalVisible} 
        item={selectedItem} 
        onClose={() => setModalVisible(false)}
        onBooking={handleBooking}
        isDarkMode={isDarkMode}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  // Executive Header
  luxeExecutiveHeader: {
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 0 : 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  luxeExecutiveHeaderDark: {
    backgroundColor: '#121212',
    borderBottomColor: '#334155',
  },
  luxeHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  luxeHeaderBackBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  luxeHeaderBackBtnDark: {
    backgroundColor: '#1E293B',
  },
  luxeHeaderTitleWrapper: {
    alignItems: 'center',
  },
  luxeHeaderPrestige: {
    fontSize: 10,
    fontWeight: '800',
    color: '#348f9f',
    letterSpacing: 3,
    marginBottom: 2,
  },
  luxeHeaderMainTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
  },
  luxeHeaderMainTitleDark: {
    color: '#F8FAFC',
  },
  luxeHeaderProfile: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  luxeHeaderProfileDark: {
    backgroundColor: '#1E293B',
  },
  // Hero Section
  luxeHeroSection: {
    padding: 30,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  luxeHeroSectionDark: {
    backgroundColor: '#121212',
  },
  luxeHeroPre: {
    fontSize: 12,
    fontWeight: '800',
    color: '#348f9f',
    letterSpacing: 4,
    marginBottom: 8,
  },
  luxeHeroTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1E293B',
    marginBottom: 16,
    textAlign: 'center',
  },
  luxeHeroTitleDark: {
    color: '#F8FAFC',
  },
  luxeHeroSub: {
    fontSize: 15,
    color: '#64748B',
    lineHeight: 24,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  luxeHeroSubDark: {
    color: '#94A3B8',
  },
  // Grid and Cards
  gridContainer: {
    paddingHorizontal: 20,
  },
  luxeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  luxeCardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  luxeCardImage: {
    width: '100%',
    height: 200,
  },
  luxeCardContent: {
    padding: 20,
  },
  luxeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  luxeCardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
  },
  luxeCardTitleDark: {
    color: '#F8FAFC',
  },
  luxeRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  luxeRatingValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#348f9f',
  },
  luxeCardDesc: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 16,
  },
  luxeCardDescDark: {
    color: '#94A3B8',
  },
  luxeCardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 16,
  },
  luxeCardDividerDark: {
    backgroundColor: '#334155',
  },
  luxeCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  luxeBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  luxeBadgeDark: {
    backgroundColor: '#0F172A',
  },
  luxeBadgeTxt: {
    fontSize: 12,
    fontWeight: '700',
    color: '#348f9f',
    textTransform: 'uppercase',
  },
  luxeCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#348f9f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Trust Banner
  luxeTrustBanner: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 30,
    marginHorizontal: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    marginTop: 10,
  },
  luxeTrustBannerDark: {
    backgroundColor: '#1E293B',
  },
  trustItem: {
    alignItems: 'center',
    gap: 8,
  },
  trustItemTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
  },
  trustItemTitleDark: {
    color: '#CBD5E1',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalOverlayDark: {
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    height: height * 0.85,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
  },
  modalContainerDark: {
    backgroundColor: '#121212',
  },
  modalImage: {
    width: '100%',
    height: 250,
  },
  modalClose: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScroll: {
    padding: 24,
  },
  modalHeaderInfo: {
    marginBottom: 24,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  typeBadge: {
    backgroundColor: '#E0F2F1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  typeBadgeText: {
    color: '#348f9f',
    fontWeight: '800',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1E293B',
    marginBottom: 8,
  },
  modalTitleDark: {
    color: '#F8FAFC',
  },
  modalPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#348f9f',
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 24,
  },
  modalDividerDark: {
    backgroundColor: '#334155',
  },
  modalContentSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  sectionTitleDark: {
    color: '#F8FAFC',
  },
  modalDescription: {
    fontSize: 15,
    color: '#64748B',
    lineHeight: 24,
  },
  modalDescriptionDark: {
    color: '#94A3B8',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  featureText: {
    fontSize: 15,
    color: '#334155',
    fontWeight: '600',
  },
  featureTextDark: {
    color: '#CBD5E1',
  },
  modalFooter: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  modalFooterDark: {
    borderTopColor: '#334155',
    backgroundColor: '#121212',
  },
  modalPrimaryBtn: {
    backgroundColor: '#348f9f',
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  modalPrimaryBtnTxt: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});

export default AboutScreen;