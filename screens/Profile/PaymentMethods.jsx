import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image
} from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

const PaymentMethods = ({ goBack }) => {
  const [paymentMethods, setPaymentMethods] = useState([
    { 
      id: '1', 
      type: 'credit', 
      cardType: 'Visa',
      last4: '4567',
      expiry: '04/26',
      isDefault: true,
      cardholderName: 'John Doe'
    },
    { 
      id: '2', 
      type: 'credit', 
      cardType: 'Mastercard',
      last4: '8901',
      expiry: '09/27',
      isDefault: false,
      cardholderName: 'John Doe'
    }
  ]);

  const getCardIcon = (cardType) => {
    switch(cardType.toLowerCase()) {
      case 'visa':
        return 'cc-visa';
      case 'mastercard':
        return 'cc-mastercard';
      case 'amex':
        return 'cc-amex';
      case 'discover':
        return 'cc-discover';
      default:
        return 'credit-card';
    }
  };

  const getCardColor = (cardType) => {
    switch(cardType.toLowerCase()) {
      case 'visa':
        return '#1A1F71';
      case 'mastercard':
        return '#EB001B';
      case 'amex':
        return '#2E77BB';
      case 'discover':
        return '#FF6600';
      default:
        return '#333333';
    }
  };

  const setDefaultPaymentMethod = (id) => {
    const updatedMethods = paymentMethods.map(method => ({
      ...method,
      isDefault: method.id === id
    }));
    setPaymentMethods(updatedMethods);
    Alert.alert('Success', 'Default payment method updated');
  };

  const deletePaymentMethod = (id) => {
    Alert.alert(
      'Delete Payment Method',
      'Are you sure you want to remove this payment method?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          onPress: () => {
            const updatedMethods = paymentMethods.filter(method => method.id !== id);
            setPaymentMethods(updatedMethods);
          },
          style: 'destructive'
        }
      ]
    );
  };

  const handleAddPaymentMethod = () => {
    // This would typically open a form or modal to add a new payment method
    Alert.alert('Add Payment Method', 'This feature would open a form to add a new payment method.');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={26} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Payment Methods</Text>
        <View style={styles.placeholder}></View>
      </View>

      <ScrollView style={styles.scrollContainer}>
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Your Cards</Text>
          
          {paymentMethods.map(method => (
            <View key={method.id} style={styles.cardContainer}>
              <View style={[styles.card, { borderLeftColor: getCardColor(method.cardType) }]}>
                <View style={styles.cardHeader}>
                  <FontAwesome5 
                    name={getCardIcon(method.cardType)} 
                    size={28} 
                    color={getCardColor(method.cardType)} 
                    style={styles.cardIcon} 
                  />
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardType}>{method.cardType}</Text>
                    <Text style={styles.cardNumber}>•••• •••• •••• {method.last4}</Text>
                  </View>
                  {method.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultText}>Default</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.cardDetails}>
                  <View>
                    <Text style={styles.detailLabel}>CARDHOLDER</Text>
                    <Text style={styles.detailValue}>{method.cardholderName}</Text>
                  </View>
                  <View>
                    <Text style={styles.detailLabel}>EXPIRES</Text>
                    <Text style={styles.detailValue}>{method.expiry}</Text>
                  </View>
                </View>

                <View style={styles.cardActions}>
                  {!method.isDefault && (
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => setDefaultPaymentMethod(method.id)}
                    >
                      <Text style={styles.actionButtonText}>Set Default</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => deletePaymentMethod(method.id)}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}

          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddPaymentMethod}
          >
            <MaterialIcons name="add" size={24} color="#007bff" />
            <Text style={styles.addButtonText}>Add New Payment Method</Text>
          </TouchableOpacity>

          <View style={styles.securityInfo}>
            <MaterialIcons name="lock" size={22} color="#666" style={styles.securityIcon} />
            <Text style={styles.securityText}>
              Your payment information is securely stored and encrypted. We never store your full card details on our servers.
            </Text>
          </View>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    color: '#333',
  },
  cardContainer: {
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    borderLeftWidth: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardIcon: {
    marginRight: 15,
  },
  cardInfo: {
    flex: 1,
  },
  cardType: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  cardNumber: {
    fontSize: 16,
    color: '#666',
    marginTop: 2,
  },
  defaultBadge: {
    backgroundColor: '#e6f2ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultText: {
    color: '#007bff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 3,
  },
  detailValue: {
    fontSize: 15,
    color: '#333',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 10,
    backgroundColor: '#f0f0f0',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#333',
  },
  deleteButton: {
    backgroundColor: '#ffecec',
  },
  deleteButtonText: {
    color: '#dc3545',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007bff',
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 10,
    marginBottom: 25,
  },
  addButtonText: {
    fontSize: 16,
    color: '#007bff',
    marginLeft: 8,
  },
  securityInfo: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  securityIcon: {
    marginRight: 12,
  },
  securityText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default PaymentMethods;