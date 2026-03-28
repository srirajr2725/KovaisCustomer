// PreferencesScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  Alert,
  StatusBar,
  Platform,
  SafeAreaView
} from 'react-native';
import { 
  ChevronLeft, 
  Hotel, 
  Sparkles, 
  Scissors, 
  Dumbbell,
  CheckCircle2,
  Settings
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

const PreferencesScreen = ({ preferences, onSave, goBack, navigation }) => {
  const [activeTab, setActiveTab] = useState('hotel');
  
  const handleBack = () => {
    if (goBack) {
      goBack();
    } else if (navigation) {
      navigation.goBack();
    }
  };

  const [prefsData, setPrefsData] = useState({
    hotel: { ...preferences.hotel },
    spa: { ...preferences.spa },
    salon: { ...preferences.salon },
    gym: { ...preferences.gym }
  });

  const [customPreferences, setCustomPreferences] = useState({
    hotel: {
      earlyCheckIn: false,
      turndownService: true,
      dailyNewspaper: false,
      welcomeAmenities: true
    },
    spa: {
      aromatherapy: true,
      dimLighting: true,
      musicPreference: 'Nature Sounds'
    },
    salon: {
      organicProducts: true,
      allergies: ''
    },
    gym: {
      personalTrainer: false,
      fitnessAssessment: true,
      nutrition: false
    }
  });

  const handleSave = () => {
    onSave(activeTab, {
      ...prefsData[activeTab],
      ...(activeTab === 'hotel' || activeTab === 'spa' || activeTab === 'salon' || activeTab === 'gym' 
         ? customPreferences[activeTab] 
         : {})
    });
    Alert.alert('Success', `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} preferences updated.`);
  };

  const updatePreference = (field, value) => {
    setPrefsData({
      ...prefsData,
      [activeTab]: {
        ...prefsData[activeTab],
        [field]: value
      }
    });
  };

  const updateCustomPreference = (field, value) => {
    setCustomPreferences({
      ...customPreferences,
      [activeTab]: {
        ...customPreferences[activeTab],
        [field]: value
      }
    });
  };

  const tabs = [
    { key: 'hotel', icon: Hotel, label: 'Hotel' },
    { key: 'spa', icon: Sparkles, label: 'Spa' },
    { key: 'salon', icon: Scissors, label: 'Salon' },
    { key: 'gym', icon: Dumbbell, label: 'Gym' },
  ];

  const renderHotelPreferences = () => (
    <View style={styles.luxeContentCard}>
      <Text style={styles.sectionHeading}>Stay Experience</Text>
      
      <View style={styles.luxeInputGroup}>
        <Text style={styles.luxeInputLabel}>Room Type Preference</Text>
        <TextInput
          style={styles.luxeInput}
          value={prefsData.hotel.roomType}
          onChangeText={(text) => updatePreference('roomType', text)}
          placeholder="e.g. Ocean View, Penthouse"
          placeholderTextColor="#94A3B8"
        />
      </View>

      <View style={styles.luxeInputGroup}>
        <Text style={styles.luxeInputLabel}>Bedding preference</Text>
        <TextInput
          style={styles.luxeInput}
          value={prefsData.hotel.bedPreference}
          onChangeText={(text) => updatePreference('bedPreference', text)}
          placeholder="e.g. King, Twin"
          placeholderTextColor="#94A3B8"
        />
      </View>

      <View style={styles.luxeInputGroup}>
        <Text style={styles.luxeInputLabel}>Special Accommodations</Text>
        <TextInput
          style={[styles.luxeInput, { height: 100, textAlignVertical: 'top' }]}
          value={prefsData.hotel.specialRequests}
          onChangeText={(text) => updatePreference('specialRequests', text)}
          placeholder="Note any specific requirements..."
          placeholderTextColor="#94A3B8"
          multiline
        />
      </View>

      <Text style={[styles.sectionHeading, { marginTop: 24 }]}>Bespoke Services</Text>
      
      {[
        { label: 'Early Check-In', field: 'earlyCheckIn' },
        { label: 'Turndown Service', field: 'turndownService' },
        { label: 'Daily Newspaper', field: 'dailyNewspaper' },
        { label: 'Welcome Amenities', field: 'welcomeAmenities' }
      ].map((item, idx) => (
        <View key={idx} style={styles.luxeSwitchItem}>
          <Text style={styles.luxeSwitchLabel}>{item.label}</Text>
          <Switch
            value={customPreferences.hotel[item.field]}
            onValueChange={(value) => updateCustomPreference(item.field, value)}
            trackColor={{ false: "#F1F5F9", true: "#348f9f80" }}
            thumbColor={customPreferences.hotel[item.field] ? "#348f9f" : "#CBD5E1"}
          />
        </View>
      ))}
    </View>
  );

  const renderSpaPreferences = () => (
    <View style={styles.luxeContentCard}>
      <Text style={styles.sectionHeading}>Wellness Journey</Text>
      
      <View style={styles.luxeInputGroup}>
        <Text style={styles.luxeInputLabel}>Favorite Therapies</Text>
        <TextInput
          style={styles.luxeInput}
          value={prefsData.spa.favoriteTherapies.join(', ')}
          onChangeText={(text) => updatePreference(
            'favoriteTherapies', 
            text.split(',').map(item => item.trim())
          )}
          placeholder="Aromatherapy, Deep Tissue..."
          placeholderTextColor="#94A3B8"
        />
      </View>

      <View style={styles.luxeInputGroup}>
        <Text style={styles.luxeInputLabel}>Preferred Therapist</Text>
        <TextInput
          style={styles.luxeInput}
          value={prefsData.spa.preferredTherapist}
          onChangeText={(text) => updatePreference('preferredTherapist', text)}
          placeholder="Enter name"
          placeholderTextColor="#94A3B8"
        />
      </View>
      
      <Text style={[styles.sectionHeading, { marginTop: 24 }]}>Ambiance</Text>
      
      {[
        { label: 'Aromatherapy', field: 'aromatherapy' },
        { label: 'Signature Lighting', field: 'dimLighting' }
      ].map((item, idx) => (
        <View key={idx} style={styles.luxeSwitchItem}>
          <Text style={styles.luxeSwitchLabel}>{item.label}</Text>
          <Switch
            value={customPreferences.spa[item.field]}
            onValueChange={(value) => updateCustomPreference(item.field, value)}
            trackColor={{ false: "#F1F5F9", true: "#348f9f80" }}
            thumbColor={customPreferences.spa[item.field] ? "#348f9f" : "#CBD5E1"}
          />
        </View>
      ))}

      <View style={[styles.luxeInputGroup, { marginTop: 12 }]}>
        <Text style={styles.luxeInputLabel}>Aural Preference</Text>
        <TextInput
          style={styles.luxeInput}
          value={customPreferences.spa.musicPreference}
          onChangeText={(text) => updateCustomPreference('musicPreference', text)}
          placeholder="Soft Jazz, Nature Sounds..."
          placeholderTextColor="#94A3B8"
        />
      </View>
    </View>
  );

  const renderSalonPreferences = () => (
    <View style={styles.luxeContentCard}>
      <Text style={styles.sectionHeading}>Style Identity</Text>
      
      <View style={styles.luxeInputGroup}>
        <Text style={styles.luxeInputLabel}>Texture/Type</Text>
        <TextInput
          style={styles.luxeInput}
          value={prefsData.salon.hairType}
          onChangeText={(text) => updatePreference('hairType', text)}
          placeholder="Curly, Straight, Thin..."
          placeholderTextColor="#94A3B8"
        />
      </View>

      <View style={styles.luxeInputGroup}>
        <Text style={styles.luxeInputLabel}>Executive Stylist</Text>
        <TextInput
          style={styles.luxeInput}
          value={prefsData.salon.preferredStylist}
          onChangeText={(text) => updatePreference('preferredStylist', text)}
          placeholder="Enter name"
          placeholderTextColor="#94A3B8"
        />
      </View>

      <View style={styles.luxeInputGroup}>
        <Text style={styles.luxeInputLabel}>Sensitivities & Concerns</Text>
        <TextInput
          style={styles.luxeInput}
          value={prefsData.salon.productSensitivities}
          onChangeText={(text) => updatePreference('productSensitivities', text)}
          placeholder="List any concerns..."
          placeholderTextColor="#94A3B8"
        />
      </View>
      
      <Text style={[styles.sectionHeading, { marginTop: 24 }]}>Preferences</Text>
      
      <View style={styles.luxeSwitchItem}>
        <Text style={styles.luxeSwitchLabel}>Bio-Organic Products Only</Text>
        <Switch
          value={customPreferences.salon.organicProducts}
          onValueChange={(value) => updateCustomPreference('organicProducts', value)}
          trackColor={{ false: "#F1F5F9", true: "#348f9f80" }}
          thumbColor={customPreferences.salon.organicProducts ? "#348f9f" : "#CBD5E1"}
        />
      </View>

      <View style={[styles.luxeInputGroup, { marginTop: 12 }]}>
        <Text style={styles.luxeInputLabel}>Specific Allergies</Text>
        <TextInput
          style={[styles.luxeInput, { height: 80, textAlignVertical: 'top' }]}
          value={customPreferences.salon.allergies}
          onChangeText={(text) => updateCustomPreference('allergies', text)}
          placeholder="Note any specific allergies..."
          placeholderTextColor="#94A3B8"
          multiline
        />
      </View>
    </View>
  );

  const renderGymPreferences = () => (
    <View style={styles.luxeContentCard}>
      <Text style={styles.sectionHeading}>Peak Performance</Text>
      
      <View style={styles.luxeInputGroup}>
        <Text style={styles.luxeInputLabel}>Primary Goals</Text>
        <TextInput
          style={styles.luxeInput}
          value={prefsData.gym.fitnessGoals}
          onChangeText={(text) => updatePreference('fitnessGoals', text)}
          placeholder="Weight Loss, Muscle Gain..."
          placeholderTextColor="#94A3B8"
        />
      </View>

      <View style={styles.luxeInputGroup}>
        <Text style={styles.luxeInputLabel}>Preferred Disciplines</Text>
        <TextInput
          style={styles.luxeInput}
          value={prefsData.gym.preferredClasses.join(', ')}
          onChangeText={(text) => updatePreference(
            'preferredClasses', 
            text.split(',').map(item => item.trim())
          )}
          placeholder="Yoga, HIIT, Cardio..."
          placeholderTextColor="#94A3B8"
        />
      </View>

      <View style={styles.luxeInputGroup}>
        <Text style={styles.luxeInputLabel}>Equipment Requirements</Text>
        <TextInput
          style={styles.luxeInput}
          value={prefsData.gym.equipmentNeeds}
          onChangeText={(text) => updatePreference('equipmentNeeds', text)}
          placeholder="State any specific needs..."
          placeholderTextColor="#94A3B8"
        />
      </View>
      
      <Text style={[styles.sectionHeading, { marginTop: 24 }]}>Professional Services</Text>
      
      {[
        { label: 'Personal Trainer', field: 'personalTrainer' },
        { label: 'Fitness Assessment', field: 'fitnessAssessment' },
        { label: 'Nutrition Strategy', field: 'nutrition' }
      ].map((item, idx) => (
        <View key={idx} style={styles.luxeSwitchItem}>
          <Text style={styles.luxeSwitchLabel}>{item.label}</Text>
          <Switch
            value={customPreferences.gym[item.field]}
            onValueChange={(value) => updateCustomPreference(item.field, value)}
            trackColor={{ false: "#F1F5F9", true: "#348f9f80" }}
            thumbColor={customPreferences.gym[item.field] ? "#348f9f" : "#CBD5E1"}
          />
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ExecutiveHeader title="Preferences" onBack={handleBack} />

      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabBtn, activeTab === tab.key && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <tab.icon size={20} color={activeTab === tab.key ? '#348f9f' : '#94A3B8'} />
              <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeTab === 'hotel' && renderHotelPreferences()}
        {activeTab === 'spa' && renderSpaPreferences()}
        {activeTab === 'salon' && renderSalonPreferences()}
        {activeTab === 'gym' && renderGymPreferences()}

        <View style={styles.actionSection}>
          <TouchableOpacity style={styles.luxeBtnSecondary} onPress={goBack}>
            <Text style={styles.luxeBtnSecondaryTxt}>Discard</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.luxeBtnPrimary} onPress={handleSave}>
            <Text style={styles.luxeBtnPrimaryTxt}>Save Changes</Text>
            <CheckCircle2 size={18} color="#FFFFFF" />
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
  // Header Styles
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
  // Tabs
  tabContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tabScroll: {
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
    backgroundColor: '#F8FAFC',
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#348f9f30',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94A3B8',
    marginLeft: 10,
  },
  tabLabelActive: {
    color: '#348f9f',
  },
  // Content
  scrollContent: {
    flex: 1,
  },
  luxeContentCard: {
    padding: 24,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  luxeInputGroup: {
    marginBottom: 20,
  },
  luxeInputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  luxeInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '600',
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
  },
  luxeSwitchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  luxeSwitchLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
  },
  // Actions
  actionSection: {
    flexDirection: 'row',
    padding: 24,
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  luxeBtnPrimary: {
    flex: 2,
    backgroundColor: '#348f9f',
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    elevation: 4,
    shadowColor: '#348f9f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  luxeBtnPrimaryTxt: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  luxeBtnSecondary: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
  },
  luxeBtnSecondaryTxt: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default PreferencesScreen;