// ContactUsScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  Linking,
  SafeAreaView,
  Image
} from 'react-native';
import { 
  ChevronLeft, 
  Mail, 
  Phone, 
  MessageCircle, 
  Clock, 
  MapPin,
  Headphones,
  CheckCircle2,
  Zap,
  ShieldCheck
} from 'lucide-react-native';

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
        <Headphones size={20} color="#348f9f" />
      </View>
    </View>
  </View>
);

const ContactUsScreen = ({ navigation, isDarkMode }) => {
  const contactOptions = [
    {
      id: 'email',
      icon: Mail,
      title: 'Email Support',
      value: 'support@kovaisbeauty.com',
      subtitle: 'Response time: ~24 hours',
      action: () => Linking.openURL('mailto:support@kovaisbeauty.com?subject=Support Request')
    },
    {
      id: 'phone',
      icon: Phone,
      title: 'Member Hotline',
      value: '+91 98765 43210',
      subtitle: 'Mon-Sun: 9:00 AM - 10:00 PM',
      action: () => Linking.openURL('tel:+919876543210')
    },
    {
      id: 'whatsapp',
      icon: MessageCircle,
      title: 'Direct WhatsApp',
      value: 'Instant Chat Support',
      subtitle: 'Highly Recommended',
      action: () => Linking.openURL('https://wa.me/919876543210?text=Hi, I need help with Kovais Beauty app')
    }
  ];

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={isDarkMode ? "#121212" : "#FFFFFF"} />
      <ExecutiveHeader title="Contact Support" onBack={() => navigation.goBack()} isDarkMode={isDarkMode} />

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.supportHero}>
          <View style={[styles.logoBadge, isDarkMode && styles.logoBadgeDark]}>
            <Image 
              source={require('./assets/klogo.png')} 
              style={styles.heroLogo}
              resizeMode="contain"
            />
          </View>
          <Text style={[styles.heroHeading, isDarkMode && styles.heroHeadingDark]}>We're Here for You</Text>
          <Text style={[styles.heroSubheading, isDarkMode && styles.heroSubheadingDark]}>
            Our dedicated prestige team is ready to assist you with any inquiries or bookings.
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          {contactOptions.map((option, index) => (
            <TouchableOpacity 
              key={index} 
              style={[styles.luxeItemCard, isDarkMode && styles.luxeItemCardDark]} 
              onPress={option.action}
              activeOpacity={0.8}
            >
              <View style={[styles.iconBox, isDarkMode && styles.iconBoxDark]}>
                <option.icon size={22} color="#348f9f" />
              </View>
              <View style={styles.itemContent}>
                <Text style={[styles.itemLabel, isDarkMode && styles.itemLabelDark]}>{option.title}</Text>
                <Text style={styles.itemValue}>{option.value}</Text>
                <Text style={[styles.itemSubtitle, isDarkMode && styles.itemSubtitleDark]}>{option.subtitle}</Text>
              </View>
              <ChevronLeft size={18} color={isDarkMode ? "#475569" : "#CBD5E1"} style={{ transform: [{ rotate: '180deg' }] }} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.luxeTrustBanner, isDarkMode && styles.luxeTrustBannerDark]}>
          <View style={styles.trustItem}>
            <ShieldCheck size={28} color="#348f9f" />
            <Text style={[styles.trustText, isDarkMode && styles.trustTextDark]}>Secure</Text>
          </View>
          <View style={styles.trustItem}>
            <Zap size={28} color="#348f9f" />
            <Text style={[styles.trustText, isDarkMode && styles.trustTextDark]}>Direct</Text>
          </View>
          <View style={styles.trustItem}>
            <CheckCircle2 size={28} color="#348f9f" />
            <Text style={[styles.trustText, isDarkMode && styles.trustTextDark]}>Verified</Text>
          </View>
        </View>
      </ScrollView>
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
  luxeExecutiveHeader: {
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 0 : 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  luxeExecutiveHeaderDark: {
    backgroundColor: '#121212',
    borderBottomColor: '#1E293B',
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
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  supportHero: {
    padding: 30,
    alignItems: 'center',
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
  },
  logoBadgeDark: {
    backgroundColor: '#1E293B',
  },
  heroLogo: {
    width: 50,
    height: 50,
  },
  heroHeading: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1E293B',
    marginBottom: 8,
  },
  heroHeadingDark: {
    color: '#F8FAFC',
  },
  heroSubheading: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  heroSubheadingDark: {
    color: '#94A3B8',
  },
  optionsContainer: {
    paddingHorizontal: 20,
  },
  luxeItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  luxeItemCardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#F0FDFA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  iconBoxDark: {
    backgroundColor: '#0F172A',
  },
  itemContent: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  itemLabelDark: {
    color: '#F8FAFC',
  },
  itemValue: {
    fontSize: 14,
    color: '#348f9f',
    fontWeight: '700',
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  itemSubtitleDark: {
    color: '#64748B',
  },
  luxeTrustBanner: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 24,
    backgroundColor: '#F8FAFC',
    margin: 20,
    borderRadius: 24,
  },
  luxeTrustBannerDark: {
    backgroundColor: '#1E293B',
  },
  trustItem: {
    alignItems: 'center',
    gap: 6,
  },
  trustText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E293B',
    textTransform: 'uppercase',
  },
  trustTextDark: {
    color: '#CBD5E1',
  },
});

export default ContactUsScreen;
