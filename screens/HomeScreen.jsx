import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  LayoutAnimation,
  Platform,
  UIManager,
  Animated,
  Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  Scissors,
  Hotel,
  Sparkles,
  Dumbbell,
  Music,
  Heart,
  ChevronRight,
  Star,
  Clock,
  MapPin,
  User,
  Shield,
  Award,
  CircleCheck,
  Trophy,
  Gift,
  X
} from 'lucide-react-native';
import { useAuth } from './AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Footer from './BookingScreens/Footer';
import Hotels from './BookingScreens/Hotels';
import Spa from './BookingScreens/SpaCenter';
import Gym from './BookingScreens/Gym';
import Barber from './BookingScreens/BarberShop';
import AboutScreen from './AboutScreen';
import Functions from './BookingScreens/Function';
import Funeral from './BookingScreens/Funeral';
import Beauty from './BookingScreens/Beauty';
import GentsParlour from './BookingScreens/GentsParlour';
import LadiesParlour from './BookingScreens/LadiesParlour';

const { width, height } = Dimensions.get('window');


const sliderData = [
  {
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop',
    title: 'Luxury Suites',
    subtitle: 'Experience comfort and elegance in our premium royal suites'
  },
  {
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1974&auto=format&fit=crop',
    title: 'Grooming',
    subtitle: 'Professional hair styling by master industrial barbers'
  },
  {
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop',
    title: 'Zen Spa',
    subtitle: 'Rejuvenate your soul with clinical therapy sessions'
  },
  {
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop',
    title: 'Elite Club Gym',
    subtitle: 'Pre-book your workout at our state-of-the-art facility'
  },
];

const offersData = [
  {
    id: '1',
    title: 'Weekend Getaway',
    discount: '30% OFF',
    description: 'Book a luxury suite for 2 nights and get 30% off.',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop',
    color: '#FF6B6B',
    service: 'Hotel'
  },
  {
    id: '2',
    title: 'Grooming Special',
    discount: 'FREE SPA',
    description: 'Get a free head massage with any premium haircut.',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070&auto=format&fit=crop',
    color: '#4ECDC4',
    service: 'Barber'
  },
  {
    id: '3',
    title: 'Annual Gym Pass',
    discount: '2 MONTHS FREE',
    description: 'Join today and get two months absolutely free!',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop',
    color: '#FFD93D',
    service: 'Gym'
  },
  {
    id: '4',
    title: 'Beauty Essentials',
    discount: 'BUY 2 GET 1',
    description: 'Purchase any two Kovais Elite products and get one free!',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?q=80&w=2070&auto=format&fit=crop',
    color: '#A55EE1',
    service: 'Beauty'
  },
  {
    id: '5',
    title: 'Family Ritual Pack',
    discount: '25% FLAT OFF',
    description: 'Special discount for families booking together for doorstep rituals.',
    image: 'https://images.pexels.com/photos/1683975/pexels-photo-1683975.jpeg',
    color: '#FF9F43',
    service: 'Funeral'
  },
  {
    id: '6',
    title: 'Thiran360 AI Privilege',
    discount: 'CORPORATE 30%',
    description: 'Exclusive grooming & wellness benefits for thiran360 AI employees.',
    image: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg',
    color: '#2E86DE',
    service: 'GentsParlour'
  }
];

