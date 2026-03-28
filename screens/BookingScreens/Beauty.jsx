import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  StatusBar,
  Animated,
  FlatList
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
  Heart
} from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const beautyProducts = [
  {
    id: '1',
    name: 'Professional Charcoal Shampoo',
    brand: 'Kovais Elite',
    price: 899,
    rating: 4.8,
    reviews: 124,
    image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=2070&auto=format&fit=crop',
    description: 'Deep cleansing formula with activated charcoal for ultimate hair health.',
    tag: 'Best Seller'
  },
  {
    id: '2',
    name: 'Hydrating Face Serum',
    brand: 'Zen Skin',
    price: 1249,
    rating: 4.9,
    reviews: 86,
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143af7be?q=80&w=1974&auto=format&fit=crop',
    description: 'Advanced hydration with hyaluronic acid for a glowing complexion.',
    tag: 'New'
  },
  {
    id: '3',
    name: 'Matte Finish Hair Wax',
    brand: 'Master Stylist',
    price: 599,
    rating: 4.7,
    reviews: 210,
    image: 'https://images.unsplash.com/photo-1590159446430-891462058c44?q=80&w=1964&auto=format&fit=crop',
    description: 'Strong hold with a natural matte finish for all-day styling.',
    tag: 'Popular'
  },
  {
    id: '4',
    name: 'Luxury Beard Oil',
    brand: 'Kovais Grooming',
    price: 749,
    rating: 4.6,
    reviews: 55,
    image: 'https://images.unsplash.com/photo-1626285493081-3c5b8535f299?q=80&w=2070&auto=format&fit=crop',
    description: 'Organic cedarwood and sandalwood oil for a soft, healthy beard.',
    tag: 'Trending'
  },
  {
    id: '5',
    name: 'Revitalizing Night Cream',
    brand: 'Zen Skin',
    price: 1599,
    rating: 4.9,
    reviews: 42,
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1974&auto=format&fit=crop',
    description: 'Overnight repair formula that reduces fine lines and refreshes skin.',
    tag: 'Luxury'
  }
];

const Beauty = ({ goBack }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const scrollY = new Animated.Value(0);

  const categories = ['All', 'Hair Care', 'Skin Care', 'Styling', 'Beard'];

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === productId);
      if (existing.quantity > 1) {
        return prev.map(item => item.id === productId ? { ...item, quantity: item.quantity - 1 } : item);
      }
      return prev.filter(item => item.id !== productId);
    });
  };

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const renderProduct = ({ item, index }) => (
    <View style={styles.productCard}>
      <TouchableOpacity activeOpacity={0.9} style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.productImage} />
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
          <Text style={styles.priceText}>₹{item.price}</Text>
          <TouchableOpacity 
            style={styles.addBtn}
            onPress={() => addToCart(item)}
          >
            <Plus size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

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
        {/* Banner Section */}
        <View style={styles.bannerSection}>
          <LinearGradient
            colors={['#348f9f', '#2c3e50']}
            style={styles.mainBanner}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.bannerContent}>
              <Text style={styles.bannerSubtitle}>NEW COLLECTION</Text>
              <Text style={styles.bannerTitle}>Elevate Your{"\n"}Grooming Experience</Text>
              <TouchableOpacity style={styles.bannerBtn}>
                <Text style={styles.bannerBtnText}>Shop Now</Text>
              </TouchableOpacity>
            </View>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?q=80&w=1976&auto=format&fit=crop' }} 
              style={styles.bannerImage}
            />
          </LinearGradient>
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
            data={beautyProducts}
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
          <TouchableOpacity style={styles.cartAction}>
            <View>
              <Text style={styles.cartItemsText}>{cartCount} Items</Text>
              <Text style={styles.cartTotalText}>₹{cartTotal}</Text>
            </View>
            <View style={styles.checkoutBtn}>
              <Text style={styles.checkoutText}>View Cart</Text>
              <ShoppingBag size={18} color="#FFF" />
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
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: 0.5,
  },
  cartBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    height: 180,
    borderRadius: 28,
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
    fontSize: 22,
    fontWeight: '900',
    marginVertical: 10,
    lineHeight: 28,
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
    marginHorizontal: 5,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  imageContainer: {
    height: 150,
    borderRadius: 18,
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
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 4,
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
    fontSize: 18,
    fontWeight: '900',
    color: '#1E293B',
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
  }
});

export default Beauty;
