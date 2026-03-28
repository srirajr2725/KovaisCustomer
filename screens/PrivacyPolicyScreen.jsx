// PrivacyPolicyScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  SafeAreaView
} from 'react-native';
import { 
  ChevronLeft, 
  ShieldCheck, 
  Lock, 
  Eye, 
  Database, 
  Share2 
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

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

const PrivacyPolicyScreen = ({ isDarkMode }) => {
  const navigation = useNavigation();

  const sections = [
    {
      icon: Database,
      title: '1. Information We Collect',
      text: 'We collect information you provide directly to us, such as when you create an account, book appointments, or contact us for support. This includes personal identification and transaction history.'
    },
    {
      icon: Eye,
      title: '2. How We Use Your Information',
      text: 'We use the information we collect to provide and improve our services, process appointments, and facilitate secure payments. Your data helps us personalize your luxury experience.'
    },
    {
      icon: Share2,
      title: '3. Information Sharing',
      text: 'We do not sell, trade, or otherwise transfer your personal information to third parties without your explicit consent, except as required by law to provide our services.'
    },
    {
      icon: Lock,
      title: '4. Data Security',
      text: 'We implement state-of-the-art security measures and encryption to protect your personal information against unauthorized access or disclosure.'
    }
  ];

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={isDarkMode ? "#121212" : "#FFFFFF"} />
      <ExecutiveHeader title="Privacy Policy" onBack={() => navigation.goBack()} isDarkMode={isDarkMode} />

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.luxeTitleSection}>
          <Text style={[styles.luxeTitle, isDarkMode && styles.luxeTitleDark]}>Privacy Commitment</Text>
          <Text style={[styles.luxeSubtitle, isDarkMode && styles.luxeSubtitleDark]}>Last updated: October 2025</Text>
          <Text style={[styles.luxeIntro, isDarkMode && styles.luxeIntroDark]}>
            At Kovais Beauty, we prioritize the confidentiality and security of our members' information.
          </Text>
        </View>

        <View style={styles.sectionsContainer}>
          {sections.map((section, index) => (
            <View key={index} style={[styles.policyCard, isDarkMode && styles.policyCardDark]}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconBox, isDarkMode && styles.iconBoxDark]}>
                  <section.icon size={20} color="#348f9f" />
                </View>
                <Text style={[styles.cardTitle, isDarkMode && styles.cardTitleDark]}>{section.title}</Text>
              </View>
              <Text style={[styles.cardText, isDarkMode && styles.cardTextDark]}>{section.text}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.contactSection, isDarkMode && styles.contactSectionDark]}>
          <Text style={[styles.contactHeading, isDarkMode && styles.contactHeadingDark]}>Questions or Concerns?</Text>
          <Text style={[styles.contactText, isDarkMode && styles.contactTextDark]}>
            For a full legal version of our privacy policy or to request data deletion, please contact:
          </Text>
          <TouchableOpacity style={[styles.emailBadge, isDarkMode && styles.emailBadgeDark]}>
            <Text style={styles.emailText}>privacy@kovaisbeauty.com</Text>
          </TouchableOpacity>
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
  luxeTitleSection: {
    padding: 30,
    alignItems: 'center',
  },
  luxeTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
  },
  luxeTitleDark: {
    color: '#F8FAFC',
  },
  luxeSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 20,
  },
  luxeSubtitleDark: {
    color: '#64748B',
  },
  luxeIntro: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  luxeIntroDark: {
    color: '#94A3B8',
  },
  sectionsContainer: {
    paddingHorizontal: 20,
  },
  policyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  policyCardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F0FDFA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBoxDark: {
    backgroundColor: '#0F172A',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  cardTitleDark: {
    color: '#F8FAFC',
  },
  cardText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 22,
    fontWeight: '500',
  },
  cardTextDark: {
    color: '#94A3B8',
  },
  contactSection: {
    marginTop: 20,
    padding: 30,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
  },
  contactSectionDark: {
    backgroundColor: '#0F172A',
  },
  contactHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 12,
  },
  contactHeadingDark: {
    color: '#F8FAFC',
  },
  contactText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  contactTextDark: {
    color: '#94A3B8',
  },
  emailBadge: {
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(52, 143, 159, 0.2)',
  },
  emailBadgeDark: {
    backgroundColor: '#1E293B',
    borderColor: 'rgba(52, 143, 159, 0.4)',
  },
  emailText: {
    fontSize: 14,
    color: '#348f9f',
    fontWeight: '800',
  },
});

export default PrivacyPolicyScreen;
