import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Animatable from 'react-native-animatable';
import { Trophy, Inbox, ChevronLeft, CreditCard, Calendar, User, Star, MessageSquare, Clock, Trash2 } from "lucide-react-native";
import LinearGradient from 'react-native-linear-gradient';
import axios from "axios";

const ExecutiveHeader = ({ title, onBack }) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.luxeExecutiveHeader, { paddingTop: Math.max(insets.top, 20) }]}>
      <View style={styles.luxeHeaderContent}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.luxeHeaderBackBtn}>
            <ChevronLeft size={24} color="#348f9f" />
          </TouchableOpacity>
        )}
        <View style={styles.luxeHeaderTitleWrapper}>
          <Text style={styles.luxeHeaderPrestige}>PRESTIGE</Text>
          <Text style={styles.luxeHeaderMainTitle}>{title}</Text>
        </View>
        <View style={styles.luxeHeaderProfile}>
          <Trophy size={20} color="#348f9f" />
        </View>
      </View>
    </View>
  );
};

// Unified Booking Service for history persistence
export const BookingService = {
  saveBooking: async (userId, bookingData) => {
    try {
      const storedLocal = await AsyncStorage.getItem('offline_orders');
      let orders = storedLocal ? JSON.parse(storedLocal) : [];

      const newBooking = {
        ...bookingData,
        id: bookingData.bookingId || `local_${bookingData.category}_${Date.now()}`,
        customer_id: userId,
        Category: bookingData.category ? bookingData.category.toLowerCase() : 'hotel',
        created_at: new Date().toISOString(),
        status: bookingData.status || 'booked'
      };

      orders.unshift(newBooking);
      // Keep only latest 50 to prevent AsyncStorage bloating
      await AsyncStorage.setItem('offline_orders', JSON.stringify(orders.slice(0, 50)));
      return true;
    } catch (error) {
      console.error('BookingService Error:', error);
      return false;
    }
  }
};

