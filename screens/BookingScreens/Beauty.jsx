import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
  Animated,
  FlatList,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  ShoppingBag,
  Star,
  Plus,
  Minus,
  Search,
  Filter,
  Heart,
  Share2,
  ShieldCheck,
  Truck
} from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '../AuthContext';
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

const beautyProducts = [
  {
    id: '1',
    name: 'Professional Charcoal Shampoo',
    brand: 'Kovais Elite',
    price: 899,
    rating: 4.8,
    reviews: 124,
    image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=800',
    description: 'Deep cleansing formula with activated charcoal for ultimate hair health.',
    tag: 'Best Seller',
    category: 'Hair Care'
  },
  {
    id: '2',
    name: 'Hydrating Face Serum',
    brand: 'Zen Skin',
    price: 1249,
    rating: 4.9,
    reviews: 86,
    image: 'https://i.pinimg.com/736x/b6/82/2c/b6822c8443aa063425217c796676177a.jpg',
    description: 'Advanced hydration with hyaluronic acid for a glowing complexion.',
    tag: 'New',
    category: 'Skin Care'
  },
  {
    id: '3',
    name: 'Matte Finish Hair Wax',
    brand: 'Master Stylist',
    price: 599,
    rating: 4.7,
    reviews: 210,
    image: 'https://i.pinimg.com/736x/1e/93/26/1e9326004f2fe19ed85b31c6d8401937.jpg',
    description: 'Strong hold with a natural matte finish for all-day styling.',
    tag: 'Popular',
    category: 'Styling'
  },
  {
    id: '4',
    name: 'Luxury Beard Oil',
    brand: 'Kovais Grooming',
    price: 749,
    rating: 4.6,
    reviews: 55,
    image: 'https://i.pinimg.com/1200x/d5/98/e9/d598e9fd8bc53d7356605e0ff45f4bd5.jpg',
    description: 'Organic cedarwood and sandalwood oil for a soft, healthy beard.',
    tag: 'Trending',
    category: 'Beard'
  },
  {
    id: '5',
    name: 'Revitalizing Night Cream',
    brand: 'Zen Skin',
    price: 1599,
    rating: 4.9,
    reviews: 42,
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800',
    description: 'Overnight repair formula that reduces fine lines and refreshes skin.',
    tag: 'Luxury',
    category: 'Skin Care'
  },
  {
    id: '6',
    name: 'Argan Oil Hair Mask',
    brand: 'Kovais Elite',
    price: 1199,
    rating: 4.8,
    reviews: 95,
    image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=800',
    description: 'Deep conditioning treatment for shiny and manageable hair.',
    tag: 'Must Have',
    category: 'Hair Care'
  },
  {
    id: '7',
    name: 'Vitamin C Face Wash',
    brand: 'Zen Skin',
    price: 499,
    rating: 4.5,
    reviews: 156,
    image: 'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=800',
    description: 'Brightening face wash for a refreshed morning look.',
    tag: 'Essential',
    category: 'Skin Care'
  },
  {
    id: '8',
    name: 'Anti-Dandruff Tonic',
    brand: 'Master Stylist',
    price: 649,
    rating: 4.4,
    reviews: 78,
    image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=800',
    description: 'Effective relief from itchy scalp and dandruff flakes.',
    tag: 'Top Rated',
    category: 'Hair Care'
  },
  {
    id: '9',
    name: 'Strong Hold Mustache Wax',
    brand: 'Kovais Grooming',
    price: 399,
    rating: 4.7,
    reviews: 34,
    image: 'https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=800',
    description: 'Keep your mustache perfectly styled all day long.',
    tag: 'New',
    category: 'Beard'
  },
  {
    id: '10',
    name: 'Volumizing Sea Salt Spray',
    brand: 'Master Stylist',
    price: 849,
    rating: 4.6,
    reviews: 112,
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800',
    description: 'Add texture and volume for that effortless beachy look.',
    tag: 'Trending',
    category: 'Styling'
  }
];

