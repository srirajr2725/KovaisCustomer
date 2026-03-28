import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Animated,
  Image,
} from 'react-native';
import { 
  CreditCard, 
  Smartphone, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight,
  Lock,
  Wallet,
  Zap,
  CheckCircle2
} from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

const PaymentModal = ({ visible, onClose, bookingData, user, onPaymentSuccess }) => {
  const [activeTab, setActiveTab] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Card Details
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState(user?.name || user?.username || '');

  // UPI Details
  const [upiId, setUpiId] = useState('');

  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
      setIsProcessing(false);
      setIsSuccess(false);
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible]);

  const handlePayment = () => {
    // Validate
    if (activeTab === 'card' && (!cardNumber || !expiry || !cvv)) return;
    if (activeTab === 'upi' && !upiId) return;

    setIsProcessing(true);

    // Simulate Payment
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      
      // Notify parent after success animation
      setTimeout(() => {
        if (onPaymentSuccess) onPaymentSuccess();
        onClose();
      }, 2000);
    }, 2500);
  };

  const renderSuccess = () => (
    <View style={styles.successContainer}>
      <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
        <CheckCircle2 size={80} color="#10B981" />
        <Text style={styles.successTitle}>Payment Verified</Text>
        <Text style={styles.successSub}>Your booking is now confirmed.</Text>
        <Text style={styles.successPrestige}>PRESTIGE CLASS</Text>
      </Animated.View>
    </View>
  );

  const renderContent = () => {
    if (isProcessing) {
      return (
        <View style={styles.processingContainer}>
          <ActivityIndicator size="large" color="#348f9f" />
          <Text style={styles.processingText}>Securing Transaction...</Text>
          <View style={styles.encryptionBadge}>
            <Lock size={14} color="#64748B" />
            <Text style={styles.encryptionText}>AES-256 BIT ENCRYPTED</Text>
          </View>
        </View>
      );
    }

    if (isSuccess) return renderSuccess();

    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Prestige Summary */}
        <View style={styles.prestigeSummary}>
            <View>
                <Text style={styles.summaryLabel}>Total Amount</Text>
                <Text style={styles.summaryAmount}>₹{bookingData?.totalPrice || "4,999"}</Text>
            </View>
            <View style={styles.prestigeBadge}>
                <Zap size={16} color="#348f9f" />
                <Text style={styles.prestigeBadgeText}>ULTRA</Text>
            </View>
        </View>

        {/* Method Picker */}
        <View style={styles.tabContainer}>
            <TouchableOpacity 
                style={[styles.tab, activeTab === 'card' && styles.activeTab]} 
                onPress={() => setActiveTab('card')}
            >
                <CreditCard size={20} color={activeTab === 'card' ? '#348f9f' : '#64748B'} />
                <Text style={[styles.tabText, activeTab === 'card' && styles.activeTabText]}>Card</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={[styles.tab, activeTab === 'upi' && styles.activeTab]} 
                onPress={() => setActiveTab('upi')}
            >
                <Smartphone size={20} color={activeTab === 'upi' ? '#348f9f' : '#64748B'} />
                <Text style={[styles.tabText, activeTab === 'upi' && styles.activeTabText]}>UPI</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={[styles.tab, activeTab === 'wallet' && styles.activeTab]} 
                onPress={() => setActiveTab('wallet')}
            >
                <Wallet size={20} color={activeTab === 'wallet' ? '#348f9f' : '#64748B'} />
                <Text style={[styles.tabText, activeTab === 'wallet' && styles.activeTabText]}>Wallet</Text>
            </TouchableOpacity>
        </View>

        {/* Inputs */}
        {activeTab === 'card' && (
            <View style={styles.formSection}>
                <View style={styles.luxeInputGroup}>
                    <Text style={styles.luxeLabel}>Card Holder Name</Text>
                    <TextInput 
                        style={styles.luxeInput}
                        value={cardName}
                        onChangeText={setCardName}
                        placeholder="EXECUTIVE NAME"
                        placeholderTextColor="#94A3B8"
                    />
                </View>
                <View style={styles.luxeInputGroup}>
                    <Text style={styles.luxeLabel}>Card Number</Text>
                    <TextInput 
                        style={styles.luxeInput}
                        value={cardNumber}
                        onChangeText={setCardNumber}
                        placeholder="XXXX XXXX XXXX XXXX"
                        keyboardType="numeric"
                        maxLength={16}
                        placeholderTextColor="#94A3B8"
                    />
                </View>
                <View style={styles.row}>
                    <View style={[styles.luxeInputGroup, { flex: 1, marginRight: 8 }]}>
                        <Text style={styles.luxeLabel}>Expiry</Text>
                        <TextInput 
                            style={styles.luxeInput}
                            value={expiry}
                            onChangeText={setExpiry}
                            placeholder="MM/YY"
                            maxLength={5}
                            placeholderTextColor="#94A3B8"
                        />
                    </View>
                    <View style={[styles.luxeInputGroup, { flex: 1, marginLeft: 8 }]}>
                        <Text style={styles.luxeLabel}>CVV</Text>
                        <TextInput 
                            style={styles.luxeInput}
                            value={cvv}
                            onChangeText={setCvv}
                            placeholder="XXX"
                            secureTextEntry
                            maxLength={3}
                            placeholderTextColor="#94A3B8"
                        />
                    </View>
                </View>
            </View>
        )}

        {activeTab === 'upi' && (
            <View style={styles.formSection}>
                <View style={styles.luxeInputGroup}>
                    <Text style={styles.luxeLabel}>VPA ID (UPI)</Text>
                    <TextInput 
                        style={styles.luxeInput}
                        value={upiId}
                        onChangeText={setUpiId}
                        placeholder="yourname@bank"
                        autoCapitalize="none"
                        placeholderTextColor="#94A3B8"
                    />
                </View>
                <View style={styles.upiGrid}>
                    <Text style={styles.upiGridLabel}>Popular Apps:</Text>
                    <View style={styles.upiApps}>
                        <View style={styles.upiIcon}><Text style={styles.upiIconTxt}>GP</Text></View>
                        <View style={styles.upiIcon}><Text style={styles.upiIconTxt}>Ph</Text></View>
                        <View style={styles.upiIcon}><Text style={styles.upiIconTxt}>Pt</Text></View>
                    </View>
                </View>
            </View>
        )}

        {activeTab === 'wallet' && (
            <View style={styles.formSection}>
                 <Text style={styles.walletInfo}>Fast checkout with saved balances.</Text>
                 <TouchableOpacity style={styles.walletItem}>
                     <View style={styles.walletDot} />
                     <Text style={styles.walletName}>Kovais Prime Credit (₹5,000)</Text>
                     <ChevronRight size={18} color="#94A3B8" />
                 </TouchableOpacity>
            </View>
        )}

        <TouchableOpacity 
            style={styles.submitBtn} 
            onPress={handlePayment}
            activeOpacity={0.9}
        >
            <LinearGradient
                colors={['#348f9f', '#2c3e50']}
                style={styles.submitGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
            >
                <Text style={styles.submitBtnText}>Initialize Secure Payment</Text>
                <ShieldCheck size={20} color="#FFFFFF" />
            </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelBtnText}>Back to Booking Details</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <View style={styles.dragHandle} />
            <Text style={styles.headerTitle}>SECURE GATEWAY</Text>
          </View>
          {renderContent()}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: height * 0.85,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  dragHandle: {
    width: 40,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F1F5F9',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#348f9f',
    letterSpacing: 2,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  prestigeSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1E293B',
    marginTop: 4,
  },
  prestigeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  prestigeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#348f9f',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 6,
    marginVertical: 24,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#348f9f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  activeTabText: {
    color: '#1E293B',
  },
  formSection: {
    width: '100%',
  },
  luxeInputGroup: {
    marginBottom: 20,
  },
  luxeLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },
  luxeInput: {
    backgroundColor: '#F8FAFC',
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
  },
  row: {
    flexDirection: 'row',
  },
  submitBtn: {
    marginTop: 20,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#348f9f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 12,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  cancelBtn: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 12,
  },
  cancelBtnText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '700',
  },
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  processingText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 24,
  },
  encryptionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  encryptionText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#10B981',
    marginTop: 24,
  },
  successSub: {
    fontSize: 15,
    color: '#64748B',
    marginTop: 8,
    textAlign: 'center',
  },
  successPrestige: {
    fontSize: 12,
    fontWeight: '900',
    color: '#348f9f',
    letterSpacing: 4,
    marginTop: 30,
  },
  upiGridLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
    marginBottom: 12,
    marginLeft: 4,
  },
  upiApps: {
    flexDirection: 'row',
    gap: 12,
  },
  upiIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
  },
  upiIconTxt: {
    fontSize: 12,
    fontWeight: '900',
    color: '#1E293B',
  },
  walletInfo: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
    marginLeft: 4,
  },
  walletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(52, 143, 159, 0.1)',
  },
  walletDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#348f9f',
    marginRight: 12,
  },
  walletName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  }
});

export default PaymentModal;