const History = ({ goBack, navigation: navProp }) => {
  const navigation = navProp;
  const [points, setPoints] = useState(0);

  const [ratings, setRatings] = useState({});
  const [feedbacks, setFeedbacks] = useState({});
  const [id, setId] = useState(null);
  const [orders, setOrders] = useState([]);
  const [submittedFeedbacks, setSubmittedFeedbacks] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const imageMap = {
    hotel: require("./image/hotel.jpeg"),
    gym: require("./image/gym.jpeg"),
    spa: require("./image/spa.jpg"),
    saloon: require("./image/barber.jpeg"),
  };

  useEffect(() => {
    const initializeData = async () => {
      try {
        const loggedInUser = await AsyncStorage.getItem("User_data");
        //console.log("History screen fetched user:", loggedInUser);

        if (loggedInUser) {
          const user = JSON.parse(loggedInUser);
          //console.log("Parsed user in History:", user);
          if (user) {
            // Use a robust check for user ID keys
            const userId = user.user_id || user.id || user.customer_id;
            //console.log("Loaded unified user id for History:", userId);
            setId(userId);
          }
        }
        // load submittedFeedbacks same as before...
      } catch (error) {
        console.error("Error initializing data:", error);
      }
    };
    initializeData();
  }, []);

  // --- helper function to safely return a valid image ---
  const safeImage = (category) => {
    return imageMap[category] || require("./image/default.jpg");
  };

  const fetchAllOrders = async () => {
    //console.log("Fetching orders for user ID:", id);

    if (!id) return;

    try {
      setLoading(true);
      setErrorMessage("");


      // Try customer_id first, fallback to user_id if it fails (common in different Kovais API versions)
      let url = `https://api.codingboss.in/kovais/orders/?customer_id=${id}&status=booked`;
      let response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
      });

      if (!response.ok) {
        //console.log("customer_id fetch failed (400), trying user_id...");
        url = `https://api.codingboss.in/kovais/orders/?user_id=${id}&status=booked`;
        response = await fetch(url, {
          method: "GET",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
        });
      }

      if (!response.ok) {
        const errorBody = await response.text();
        //console.log("Both fetch attempts failed:", errorBody);
        throw new Error(`Failed to fetch orders: ${response.status} - ${errorBody}`);
      }

      const data = await response.json();
      //console.log("Raw API response:", data);

      // Support both direct and nested data structures
      const result = data?.data || data || {};

      // --- build orders with safeImage ---
      const hotelOrders = (result.hotel_orders || []).map((order) => ({
        ...order,
        id: order.id || `hotel_${order.date_in || order.check_in || order.created_at}`,
        guest_name: order.guest_name || order.username || order.customer_name || "Valued Guest",
        service_type: order.room_type || "Deluxe Room (Ac)",
        bookingDate: order.date_in || order.check_in?.split('T')[0] || order.date || "N/A",
        Category: "hotel",
        img: safeImage("hotel"),
        created_at: order.created_at || order.date_in || new Date().toISOString(),
        points: order.points || 100,
        amount: order.amount || order.total_amount || 0,
      }));

      const gymOrders = (result.gym_orders || []).map((order) => ({
        ...order,
        id: order.id || `gym_${order.purchaseddate || order.created_at}`,
        guest_name: order.customer_name || order.username || "Valued Guest",
        service_type: order.plan || "Gym Membership",
        bookingDate: order.purchaseddate || "N/A",
        time: order.timeslot,
        serviceBy: "Gokul",
        Category: "gym",
        img: safeImage("gym"),
        created_at: order.created_at || order.purchaseddate || new Date().toISOString(),
        points: order.points || 100,
        age: order.age,
        gender: order.gender,
        payment_status: order.payment_status,
        payment_type: order.payment_type,
        amount: order.amount || order.total_amount || 0,
      }));

      const spaOrders = (result.spa_orders || []).map((order) => ({
        ...order,
        id: order.id || `spa_${order.date || order.created_at}`,
        guest_name: order.customer_name || order.username || "Valued Guest",
        service_type: order.services || "Spa Service",
        bookingDate: order.date || "N/A",
        time: order.time,
        serviceBy: "Guna",
        Category: "spa",
        img: safeImage("spa"),
        created_at: order.created_at || order.date || new Date().toISOString(),
        points: order.points || 100,
        amount: order.amount || order.total_amount || 0,
      }));

      const saloonOrders = (result.saloon_orders || []).map((order) => ({
        ...order,
        id: order.id || `saloon_${order.date || order.created_at}`,
        guest_name: order.customer_name || order.username || "Valued Guest",
        service_type: order.services || "Prestige Service",
        bookingDate: order.date || "N/A",
        time: order.time,
        gender: order.category,
        serviceBy: "Anandh",
        Category: "saloon",
        img: safeImage("saloon"),
        created_at: order.created_at || order.date || new Date().toISOString(),
        points: order.points || 100,
        amount: order.amount || order.total_amount || 0,
      }));

      // --- Merge with local/offline orders ---
      let offlineOrders = [];
      try {
        const storedLocal = await AsyncStorage.getItem('offline_orders');
        if (storedLocal) {
          offlineOrders = JSON.parse(storedLocal);
          // Filter by user ID if available
          offlineOrders = offlineOrders.filter(order => {
            // Robust user ID matching: check customer_id first, then user_id, 
            // then fall back to the old split('_') logic only if those are missing
            const orderCustId = order.customer_id || order.user_id || order.id?.split('_')[2];
            return orderCustId == id || !orderCustId;
          }).map(order => ({
            ...order,
            guest_name: order.guest_name || order.customer_name || "Valued Guest",
            service_type: order.room_type || order.services || "Premium Service",
            bookingDate: order.date_in || order.date || "N/A",
            img: safeImage(order.Category || "hotel"),
            Category: order.Category || "hotel"
          }));
        }
      } catch (err) {
        console.error("Error loading offline orders:", err);
      }

      let allOrders = [...hotelOrders, ...gymOrders, ...spaOrders, ...saloonOrders, ...offlineOrders];

      // Client-side filtering for 'booked' status to ensure we only show active bookings
      allOrders = allOrders.filter(order =>
        !order.status || order.status.toLowerCase() === 'booked' || order.status.toLowerCase() === 'confirmed'
      );

      // Remove duplicates based on ID
      const uniqueOrders = [];
      const seenIds = new Set();
      allOrders.forEach(order => {
        if (!seenIds.has(order.id)) {
          uniqueOrders.push(order);
          seenIds.add(order.id);
        }
      });

      // Sort and set
      uniqueOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setOrders(uniqueOrders);

      // total points
      const total = uniqueOrders.reduce((acc, cur) => acc + Number(cur.points || 100), 0);
      setPoints(total);
    } catch (error) {
      console.error("Error fetching completed orders:", error);
      setErrorMessage("Failed to load orders");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  useEffect(() => {
    if (id) {
      //console.log("id is set — fetching orders for:", id);
      fetchAllOrders();   // call the function defined below
    }
  }, [id]);


  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAllOrders();
  }, [fetchAllOrders]);

  const handleRatingChange = (orderId, selectedRating) => {
    setRatings((prevRatings) => ({
      ...prevRatings,
      [orderId]: selectedRating,
    }));
  };

  const handleFeedbackChange = (orderId, comment) => {
    setFeedbacks((prevFeedbacks) => ({
      ...prevFeedbacks,
      [orderId]: comment,
    }));
  };

  const handleFeedbackSubmit = async (orderId, order) => {
    const rating = ratings[orderId];
    const comment = feedbacks[orderId];

    if (!rating || !comment) {
      Alert.alert(
        "Incomplete Feedback",
        "Please give a rating and feedback before submitting."
      );
      return;
    }

    try {
      await axios.post(
        `https://api.codingboss.in/kovais/${order.Category}/orders/update/?customer_id=${id}&order_id=${orderId}`,
        {
          customer_id: id,
          order_id: orderId,
          order_type: order.Category,
          rating,
          comment,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      Alert.alert("Success", "Feedback submitted successfully!");

      // Save to AsyncStorage
      const storedFeedbacks = await AsyncStorage.getItem(
        "submittedFeedbacks"
      );
      const updated = {
        ...JSON.parse(storedFeedbacks || "{}"),
        [orderId]: { rating, comment },
      };

      await AsyncStorage.setItem(
        "submittedFeedbacks",
        JSON.stringify(updated)
      );
      setSubmittedFeedbacks((prev) => ({
        ...prev,
        [orderId]: true,
      }));
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  const handleDeleteOrder = async (orderId, order) => {
    Alert.alert(
      "Delete Booking",
      "Are you sure you want to remove this premium booking from your records? This action will also cancel the booking in our system.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // 1. Local State Update (Optimistic)
              setOrders(prev => {
                const updated = prev.filter(o => String(o.id) !== String(orderId));
                // Recalculate points
                const total = updated.reduce((acc, cur) => acc + Number(cur.points || 100), 0);
                setPoints(total);
                return updated;
              });

              // 2. AsyncStorage Update (Remove from offline_orders)
              try {
                const storedLocal = await AsyncStorage.getItem('offline_orders');
                if (storedLocal) {
                  const localOrders = JSON.parse(storedLocal);
                  const updatedLocal = localOrders.filter(o => String(o.id) !== String(orderId) && String(o.bookingId) !== String(orderId));
                  await AsyncStorage.setItem('offline_orders', JSON.stringify(updatedLocal));
                }
              } catch (storageErr) {
                console.error("Local storage sync error:", storageErr);
              }

              // 3. Backend Update (Try to sync if not local)
              if (!String(orderId).includes('local') && !String(orderId).includes('offline')) {
                try {
                  // Try standard status cancel
                  await axios.post(
                    `https://api.codingboss.in/kovais/${order.Category}/orders/update/?customer_id=${id}&order_id=${orderId}`,
                    {
                      customer_id: id,
                      order_id: orderId,
                      order_type: order.Category,
                      status: 'cancelled',
                    },
                    { headers: { "Content-Type": "application/json" } }
                  );
                } catch (apiErr) {
                  console.log("Status cancelled update failed, trying direct delete pattern...");
                  try {
                    // Try another common pattern: /delete/ endpoint
                    await axios.post(
                      `https://api.codingboss.in/kovais/${order.Category}/orders/delete/?customer_id=${id}&order_id=${orderId}`,
                      { customer_id: id, order_id: orderId }
                    );
                  } catch (delErr) {
                    console.log("Delete endpoint also failed, but order was removed from UI.");
                  }
                }
              }

              Alert.alert("Success", "Booking removed from your history.");
            } catch (error) {
              console.error("Critical error in delete flow:", error);
              Alert.alert("Error", "Something went wrong, but the record was removed from this view.");
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getCategoryColor = (category) => {
    const colors = {
      hotel: "#007bff",
      gym: "#28a745",
      spa: "#ff9800",
      saloon: "#9c27b0",
    };
    return colors[category] || "#007bff";
  };

  const getCategoryBackgroundColor = (category) => {
    const colors = {
      hotel: "#f8f9fa",
      gym: "#e8f5e9",
      spa: "#fff3e0",
      saloon: "#f3e5f5",
    };
    return colors[category] || "#f8f9fa";
  };

  const renderOrderCard = ({ item: order }) => {
    const isFeedbackSubmitted = submittedFeedbacks[order.id];
    const categoryColor = getCategoryColor(order.Category);

    return (
      <Animatable.View animation="fadeInUp" duration={600} style={styles.luxeCard}>
        <View style={styles.luxeCardHeader}>
          <View style={[styles.luxeCategoryBadge, { backgroundColor: categoryColor + '15' }]}>
            <Text style={[styles.luxeCategoryText, { color: categoryColor }]}>
              {order.Category.toUpperCase()}
            </Text>
          </View>
          <View style={styles.luxeHeaderActions}>
            <View style={styles.luxePointsBadge}>
              <Trophy size={14} color="#EAB308" />
              <Text style={styles.luxePointsText}>{order.points || 100} pts</Text>
            </View>
            <TouchableOpacity
              onPress={() => handleDeleteOrder(order.id, order)}
              style={styles.luxeDeleteBtn}
            >
              <Trash2 size={18} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.luxeCardBody}>
          <Image source={order.img} style={styles.luxeOrderImage} />
          <View style={styles.luxeOrderMainInfo}>
            <Text style={styles.luxeOrderTitle}>{order.service_type}</Text>
            <View style={styles.luxeInfoRow}>
              <User size={14} color="#64748B" />
              <Text style={styles.luxeInfoText}>{order.guest_name}</Text>
            </View>
            <View style={styles.luxeInfoRow}>
              <Calendar size={14} color="#64748B" />
              <Text style={styles.luxeInfoText}>{formatDate(order.created_at)}</Text>
            </View>
            {order.time && (
              <View style={styles.luxeInfoRow}>
                <Clock size={14} color="#64748B" />
                <Text style={styles.luxeInfoText}>{order.time}</Text>
              </View>
            )}
          </View>
          <View style={styles.luxePriceSection}>
            <Text style={styles.luxePriceLabel}>Amount</Text>
            <Text style={styles.luxePriceValue}>₹{order.amount}</Text>
          </View>
        </View>

        <View style={styles.luxeDivider} />

        <View style={styles.luxeFeedbackSection}>
          <Text style={styles.luxeFeedbackTitle}>Experience Rating</Text>
          <View style={styles.luxeStarRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => !isFeedbackSubmitted && handleRatingChange(order.id, star)}
                disabled={isFeedbackSubmitted}
              >
                <Star
                  size={24}
                  fill={ratings[order.id] >= star ? "#EAB308" : "transparent"}
                  color={ratings[order.id] >= star ? "#EAB308" : "#CBD5E1"}
                />
              </TouchableOpacity>
            ))}
          </View>

          {!isFeedbackSubmitted && (
            <View style={styles.luxeInputWrapper}>
              <TextInput
                style={styles.luxeFeedbackInput}
                placeholder="Share your experience..."
                placeholderTextColor="#94A3B8"
                value={feedbacks[order.id] || ""}
                onChangeText={(text) => handleFeedbackChange(order.id, text)}
                multiline
              />
              <TouchableOpacity
                style={styles.luxeSubmitIconBtn}
                onPress={() => handleFeedbackSubmit(order.id, order)}
              >
                <LinearGradient
                  colors={['#348f9f', '#2c3e50']}
                  style={styles.luxeSubmitGradient}
                >
                  <MessageSquare size={18} color="#FFF" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {isFeedbackSubmitted && (
            <View style={styles.luxeSuccessBadge}>
              <Text style={styles.luxeSuccessText}>Feedback Submitted Successfully</Text>
            </View>
          )}
        </View>
      </Animatable.View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#348f9f" />
        <Text style={styles.loadingText}>Retreiving your prestige history...</Text>
      </View>
    );
  }

  const handleBack = () => {
    if (goBack) goBack();
    else if (navigation && navigation.canGoBack()) navigation.goBack();
    else if (navigation) navigation.navigate('Profile');
  };

  return (
    <SafeAreaView style={styles.luxeContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ExecutiveHeader title="Orders History" onBack={handleBack} />

      <View style={styles.luxeStatsRow}>
        <View style={styles.luxeStatItem}>
          <Trophy size={20} color="#348f9f" />
          <View>
            <Text style={styles.luxeStatValue}>{points}</Text>
            <Text style={styles.luxeStatLabel}>Total Points</Text>
          </View>
        </View>
        <View style={styles.luxeStatDivider} />
        <View style={styles.luxeStatItem}>
          <CreditCard size={20} color="#348f9f" />
          <View>
            <Text style={styles.luxeStatValue}>{orders.length}</Text>
            <Text style={styles.luxeStatLabel}>Bookings</Text>
          </View>
        </View>
      </View>

      {errorMessage ? (
        <View style={styles.luxeErrorContainer}>
          <Text style={styles.luxeErrorText}>{errorMessage}</Text>
        </View>
      ) : null}

      {orders.length === 0 ? (
        <View style={styles.luxeEmptyContainer}>
          <Inbox size={64} color="#CBD5E1" />
          <Text style={styles.luxeEmptyTitle}>No Bookings Yet</Text>
          <Text style={styles.luxeEmptySubtitle}>
            Your premium experiences will appear here once confirmed.
          </Text>
          <TouchableOpacity style={styles.luxeDiscoverBtn} onPress={handleBack}>
            <Text style={styles.luxeDiscoverText}>Discover Services</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderCard}
          keyExtractor={(item, index) => `${item.Category}-${item.id || index}`}
          contentContainerStyle={styles.luxeListContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#348f9f" />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  luxeContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  luxeExecutiveHeader: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  luxeHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  luxeHeaderBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  luxeHeaderTitleWrapper: {
    flex: 1,
  },
  luxeHeaderPrestige: {
    fontSize: 10,
    fontWeight: "800",
    color: "#348f9f",
    letterSpacing: 2,
    marginBottom: 2,
  },
  luxeHeaderMainTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
  },
  luxeHeaderProfile: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0FDFA",
    justifyContent: "center",
    alignItems: "center",
  },
  luxeStatsRow: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    margin: 20,
    borderRadius: 24,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  luxeStatItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  luxeStatValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  luxeStatLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  luxeStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#CBD5E1",
    marginHorizontal: 15,
  },
  luxeListContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  luxeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  luxeCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  luxeCategoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  luxeCategoryText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  luxePointsBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF9C3",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 4,
  },
  luxePointsText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#854D0E",
  },
  luxeCardBody: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  luxeOrderImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
  },
  luxeOrderMainInfo: {
    flex: 1,
    gap: 4,
  },
  luxeOrderTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  luxeInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  luxeInfoText: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  luxePriceSection: {
    alignItems: "flex-end",
  },
  luxePriceLabel: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  luxePriceValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#348f9f",
  },
  luxeDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 20,
  },
  luxeFeedbackSection: {
    gap: 15,
  },
  luxeFeedbackTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  luxeStarRow: {
    flexDirection: "row",
    gap: 12,
  },
  luxeInputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
  },
  luxeFeedbackInput: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 15,
    fontSize: 14,
    color: "#0F172A",
    minHeight: 80,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  luxeSubmitIconBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    overflow: "hidden",
  },
  luxeSubmitGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  luxeSuccessBadge: {
    backgroundColor: "#F0FDF4",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DCFCE7",
  },
  luxeSuccessText: {
    color: "#166534",
    fontSize: 13,
    fontWeight: "600",
  },
  luxeErrorContainer: {
    margin: 20,
    padding: 15,
    backgroundColor: "#FEF2F2",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },
  luxeErrorText: {
    color: "#991B1B",
    fontSize: 14,
    textAlign: "center",
  },
  luxeEmptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    gap: 15,
  },
  luxeEmptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
  },
  luxeEmptySubtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
  },
  luxeDiscoverBtn: {
    marginTop: 10,
    backgroundColor: "#348f9f",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  luxeDiscoverText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#64748B",
    fontWeight: "500",
  },
  luxeHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  luxeDeleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },
});

export default History;