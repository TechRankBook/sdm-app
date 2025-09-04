import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { RazorpayService } from '../../services/payment/razorpay';
import { usePayment } from '../../hooks/usePayment';

interface RouteParams {
  bookingId: string;
  amount: number;
  description: string;
}

export default function PaymentScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { processPayment, isProcessing, formatAmount } = usePayment();

  const { bookingId, amount, description } = route.params as RouteParams;

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');

  const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: 'credit-card', iconType: 'MaterialIcons' },
    { id: 'upi', name: 'UPI', icon: 'smartphone', iconType: 'MaterialIcons' },
    { id: 'netbanking', name: 'Net Banking', icon: 'account-balance', iconType: 'MaterialIcons' },
    { id: 'wallet', name: 'Wallet', icon: 'account-balance-wallet', iconType: 'MaterialIcons' },
  ];

  const handlePayment = async () => {
    const result = await processPayment(bookingId, amount, description || 'Cab booking payment');

    if (result.success) {
      navigation.goBack();
    }
    // Error handling is done in the hook
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Payment',
      'Are you sure you want to cancel this payment?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: () => navigation.goBack(),
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Payment</Text>
        <Text style={styles.headerSubtitle}>Complete your booking payment</Text>
      </View>

      {/* Payment Summary */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Payment Summary</Text>

        <View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Booking ID</Text>
            <Text style={styles.summaryValue}>{bookingId.slice(-8)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Description</Text>
            <Text style={styles.summaryValue}>{description}</Text>
          </View>

          <View style={styles.summaryDivider}>
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalAmount}>
                {formatAmount(amount)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Payment Methods */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Choose Payment Method</Text>

        <View>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentMethod,
                selectedPaymentMethod === method.id && styles.paymentMethodSelected
              ]}
              onPress={() => setSelectedPaymentMethod(method.id)}
            >
              <View style={styles.paymentMethodIcon}>
                <MaterialIcons name={method.icon as any} size={24} color="#64748b" />
              </View>
              <Text style={[
                styles.paymentMethodName,
                selectedPaymentMethod === method.id && styles.paymentMethodNameSelected
              ]}>
                {method.name}
              </Text>
              {selectedPaymentMethod === method.id && (
                <MaterialIcons name="check" size={18} color="#2563eb" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Payment Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.payButton,
            selectedPaymentMethod && !isProcessing && styles.payButtonActive
          ]}
          onPress={handlePayment}
          disabled={!selectedPaymentMethod || isProcessing}
        >
          {isProcessing ? (
            <View style={styles.payButtonContent}>
              <ActivityIndicator color="white" size="small" />
              <Text style={[styles.payButtonText, styles.payButtonTextProcessing]}>Processing...</Text>
            </View>
          ) : (
            <Text style={styles.payButtonText}>
              Pay {formatAmount(amount)}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancel}
          disabled={isProcessing}
        >
          <Text style={[
            styles.cancelButtonText,
            isProcessing && styles.cancelButtonTextDisabled
          ]}>
            Cancel Payment
          </Text>
        </TouchableOpacity>
      </View>

      {/* Security Note */}
      <View style={styles.securityNote}>
        <View style={styles.securityCard}>
          <View style={styles.securityContent}>
            <MaterialIcons name="security" size={16} color="#1e40af" />
            <Text style={styles.securityText}>
              Your payment is secured with 256-bit SSL encryption
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  card: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
  summaryDivider: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 12,
    marginTop: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    marginBottom: 12,
  },
  paymentMethodSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  paymentMethodIcon: {
    marginRight: 12,
  },
  paymentMethodName: {
    flex: 1,
    fontSize: 16,
    color: '#475569',
  },
  paymentMethodNameSelected: {
    fontWeight: '600',
    color: '#1d4ed8',
  },
  paymentMethodCheck: {
    fontSize: 18,
    color: '#2563eb',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  payButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 32,
    backgroundColor: '#cbd5e1',
  },
  payButtonActive: {
    backgroundColor: '#2563eb',
  },
  payButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  payButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  payButtonTextProcessing: {
    marginLeft: 8,
  },
  cancelButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#475569',
  },
  cancelButtonTextDisabled: {
    color: '#94a3b8',
  },
  securityNote: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  securityCard: {
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  securityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  securityText: {
    fontSize: 14,
    color: '#1e40af',
    textAlign: 'center',
  },
});