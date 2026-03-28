// SettingsScreen.jsx
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
  Settings, 
  Languages, 
  ArrowRight
} from 'lucide-react-native';

const ExecutiveHeader = ({ title, onBack }) => (
  <View style={styles.luxeExecutiveHeader}>
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
        <Settings size={20} color="#348f9f" />
      </View>
    </View>
  </View>
);

const SettingsScreen = ({ 
  navigation, 
  appSettings, 
  changeLanguage,
}) => {
  
  const sections = [
    {
      title: 'App Customization',
      items: [
        { 
          id: 'language', 
          label: 'Language', 
          value: appSettings.language, 
          icon: Languages, 
          onPress: changeLanguage 
        }
      ]
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ExecutiveHeader title="Settings" onBack={() => navigation.goBack()} />

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {sections.map((section, idx) => (
          <View key={idx} style={styles.section}>
            <Text style={styles.sectionLabel}>{section.title}</Text>
            <View style={styles.luxeCard}>
              {section.items.map((item, iIdx) => (
                <View key={item.id}>
                  <TouchableOpacity 
                    style={styles.settingItem}
                    onPress={item.onPress}
                    activeOpacity={0.7}
                  >
                    <View style={styles.iconBox}>
                      <item.icon size={20} color="#348f9f" />
                    </View>
                    <View style={styles.textContainer}>
                      <Text style={styles.itemLabel}>{item.label}</Text>
                      {item.value !== undefined && typeof item.value === 'string' && (
                        <Text style={styles.itemValue}>{item.value}</Text>
                      )}
                    </View>
                    <ArrowRight size={18} color="#CBD5E1" />
                  </TouchableOpacity>
                  {iIdx < section.items.length - 1 && (
                    <View style={styles.divider} />
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Version 1.0.0</Text>
          <Text style={styles.footerSubtext}>© 2024 Kovais Beauty & Wellness</Text>
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
  luxeExecutiveHeader: {
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 0 : 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
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
  luxeHeaderProfile: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 25,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
    marginLeft: 4,
  },
  luxeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F0FDFA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  itemValue: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 16,
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
});

export default SettingsScreen;
