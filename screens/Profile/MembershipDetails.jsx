import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  ProgressBarAndroid,
  Platform
} from 'react-native';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';

// If using iOS, we'll need a different progress component
const ProgressBar = ({ progress, ...props }) => {
  if (Platform.OS === 'android') {
    return <ProgressBarAndroid {...props} progress={progress} />;
  } else {
    // On iOS, we'd typically use a different component
    // For this example, we'll use a simple View to show the progress
    return (
      <View style={{ height: 10, backgroundColor: '#e0e0e0', borderRadius: 5, marginVertical: 8 }}>
        <View 
          style={{
            height: '100%',
            width: `${progress * 100}%`,
            backgroundColor: props.color || '#007bff',
            borderRadius: 5
          }}
        />
      </View>
    );
  }
};

const MembershipDetails = ({ membership, goBack }) => {
  // Calculate progress to next level
  const calculateProgress = () => {
    // This would typically be based on business logic
    // For this example, we'll use hard-coded values
    const nextLevelPoints = membership.level === 'Gold' ? 3000 : 5000;
    const progress = membership.points / nextLevelPoints;
    return progress > 1 ? 1 : progress; // Cap at 100%
  };

  const getNextLevel = () => {
    switch(membership.level) {
      case 'Bronze':
        return 'Silver';
      case 'Silver':
        return 'Gold';
      case 'Gold':
        return 'Platinum';
      case 'Platinum':
        return 'Diamond';
      default:
        return 'Next Tier';
    }
  };

  const getPointsToNextLevel = () => {
    // Again, this would typically follow business rules
    const nextLevelThresholds = {
      'Bronze': 1000,
      'Silver': 2000,
      'Gold': 5000,
      'Platinum': 10000,
      'Diamond': null // Top tier
    };
    
    const threshold = nextLevelThresholds[membership.level];
    if (threshold === null) return 0;
    
    const remaining = threshold - membership.points;
    return remaining > 0 ? remaining : 0;
  };

  const handleRedeemPoints = () => {
    Alert.alert(
      'Redeem Points',
      'This would navigate to a points redemption catalog or form.',
      [{ text: 'OK' }]
    );
  };

  const handleRenewMembership = () => {
    Alert.alert(
      'Renew Membership',
      'This would navigate to a membership renewal form or process.',
      [{ text: 'OK' }]
    );
  };

  const getMembershipColor = () => {
    switch(membership.level) {
      case 'Bronze': return '#cd7f32';
      case 'Silver': return '#c0c0c0';
      case 'Gold': return '#ffd700';
      case 'Platinum': return '#e5e4e2';
      case 'Diamond': return '#b9f2ff';
      default: return '#333333';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={26} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Membership</Text>
        <View style={styles.placeholder}></View>
      </View>

      <ScrollView style={styles.scrollContainer}>
        <View style={styles.content}>
          <View style={[styles.membershipCard, { borderColor: getMembershipColor() }]}>
            <View style={styles.membershipHeader}>
              <FontAwesome5 
                name="crown" 
                size={24} 
                color={getMembershipColor()} 
                style={styles.crownIcon} 
              />
              <Text style={[styles.membershipLevel, { color: getMembershipColor() }]}>
                {membership.level} Membership
              </Text>
            </View>
            
            <View style={styles.membershipInfo}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Member Since</Text>
                <Text style={styles.infoValue}>January 2023</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Valid Until</Text>
                <Text style={styles.infoValue}>{membership.validUntil}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Member ID</Text>
                <Text style={styles.infoValue}>WL-2023-8754</Text>
              </View>
            </View>
          </View>

          <View style={styles.pointsContainer}>
            <Text style={styles.sectionTitle}>Loyalty Points</Text>
            <View style={styles.pointsCard}>
              <View style={styles.pointsHeader}>
                <View>
                  <Text style={styles.pointsLabel}>Current Points</Text>
                  <Text style={styles.pointsValue}>{membership.points}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.redeemButton}
                  onPress={handleRedeemPoints}
                >
                  <Text style={styles.redeemButtonText}>Redeem</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.progressContainer}>
                <Text style={styles.progressLabel}>
                  {getPointsToNextLevel()} points to {getNextLevel()}
                </Text>
                <ProgressBar 
                  progress={calculateProgress()} 
                  styleAttr="Horizontal" 
                  color="#007bff"
                  indeterminate={false}
                />
              </View>

              <View style={styles.pointsHistory}>
                <Text style={styles.historyTitle}>Recent Point Activity</Text>
                <View style={styles.historyItem}>
                  <View>
                    <Text style={styles.historyDesc}>Spa Treatment</Text>
                    <Text style={styles.historyDate}>Apr 18, 2025</Text>
                  </View>
                  <Text style={styles.pointsEarned}>+150 pts</Text>
                </View>
                <View style={styles.historyItem}>
                  <View>
                    <Text style={styles.historyDesc}>Hotel Stay</Text>
                    <Text style={styles.historyDate}>Apr 15, 2025</Text>
                  </View>
                  <Text style={styles.pointsEarned}>+500 pts</Text>
                </View>
                <View style={styles.historyItem}>
                  <View>
                    <Text style={styles.historyDesc}>Redeemed for Free Spa</Text>
                    <Text style={styles.historyDate}>Mar 30, 2025</Text>
                  </View>
                  <Text style={styles.pointsSpent}>-1000 pts</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.benefitsContainer}>
            <Text style={styles.sectionTitle}>Membership Benefits</Text>
            <View style={styles.benefitsCard}>
              {membership.benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <Ionicons name="checkmark-circle" size={24} color="#4CAF50" style={styles.checkIcon} />
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>
          </View>

          <TouchableOpacity 
            style={styles.renewButton}
            onPress={handleRenewMembership}
          >
            <Text style={styles.renewButtonText}>Renew Membership</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.upgradeButton}>
            <Text style={styles.upgradeButtonText}>Upgrade to {getNextLevel()}</Text>
            <MaterialIcons name="arrow-forward" size={20} color="#007bff" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 36,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  membershipCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 22,
    borderLeftWidth: 6,
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    marginBottom: 20,
  },
  membershipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  crownIcon: {
    marginRight: 12,
  },
  membershipLevel: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  membershipInfo: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 15,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 15,
    color: '#666',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  pointsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  pointsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  pointsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  pointsLabel: {
    fontSize: 15,
    color: '#666',
    marginBottom: 5,
  },
  pointsValue: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#007bff',
  },
  redeemButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  redeemButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  pointsHistory: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 15,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  historyDesc: {
    fontSize: 15,
    color: '#333',
  },
  historyDate: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  pointsEarned: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4CAF50',
  },
  pointsSpent: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FF5722',
  },
  benefitsContainer: {
    marginBottom: 20,
  },
  benefitsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  checkIcon: {
    marginRight: 12,
  },
  benefitText: {
    fontSize: 16,
    color: '#333',
  },
  renewButton: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  renewButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  upgradeButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#007bff',
    marginBottom: 20,
  },
  upgradeButtonText: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 5,
  },
});

export default MembershipDetails;