const services = [
  {
    title: 'Barber Shop',
    description: '24 Hours Doorstep professional master barbers.',
    image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop',
    icon: Scissors,
    color: '#1e293b'
  },
  {
    title: 'Hotel',
    description: 'Luxury stay with 24 Hours room service.',
    image: 'https://media.istockphoto.com/id/472899538/photo/downtown-cleveland-hotel-entrance-and-waiting-taxi-cab.jpg?s=612x612&w=0&k=20&c=rz-WSe_6gKfkID6EL9yxCdN_UIMkXUBsr67884j-X9o=',
    icon: Hotel,
    color: '#2c3e50'
  },
  {
    title: 'Spa',
    description: '24 Hours Doorstep relaxing therapy.',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUTNVSkQc138Xe4jwv8WANRk4lWqaqh3fYCyT3mR-zVJ6J4n6lVxxDmLVxM3dMh9VHuPs&usqp=CAU',
    icon: Sparkles,
    color: '#6c5ce7'
  },
  {
    title: 'Gym',
    description: 'Pre-book your 24 Hours fitness session.',
    image: 'https://media.istockphoto.com/id/1277242852/photo/holding-weight-and-sitting.jpg?s=612x612&w=0&k=20&c=3sy-VVhUYjABpNEMI2aoruXQuOVb__-AUR6BzOHoSJg=',
    icon: Dumbbell,
    color: '#e84393'
  },
  {
    title: 'Functions',
    description: '24 Hours Doorstep grooming for events.',
    image: 'https://images.pexels.com/photos/13918932/pexels-photo-13918932.jpeg',
    icon: Music,
    color: '#fdcb6e'
  },
  {
    title: 'Funeral',
    description: 'Professional 24 Hours doorstep ritual services.',
    image: 'https://i.pinimg.com/webp/1200x/53/6c/63/536c6323d439596e766f055498e775e4.webp',
    icon: Heart,
    color: '#d63031'
  },
  {
    title: 'Beauty',
    description: 'Premium grooming & skin care products.',
    image: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?q=80&w=1976&auto=format&fit=crop',
    icon: Sparkles,
    color: '#a55ee1'
  },
];

const kovaiAmenities = [
  {
    title: "Infinity Pool",
    description: "Dive into pure bliss at our stunning infinity pool, offering breathtaking views and serene relaxation.",
    image: "https://images.pexels.com/photos/870170/pexels-photo-870170.jpeg?cs=srgb&dl=pexels-marctutorials-298692-870170.jpg&fm=jpg",
  },
  {
    title: "State-of-the-Art Gym",
    description: "Maintain your fitness routine with our modern gym, equipped with the latest machines and expert trainers.",
    image: "https://media-cdn.tripadvisor.com/media/photo-s/0f/18/03/ae/state-of-the-art-modern.jpg",
  },
  {
    title: "Gourmet Dining",
    description: "Savor exquisite flavors in our elegant restaurant, where culinary masterpieces await.",
    image: "https://assets.simpleviewinc.com/simpleview/image/upload/c_fill,f_jpg,g_xy_center,h_399,q_65,w_639,x_378,y_642/v1/clients/charlotteharbor-redesign/Fine_Dining_At_The_Perfect_Caper_23c8ab17-b39f-4909-8a1d-ee91a9a42dfe.jpg",
  },
  {
    title: "Lush Gardens",
    description: "Stroll through our beautifully landscaped gardens, a perfect escape for peace and tranquility.",
    image: "https://plus.unsplash.com/premium_photo-1713991088871-614d45da7fdb?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

const serviceComponents = {
  Hotel: Hotels,
  Spa: Spa,
  Gym: Gym,
  'Gents Parlour': GentsParlour,
  'Ladies Parlour': LadiesParlour,
  Functions: Functions,
  Funeral: Funeral,
  Beauty: Beauty,
  Barber: Barber,
  'Barber Shop': Barber,
  GentsParlour: GentsParlour,
};

// Offer Card Component
const OfferCard = ({ offer, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.offerCard}
      activeOpacity={0.9}
      onPress={onPress}
    >
      <Image source={{ uri: offer.image }} style={styles.offerImage} resizeMode="cover" />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.85)']}
        style={styles.offerGradient}
      />
      <View style={styles.offerBadge}>
        <Text style={styles.offerBadgeText}>{offer.discount}</Text>
      </View>
      <View style={styles.offerContent}>
        <Text style={styles.offerTitle}>{offer.title}</Text>
        <Text style={styles.offerDesc} numberOfLines={2}>{offer.description}</Text>
        <View style={styles.offerButton}>
          <Text style={styles.offerButtonText}>Claim Offer</Text>
          <ChevronRight size={14} color="#FFF" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Animated Service Card Component
const AnimatedServiceCard = ({ service, onPress, index }) => {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const IconComponent = service.icon;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay: index * 100,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        delay: index * 100,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        delay: index * 100,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.card,
        {
          transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
          opacity: fadeAnim,
        },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        style={styles.cardTouchable}
      >
        <View style={styles.cardImageContainer}>
          <Image source={{ uri: service.image }} style={styles.cardFullImage} resizeMode="cover" />
          <View style={styles.cardFullGradient} />
        </View>

        <View style={[styles.cardFloatingBadge, { backgroundColor: service.color }]}>
          <IconComponent size={20} color="#FFF" />
        </View>

        <View style={styles.cardContentOverlay}>
          <View>
            <Text style={styles.cardFullTitle}>{service.title}</Text>
            <Text style={styles.cardFullDesc} numberOfLines={2}>
              {service.description}
            </Text>
          </View>
          <View style={styles.cardActionRow}>
            <Text style={styles.cardActionText}>Book Now</Text>
            <View style={styles.cardActionIconWrapper}>
              <ChevronRight size={14} color="#348f9f" />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Animated Amenity Card Component
const AnimatedAmenityCard = ({ amenity, index }) => {
  const slideAnim = useRef(new Animated.Value(20)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        delay: index * 100 + 400,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        delay: index * 100 + 400,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay: index * 100 + 400,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.amenityCard,
        {
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          opacity: fadeAnim,
        },
      ]}
    >
      <Image source={{ uri: amenity.image }} style={styles.amenityImage} resizeMode="cover" />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.amenityGradient}
      />
      <View style={styles.amenityContent}>
        <Text style={styles.amenityLabel}>Experience</Text>
        <Text style={styles.amenityTitleText}>{amenity.title}</Text>
      </View>
    </Animated.View>
  );
};

const HomeScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [showAboutScreen, setShowAboutScreen] = useState(false);
  const [showParlourSelection, setShowParlourSelection] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const scrollRef = useRef(null);
  const offersRef = useRef(null);
  const headerFadeAnim = useRef(new Animated.Value(0)).current;
  const featuresAnim = useRef(new Animated.Value(0)).current;
  const featuresAnimLoop = useRef(null);

  useEffect(() => {
    Animated.timing(headerFadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    const checkReward = async () => {
      if (isAuthenticated && user) {
        try {
          const claimedKey = `reward_claimed_${user.user_id}`;
          const claimed = await AsyncStorage.getItem(claimedKey);
          if (!claimed) {
            // Delay slightly for better impact after login
            setTimeout(() => {
              setShowRewardModal(true);
            }, 1500);
          }
        } catch (error) {
          console.error('Error checking reward status:', error);
        }
      }
    };
    checkReward();
  }, [isAuthenticated, user]);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [selectedComponent, showAboutScreen]);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % sliderData.length;
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ x: nextIndex * width, animated: true });
      }
      setCurrentIndex(nextIndex);
    }, 3000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  useEffect(() => {
    const featureCount = 4;
    const badgeWidth = 165;
    const totalWidth = featureCount * badgeWidth;

    const startFeaturesAnimation = () => {
      featuresAnim.setValue(0);
      featuresAnimLoop.current = Animated.loop(
        Animated.timing(featuresAnim, {
          toValue: -totalWidth,
          duration: 12000,
          easing: (t) => t,
          useNativeDriver: true,
        })
      );
      featuresAnimLoop.current.start();
    };

    if (selectedComponent || showAboutScreen || showParlourSelection) {
      if (featuresAnimLoop.current) {
        featuresAnimLoop.current.stop();
      }
    } else {
      startFeaturesAnimation();
    }

    return () => {
      if (featuresAnimLoop.current) {
        featuresAnimLoop.current.stop();
      }
    };
  }, [selectedComponent, showAboutScreen, showParlourSelection]);


  const handleNavigateToBooking = (bookingType) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const ComponentToShow = serviceComponents[bookingType];
    if (ComponentToShow) {
      setShowAboutScreen(false);
      setTimeout(() => {
        setSelectedComponent(bookingType);
      }, 100);
    }
  };

  const navigateToAboutScreen = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedComponent(null);
    setShowAboutScreen(true);
  };

  const goBack = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedComponent(null);
    setShowAboutScreen(false);
  };

  const goBackFromAbout = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowAboutScreen(false);
  };

  const handleServiceNavigation = (serviceTitle) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (serviceTitle === 'Unisex Parlour') {
      setShowParlourSelection(true);
      return;
    }
    if (serviceComponents[serviceTitle]) {
      setSelectedComponent(serviceTitle);
    } else {
      console.error('Component not found for:', serviceTitle);
    }
  };

  const handleSelectParlour = (parlourType) => {
    setShowParlourSelection(false);
    setTimeout(() => {
      setSelectedComponent(parlourType);
    }, 100);
  };

  const handleClaimReward = async () => {
    if (user) {
      try {
        const claimedKey = `reward_claimed_${user.user_id}`;
        await AsyncStorage.setItem(claimedKey, 'true');
        setShowRewardModal(false);
        // We could also trigger a toast here if available in the parent
      } catch (error) {
        console.error('Error claiming reward:', error);
      }
    }
  };

  const renderSelectedComponent = () => {
    switch (selectedComponent) {
      case 'Hotel': return <Hotels goBack={goBack} />;
      case 'Spa': return <Spa goBack={goBack} />;
      case 'Gym': return <Gym goBack={goBack} />;
      case 'Gents Parlour': return <GentsParlour goBack={goBack} />;
      case 'Ladies Parlour': return <LadiesParlour goBack={goBack} />;
      case 'Functions': return <Functions goBack={goBack} />;
      case 'Funeral': return <Funeral goBack={goBack} />;
      case 'Beauty': return <Beauty goBack={goBack} />;
      case 'Barber': return <Barber goBack={goBack} />;
      case 'Barber Shop': return <Barber goBack={goBack} />;
      default: return null;
    }
  };

  if (showAboutScreen) {
    return <AboutScreen navigateToBooking={handleNavigateToBooking} goBack={goBackFromAbout} />;
  }

  if (selectedComponent) {
    return renderSelectedComponent();
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />

      {/* Parlour Selection Modal */}
      <Modal
        visible={showParlourSelection}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowParlourSelection(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowParlourSelection(false)}
        >
          <View style={styles.selectionCard}>
            <Text style={styles.selectionTitle}>Choose Your Parlour</Text>
            <Text style={styles.selectionSubtitle}>Select specialized service type</Text>

            <View style={styles.selectionOptions}>
              <TouchableOpacity
                style={[styles.selectionOption, { backgroundColor: '#348f9f10', borderColor: '#348f9f30' }]}
                onPress={() => handleSelectParlour('Gents Parlour')}
              >
                <View style={[styles.selectionIcon, { backgroundColor: '#348f9f' }]}>
                  <User size={24} color="#FFF" />
                </View>
                <Text style={[styles.selectionLabel, { color: '#348f9f' }]}>Gents</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.selectionOption, { backgroundColor: '#FF475710', borderColor: '#FF475730' }]}
                onPress={() => handleSelectParlour('Ladies Parlour')}
              >
                <View style={[styles.selectionIcon, { backgroundColor: '#FF4757' }]}>
                  <Sparkles size={24} color="#FFF" />
                </View>
                <Text style={[styles.selectionLabel, { color: '#FF4757' }]}>Ladies</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowParlourSelection(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Sign-up Reward Modal */}
      <Modal
        visible={showRewardModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowRewardModal(false)}
      >
        <View style={styles.rewardOverlay}>
          <LinearGradient
            colors={['rgba(255,255,255,0.95)', 'rgba(255,250,230,0.98)']}
            style={styles.rewardCard}
          >
            <TouchableOpacity
              style={styles.closeReward}
              onPress={() => setShowRewardModal(false)}
            >
              <X size={20} color="#94A3B8" />
            </TouchableOpacity>

            <View style={styles.rewardIconContainer}>
              <View style={styles.rewardIconInner}>
                <Gift size={40} color="#FFF" />
              </View>
              <View style={styles.sparkle1}><Sparkles size={16} color="#FFD700" /></View>
              <View style={styles.sparkle2}><Sparkles size={16} color="#FFD700" /></View>
            </View>

            <Text style={styles.rewardTitle}>Special Gift For You!</Text>
            <Text style={styles.rewardSubtitle}>Welcome to Kovais Elite! We've added a special reward to your account.</Text>

            <View style={styles.rewardAmountCard}>
              <View style={styles.rewardCoin}>
                <Trophy size={20} color="#FFD700" />
              </View>
              <Text style={styles.rewardValue}>200</Text>
              <Text style={styles.rewardUnit}>Points</Text>
            </View>

            <TouchableOpacity
              style={styles.claimButton}
              onPress={handleClaimReward}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#348f9f', '#216875']}
                style={styles.claimButtonGradient}
              >
                <Text style={styles.claimButtonText}>Claim Now</Text>
                <ChevronRight size={18} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.rewardTerms}>T&C Apply • First-time users only</Text>
          </LinearGradient>
        </View>
      </Modal>

      <ScrollView
        style={styles.page}
        scrollEventThrottle={16}
        removeClippedSubviews={true}
        showsVerticalScrollIndicator={false}
      >
        {/* Amazon-style Full Width Carousel */}
        <View style={styles.carouselContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            ref={scrollRef}
            onMomentumScrollEnd={(e) => {
              const newIndex = Math.floor(e.nativeEvent.contentOffset.x / width);
              setCurrentIndex(newIndex);
            }}
            decelerationRate="fast"
            snapToInterval={width}
            snapToAlignment="center"
          >
            {sliderData.map((item, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image
                  source={{ uri: item.image }}
                  style={styles.image}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={['rgba(0,0,0,0.4)', 'transparent', 'transparent', 'rgba(0,0,0,0.6)']}
                  style={styles.carouselGradient}
                />
                <View style={styles.welcomeCardContainer}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.05)']}
                    style={styles.welcomeCard}
                  >
                    <Text style={styles.welcomeGreeting}>{index === 0 ? 'Welcome to Kovais' : 'Experience'}</Text>
                    <Text style={styles.welcomeBrand}>{item.title}</Text>
                    <View style={styles.welcomeDivider} />
                    <Text style={styles.welcomeMessage}>{item.subtitle}</Text>
                  </LinearGradient>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.indicatorsWrapper}>
            <View style={styles.indicatorContainer}>
              {sliderData.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicator,
                    {
                      backgroundColor: index === currentIndex ? '#348f9f' : 'rgba(255, 255, 255, 0.5)',
                      width: index === currentIndex ? 24 : 8,
                    },
                  ]}
                />
              ))}
            </View>
          </View>
        </View>

        {/* Exclusive Offers Slider */}
        <View style={styles.offersSection}>
          <View style={styles.sectionHeaderCompact}>
            <View style={styles.headerTitleGroup}>
              <Sparkles size={20} color="#348f9f" />
              <Text style={styles.offersSectionTitle}>Exclusive Offers</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.offersSectionBody}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.offersScrollContent}
              decelerationRate="fast"
              snapToInterval={width * 0.75 + 15}
              snapToAlignment="start"
              ref={offersRef}
            >
              {offersData.map((offer) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  onPress={() => handleServiceNavigation(offer.service)}
                />
              ))}
            </ScrollView>
          </View>
        </View>

        {/* 24 Hours Doorstep Features Highlight */}
        <View style={styles.featuresBadgeContainer}>
          <Animated.View
            style={[
              styles.featuresTickerContainer,
              { transform: [{ translateX: featuresAnim }] }
            ]}
          >
            {[
              { icon: Clock, text: '24 Hours Service', color: '#348f9f' },
              { icon: MapPin, text: 'Doorstep Available', color: '#e84393' },
              { icon: Shield, text: 'Verified Experts', color: '#6c5ce7' },
              { icon: Sparkles, text: 'Premium Brands', color: '#fdcb6e' },
              // Duplicate for seamless loop
              { icon: Clock, text: '24 Hours Service', color: '#348f9f' },
              { icon: MapPin, text: 'Doorstep Available', color: '#e84393' },
              { icon: Shield, text: 'Verified Experts', color: '#6c5ce7' },
              { icon: Sparkles, text: 'Premium Brands', color: '#fdcb6e' },
            ].map((feature, idx) => (
              <View key={idx} style={styles.featureBadge}>
                <feature.icon size={16} color={feature.color} />
                <Text style={styles.featureBadgeText}>{feature.text}</Text>
              </View>
            ))}
          </Animated.View>
        </View>

        {/* Our Services Section */}
        <Animated.View style={[styles.servicesSection, { opacity: headerFadeAnim }]}>
          <View style={styles.sectionHeader}>
            <View style={styles.headerLine} />
            <Text style={styles.servicesTitle}>Our Premium Services</Text>
            <View style={styles.headerLine} />
          </View>
          <View style={styles.servicesList}>
            {services.map((service, index) => (
              <AnimatedServiceCard
                key={index}
                service={service}
                index={index}
                onPress={() => handleServiceNavigation(service.title)}
              />
            ))}
          </View>
        </Animated.View>

        {/* Amenities Section */}
        <View style={styles.amenitiesSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.headerLine} />
            <Text style={styles.amenitiesTitle}>Explore Kovai's Amenities</Text>
            <View style={styles.headerLine} />
          </View>
          <View style={styles.amenitiesList}>
            {kovaiAmenities.map((amenity, index) => (
              <AnimatedAmenityCard key={index} amenity={amenity} index={index} />
            ))}
          </View>
        </View>

        <Footer />
      </ScrollView>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  page: {
    flex: 1,
  },
  carouselContainer: {
    height: 250,
    width: width,
    position: 'relative',
    marginTop: 0,
  },
  imageWrapper: {
    width: width,
    height: 250,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  carouselGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  carouselOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  indicatorsWrapper: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  indicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backdropFilter: 'blur(10px)',
  },
  indicator: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },
  welcomeCardContainer: {
    position: 'absolute',
    top: 35,
    left: 20,
    right: 20,
  },
  welcomeCard: {
    padding: 24,
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  welcomeGreeting: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  welcomeBrand: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: '900',
    marginTop: -5,
    letterSpacing: -1.5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  welcomeDivider: {
    width: 40,
    height: 3,
    backgroundColor: '#348f9f',
    marginVertical: 8,
    borderRadius: 2,
  },
  welcomeMessage: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
    maxWidth: '80%',
  },
  servicesSection: {
    paddingHorizontal: 20,
    backgroundColor: '#F8F9FA',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 24,
    marginTop: -25,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    justifyContent: 'center',
    gap: 15,
  },
  headerLine: {
    height: 2,
    width: 40,
    backgroundColor: '#F1F5F9',
  },
  headerLineDark: {
    backgroundColor: '#1E293B',
  },
  servicesTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  featuresBadgeContainer: {
    backgroundColor: '#F8F9FA',
    overflow: 'hidden',
    height: 100,
    justifyContent: 'center',
    marginTop: -25,
  },
  featuresTickerContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    height: 75,
    alignItems: 'center',
  },
  featureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  featureBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  // Exclusive Offers Styles
  offersSection: {
    marginTop: 10,
    marginBottom: 20,
  },
  sectionHeaderCompact: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  offersSectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  viewAllText: {
    color: '#348f9f',
    fontWeight: '600',
    fontSize: 14,
  },
  offersScrollContent: {
    paddingLeft: 20,
    paddingRight: 5,
  },
  offerCard: {
    width: width * 0.75,
    height: 180,
    marginRight: 15,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#000',
    elevation: 8,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  offerImage: {
    width: '100%',
    height: '100%',
    opacity: 0.8,
  },
  offerGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  offerBadge: {
    position: 'absolute',
    top: 15,
    left: 15,
    backgroundColor: '#E74C3C',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  offerBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  offerContent: {
    position: 'absolute',
    bottom: 15,
    left: 15,
    right: 15,
  },
  offerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  offerDesc: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 10,
    maxWidth: '85%',
  },
  offerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#348f9f',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: 'flex-start',
    gap: 4,
  },
  offerButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  servicesTitleDark: {
    color: '#F8FAFC',
  },
  servicesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: (width - 55) / 2,
    height: 255,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    marginBottom: 20,
    shadowColor: '#348f9f',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTouchable: {
    flex: 1,
    position: 'relative',
  },
  cardImageContainer: {
    height: 140,
    width: '100%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  cardFullImage: {
    width: '100%',
    height: '100%',
  },
  cardFullGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  cardFloatingBadge: {
    position: 'absolute',
    top: 116,
    right: 15,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    zIndex: 10,
  },
  cardContentOverlay: {
    padding: 16,
    paddingTop: 18,
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  cardFullTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  cardFullDesc: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 16,
  },
  cardActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cardActionText: {
    color: '#348f9f',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardActionIconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F0FDFA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  amenitiesSection: {
    marginTop: 10,
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  amenitiesTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginHorizontal: 15,
    color: '#1C1C1E',
    letterSpacing: -0.5,
  },
  amenitiesList: {
    marginTop: 5,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  amenityCard: {
    width: (width - 55) / 2,
    height: 180,
    marginBottom: 15,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 15,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.4)',
  },
  amenityImage: {
    width: '100%',
    height: '100%',
  },
  amenityGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  amenityContent: {
    position: 'absolute',
    bottom: 15,
    left: 15,
    right: 15,
  },
  amenityLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  amenityTitleText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  offersSectionBody: {
    width: width,
    overflow: 'hidden',
    paddingBottom: 20,
    marginTop: 10,
  },
  offersTickerContainer: {
    flexDirection: 'row',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  selectionCard: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 32,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
  },
  selectionTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1E293B',
    marginBottom: 8,
  },
  selectionSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 24,
    textAlign: 'center',
  },
  selectionOptions: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
    marginBottom: 24,
  },
  selectionOption: {
    flex: 1,
    height: 140,
    borderRadius: 24,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  selectionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  selectionLabel: {
    fontSize: 18,
    fontWeight: '800',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#94A3B8',
  },

  // Reward Modal Styles
  rewardOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },
  rewardCard: {
    width: '100%',
    borderRadius: 36,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.4,
    shadowRadius: 35,
    elevation: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
    position: 'relative',
  },
  closeReward: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 8,
  },
  rewardIconContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  rewardIconInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#348f9f',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#348f9f',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 15,
  },
  sparkle1: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  sparkle2: {
    position: 'absolute',
    bottom: 5,
    left: 5,
  },
  rewardTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1E293B',
    marginBottom: 10,
    textAlign: 'center',
  },
  rewardSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 25,
    paddingHorizontal: 10,
  },
  rewardAmountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 24,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  rewardCoin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,215,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rewardValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#348f9f',
    marginRight: 6,
  },
  rewardUnit: {
    fontSize: 16,
    fontWeight: '700',
    color: '#94A3B8',
    marginTop: 4,
  },
  claimButton: {
    width: '100%',
    height: 60,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#348f9f',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  claimButtonGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  claimButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },
  rewardTerms: {
    marginTop: 20,
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
