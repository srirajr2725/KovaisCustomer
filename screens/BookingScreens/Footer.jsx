import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Phone, Mail, Globe, Instagram, Facebook, Twitter } from 'lucide-react-native';

const Footer = () => {
  const handlePress = (type, value) => {
    if (type === 'tel') Linking.openURL(`tel:${value}`);
    if (type === 'mailto') Linking.openURL(`mailto:${value}`);
  };

  return (
    <LinearGradient
      colors={['#1e272e', '#0f1416']}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.brandSection}>
          <Text style={styles.brandName}>KOVAIS</Text>
          <View style={styles.divider} />
          <Text style={styles.tagline}>Premium Luxury & Professional Services</Text>
        </View>

        <View style={styles.contactSection}>
          <TouchableOpacity
            style={styles.contactItem}
            onPress={() => handlePress('tel', '9234567891')}
          >
            <View style={styles.iconCircle}>
              <Phone size={14} color="#348f9f" />
            </View>
            <Text style={styles.contactText}>+91 92345 67891</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactItem}
            onPress={() => handlePress('mailto', 'info@kovaisbeauty.com')}
          >
            <View style={styles.iconCircle}>
              <Mail size={14} color="#348f9f" />
            </View>
            <Text style={styles.contactText}>info@kovaisbeauty.com</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.socialSection}>
          {[Instagram, Facebook, Twitter].map((Icon, i) => (
            <TouchableOpacity key={i} style={styles.socialIcon}>
              <Icon size={20} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.bottomSection}>
          <Text style={styles.copyrightText}>
            © 2024 KOVAIS. All Rights Reserved.
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
};

export default Footer;

const styles = StyleSheet.create({
  container: {
    paddingTop: 40,
    paddingBottom: 25,
    marginTop: 40,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  content: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: 25,
  },
  brandName: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 4,
  },
  divider: {
    width: 30,
    height: 3,
    backgroundColor: '#348f9f',
    marginVertical: 10,
    borderRadius: 2,
  },
  tagline: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  contactSection: {
    width: '100%',
    marginBottom: 30,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(52, 143, 159, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  socialSection: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  socialIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  bottomSection: {
    width: '100%',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  copyrightText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 11,
    fontWeight: '500',
  },
});