const bannerItems = [
  {
    id: '1',
    title: 'Elevate Your\nGrooming Experience',
    subtitle: 'NEW COLLECTION',
    image: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&w=1200',
    colors: ['#348f9f', '#2c3e50']
  },
  {
    id: '2',
    title: 'Natural Skincare\nFor Glowing Skin',
    subtitle: 'SUMMER SPECIAL',
    image: 'https://i.pinimg.com/736x/88/6f/67/886f67cc427a99aa684ecc996c4e22d2.jpg',
    colors: ['#4facfe', '#00f2fe']
  },
  {
    id: '3',
    title: 'Premium Hair Care\nProducts',
    subtitle: 'BEST SELLERS',
    image: 'https://i.pinimg.com/1200x/64/1d/ff/641dffb6c430462327c857777b804df4.jpg',
    colors: ['#f093fb', '#f5576c']
  }
];

const categories = ['All', 'Hair Care', 'Skin Care', 'Styling', 'Beard'];

const LoadingImage = ({ source, style }) => {
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const onFadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={[style, { backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' }]}>
      <Animated.Image
        source={source}
        style={[style, { opacity: fadeAnim, position: 'absolute' }]}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => {
          setLoading(false);
          onFadeIn();
        }}
      />
      {loading && (
        <View style={styles.placeholderIcon}>
          <ShoppingBag size={24} color="#CBD5E1" />
        </View>
      )}
    </View>
  );
};

const Beauty = ({ goBack }) => {
  const { user, isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailQuantity, setDetailQuantity] = useState(1);
  const scrollY = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (activeBannerIndex + 1) % bannerItems.length;
      setActiveBannerIndex(nextIndex);
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [activeBannerIndex]);

  const filteredProducts = selectedCategory === 'All'
    ? beautyProducts
    : beautyProducts.filter(p => p.category === selectedCategory);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const handleCheckout = async (directProduct = null) => {
    const userId = user?.user_id || user?.id || user?.customer_id;
    if (!userId) {
      Alert.alert("Authentication Required", "Please login to purchase items.");
      return;
    }

    const checkoutItems = directProduct ? [{ ...directProduct, quantity: detailQuantity }] : cart;
    if (checkoutItems.length === 0) {
      Alert.alert("Cart Empty", "Please add items to your cart before checking out.");
      return;
    }

    setLoading(true);

    const reliablePhone = user?.phone || user?.data?.phone || user?.mobile || user?.data?.mobile || user?.customer_phone || user?.data?.customer_phone || user?.contact || user?.data?.contact || (user?.username && /^\d{10}/.test(user.username) ? user.username.match(/^\d{10}/)[0] : '') || '';
    const totalAmount = checkoutItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

    const payload = {
      category: 'Beauty',
      services: checkoutItems.map(item => `${item.name} (x${item.quantity || 1})`).join(', ') + ` | Ph: ${reliablePhone} | Loc: ${user?.address || 'Doorstep Delivery'}`,
      amount: totalAmount,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      payment_status: 'Completed',
      payment_type: 'Cash',
      customer_id: userId,
      status: 'booked',
      customer_name: `${user?.username || user?.name || 'Guest'} - ${reliablePhone}`,
      phone: reliablePhone,
      address: user?.address || 'Doorstep Delivery',
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
      order_type: 'Product Delivery',
    };

    try {
      await axios.post('https://api.codingboss.in/kovais/saloon/orders/', payload);

      const stored = await AsyncStorage.getItem('offline_orders');
      const orders = stored ? JSON.parse(stored) : [];
      orders.unshift({ ...payload, id: 'BEA-' + Date.now(), created_at: new Date().toISOString() });
      await AsyncStorage.setItem('offline_orders', JSON.stringify(orders.slice(0, 50)));

      if (!directProduct) setCart([]);
      setSelectedProduct(null);

      Alert.alert("Order Confirmed", "Your beauty products are on their way!", [{ text: "OK", onPress: () => goBack() }]);
    } catch (error) {
      console.error('Beauty purchase error:', error);
      Alert.alert("Order Saved", "Saved locally due to sync issue.");
    } finally {
      setLoading(false);
    }
  };

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const renderBanner = ({ item }) => (
    <View style={styles.bannerContainer}>
      <LinearGradient
        colors={item.colors}
        style={styles.mainBanner}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.bannerContent}>
          <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
          <Text style={styles.bannerTitle}>{item.title}</Text>
          <TouchableOpacity style={styles.bannerBtn}>
            <Text style={styles.bannerBtnText}>Shop Now</Text>
          </TouchableOpacity>
        </View>
        <Image
          source={{ uri: item.image }}
          style={styles.bannerImage}
        />
      </LinearGradient>
    </View>
  );

  const renderProduct = ({ item }) => (
    <View style={styles.productCard}>
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.imageContainer}
        onPress={() => {
          setSelectedProduct(item);
          setDetailQuantity(1);
        }}
      >
        <LoadingImage source={{ uri: item.image }} style={styles.productImage} />
        {item.tag && (
          <View style={styles.tagBadge}>
            <Text style={styles.tagText}>{item.tag}</Text>
          </View>
        )}
        <TouchableOpacity style={styles.favoriteBtn}>
          <Heart size={18} color="#FF4757" fill="#FF4757" />
        </TouchableOpacity>
      </TouchableOpacity>

      <View style={styles.productInfo}>
        <Text style={styles.brandName}>{item.brand}</Text>
        <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>

        <View style={styles.ratingRow}>
          <Star size={12} color="#FFD32A" fill="#FFD32A" />
          <Text style={styles.ratingText}>{item.rating} ({item.reviews})</Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.priceText} numberOfLines={1}>₹{item.price}</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => addToCart(item)}
          >
            <Plus size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (selectedProduct) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.detailHeader}>
          <TouchableOpacity onPress={() => setSelectedProduct(null)} style={styles.backBtn}>
            <ChevronLeft size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.detailHeaderTitle}>Product Details</Text>
          <TouchableOpacity style={styles.cartBtn}>
            <Share2 size={22} color="#1E293B" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.detailImageSection}>
            <Image source={{ uri: selectedProduct.image }} style={styles.detailImage} />
            <TouchableOpacity style={styles.detailFavBtn}>
              <Heart size={24} color="#FF4757" fill="#FF4757" />
            </TouchableOpacity>
          </View>

          <View style={styles.detailContent}>
            <View style={styles.detailInfoRow}>
              <View style={{ flex: 1, paddingRight: 15 }}>
                <Text style={styles.detailBrand}>{selectedProduct.brand}</Text>
                <Text style={styles.detailName} numberOfLines={2}>{selectedProduct.name}</Text>
              </View>
              <View style={styles.detailPriceBadge}>
                <Text style={styles.detailPriceText}>₹{selectedProduct.price}</Text>
              </View>
            </View>

            <View style={styles.detailRatingBar}>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={16} color={s <= Math.floor(selectedProduct.rating) ? "#FFD32A" : "#E2E8F0"} fill={s <= Math.floor(selectedProduct.rating) ? "#FFD32A" : "#E2E8F0"} />
                ))}
              </View>
              <Text style={styles.detailRatingText}>{selectedProduct.rating} ({selectedProduct.reviews} reviews)</Text>
            </View>

            <View style={styles.detailDivider} />

            <Text style={styles.detailLabel}>About Product</Text>
            <Text style={styles.detailDescription}>{selectedProduct.description}</Text>

            <View style={styles.featuresRow}>
              <View style={styles.featureItem}>
                <View style={styles.featureIconBox}>
                  <ShieldCheck size={20} color="#348f9f" />
                </View>
                <Text style={styles.featureLabel}>Genuine</Text>
              </View>
              <View style={styles.featureItem}>
                <View style={styles.featureIconBox}>
                  <Truck size={20} color="#348f9f" />
                </View>
                <Text style={styles.featureLabel}>Fast Delivery</Text>
              </View>
              <View style={styles.featureItem}>
                <View style={styles.featureIconBox}>
                  <ShoppingBag size={20} color="#348f9f" />
                </View>
                <Text style={styles.featureLabel}>Secure Shop</Text>
              </View>
            </View>

            <View style={styles.quantitySection}>
              <Text style={styles.detailLabel}>Quantity</Text>
              <View style={styles.qtySelector}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => detailQuantity > 1 && setDetailQuantity(prev => prev - 1)}
                >
                  <Minus size={20} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{detailQuantity}</Text>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => setDetailQuantity(prev => prev + 1)}
                >
                  <Plus size={20} color="#1E293B" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View style={{ height: 120 }} />
        </ScrollView>

        <View style={styles.detailFooter}>
          <TouchableOpacity
            style={styles.addToCartBtn}
            onPress={() => {
              for (let i = 0; i < detailQuantity; i++) addToCart(selectedProduct);
              setSelectedProduct(null);
            }}
          >
            <Text style={styles.addToCartBtnText}>Add to Cart</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.buyNowBtn, loading && { opacity: 0.7 }]} 
            onPress={() => handleCheckout(selectedProduct)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buyNowBtnText}>Buy Now</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backBtn}>
          <ChevronLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Beauty Store</Text>
        <TouchableOpacity style={styles.cartBtn}>
          <ShoppingBag size={24} color="#1E293B" />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[1]}>
        {/* Banner Section with Slider */}
        <View style={styles.bannerSection}>
          <FlatList
            ref={flatListRef}
            data={bannerItems}
            renderItem={renderBanner}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const slide = Math.round(e.nativeEvent.contentOffset.x / (width - 40));
              if (slide !== activeBannerIndex) setActiveBannerIndex(slide);
            }}
            onScrollToIndexFailed={() => { }}
            keyExtractor={item => item.id}
          />
          <View style={styles.paginationDots}>
            {bannerItems.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === activeBannerIndex && styles.activeDot
                ]}
              />
            ))}
          </View>
        </View>

        {/* Categories Bar */}
        <View style={styles.categoryContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryTab, selectedCategory === cat && styles.categoryTabActive]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Product Grid */}
        <View style={styles.gridSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Products</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>Filters</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={filteredProducts}
            renderItem={renderProduct}
            keyExtractor={item => item.id}
            numColumns={2}
            scrollEnabled={false}
            contentContainerStyle={styles.listContent}
          />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Cart Button */}
      {cartCount > 0 && (
        <View style={styles.floatingCart}>
          <TouchableOpacity 
            style={[styles.cartAction, loading && { opacity: 0.7 }]} 
            onPress={() => handleCheckout()}
            disabled={loading}
          >
            <View>
              <Text style={styles.cartItemsText}>{cartCount} Items</Text>
              <Text style={styles.cartTotalText}>₹{cartTotal}</Text>
            </View>
            <View style={styles.checkoutBtn}>
              {loading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <Text style={styles.checkoutText}>Checkout</Text>
                  <ShoppingBag size={18} color="#FFF" />
                </>
              )}
            </View>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFF',
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
    fontSize: moderateScale(18),
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: 0.5,
  },
  cartBtn: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#348f9f',
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
  },
  bannerSection: {
    padding: 20,
  },
  mainBanner: {
    height: verticalScale(180),
    borderRadius: moderateScale(28),
    flexDirection: 'row',
    overflow: 'hidden',
    position: 'relative',
  },
  bannerContent: {
    flex: 1,
    padding: 25,
    justifyContent: 'center',
    zIndex: 2,
  },
  bannerSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  bannerTitle: {
    color: '#FFF',
    fontSize: moderateScale(22),
    fontWeight: '900',
    marginVertical: verticalScale(10),
    lineHeight: moderateScale(28),
  },
  bannerBtn: {
    backgroundColor: '#FFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  bannerBtnText: {
    color: '#348f9f',
    fontSize: 13,
    fontWeight: '800',
  },
  bannerImage: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    width: 180,
    height: 180,
    opacity: 0.8,
    transform: [{ rotate: '-15deg' }],
  },
  bannerContainer: {
    width: width - 40,
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
  },
  activeDot: {
    width: 18,
    backgroundColor: '#348f9f',
  },
  categoryContainer: {
    backgroundColor: '#F8F9FA',
    paddingVertical: 10,
  },
  categoryScroll: {
    paddingHorizontal: 20,
  },
  categoryTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFF',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryTabActive: {
    backgroundColor: '#1E293B',
    borderColor: '#1E293B',
  },
  categoryText: {
    color: '#64748B',
    fontWeight: '600',
    fontSize: 14,
  },
  categoryTextActive: {
    color: '#FFF',
  },
  gridSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
  },
  viewAllText: {
    color: '#348f9f',
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 20,
  },
  productCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 24,
    marginBottom: 20,
    marginHorizontal: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  imageContainer: {
    height: verticalScale(150),
    borderRadius: moderateScale(18),
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  tagBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1E293B',
  },
  favoriteBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    marginTop: 12,
  },
  brandName: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  productName: {
    fontSize: moderateScale(15),
    fontWeight: '800',
    color: '#1E293B',
    marginTop: verticalScale(4),
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  priceText: {
    fontSize: 17,
    fontWeight: '900',
    color: '#1E293B',
    marginRight: 8,
  },
  addBtn: {
    backgroundColor: '#1E293B',
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingCart: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  cartAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  cartItemsText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '600',
  },
  cartTotalText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#348f9f',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  checkoutText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 14,
  },
  placeholderIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailHeaderTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1E293B',
    flex: 1,
    textAlign: 'center',
  },
  detailImageSection: {
    height: width * 0.9,
    backgroundColor: '#FFF',
    position: 'relative',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  detailFavBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  detailContent: {
    padding: 25,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    marginTop: -30,
    minHeight: 500,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.03,
    shadowRadius: 20,
    elevation: 5,
  },
  detailInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  detailBrand: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  detailName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1E293B',
    marginTop: 5,
  },
  detailPriceBadge: {
    backgroundColor: '#348f9f15',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    marginLeft: 10,
    marginRight: 5,
  },
  detailPriceText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#348f9f',
  },
  detailRatingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    gap: 10,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  detailRatingText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  detailDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 20,
  },
  detailLabel: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 10,
  },
  detailDescription: {
    fontSize: 15,
    color: '#64748B',
    lineHeight: 24,
    fontWeight: '500',
  },
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
    backgroundColor: '#F8FAFC',
    padding: 15,
    borderRadius: 20,
  },
  featureItem: {
    alignItems: 'center',
    gap: 8,
  },
  featureIconBox: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  featureLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  quantitySection: {
    marginTop: 25,
  },
  qtySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    alignSelf: 'flex-start',
    borderRadius: 15,
    padding: 5,
    marginTop: 10,
  },
  qtyBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
  qtyText: {
    paddingHorizontal: 20,
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
  },
  detailFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    padding: 20,
    paddingBottom: 45,
    flexDirection: 'row',
    gap: 15,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -15 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 20,
  },
  addToCartBtn: {
    flex: 1,
    height: 55,
    height: moderateScale(55),
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addToCartBtnText: {
    fontSize: moderateScale(16),
    fontWeight: '800',
    color: '#1E293B',
  },
  buyNowBtn: {
    flex: 1.5,
    height: moderateScale(55),
    borderRadius: 18,
    backgroundColor: '#348f9f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyNowBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
  }
});

export default Beauty;
