import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
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
    { id: 'card', name: 'Credit/Debit Card', icon: '💳' },
    { id: 'upi', name: 'UPI', icon: '📱' },
    { id: 'netbanking', name: 'Net Banking', icon: '🏦' },
    { id: 'wallet', name: 'Wallet', icon: '👛' },
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
    <ScrollView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="bg-white px-5 py-6 border-b border-slate-200">
        <Text className="text-2xl font-bold text-slate-800 mb-1">Payment</Text>
        <Text className="text-base text-slate-500">Complete your booking payment</Text>
      </View>

      {/* Payment Summary */}
      <View className="bg-white mx-5 mt-5 p-5 rounded-xl shadow-lg">
        <Text className="text-lg font-semibold text-slate-800 mb-4">Payment Summary</Text>

        <View className="space-y-3">
          <View className="flex-row justify-between">
            <Text className="text-slate-600">Booking ID</Text>
            <Text className="font-medium text-slate-800">{bookingId.slice(-8)}</Text>
          </View>

          <View className="flex-row justify-between">
            <Text className="text-slate-600">Description</Text>
            <Text className="font-medium text-slate-800">{description}</Text>
          </View>

          <View className="border-t border-slate-200 pt-3 mt-3">
            <View className="flex-row justify-between">
              <Text className="text-lg font-semibold text-slate-800">Total Amount</Text>
              <Text className="text-lg font-bold text-green-600">
                {formatAmount(amount)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Payment Methods */}
      <View className="bg-white mx-5 mt-5 p-5 rounded-xl shadow-lg">
        <Text className="text-lg font-semibold text-slate-800 mb-4">Choose Payment Method</Text>

        <View className="space-y-3">
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              className={`flex-row items-center p-4 rounded-lg border-2 ${
                selectedPaymentMethod === method.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 bg-white'
              }`}
              onPress={() => setSelectedPaymentMethod(method.id)}
            >
              <Text className="text-2xl mr-3">{method.icon}</Text>
              <Text className={`flex-1 text-base ${
                selectedPaymentMethod === method.id ? 'font-semibold text-blue-700' : 'text-slate-700'
              }`}>
                {method.name}
              </Text>
              {selectedPaymentMethod === method.id && (
                <Text className="text-blue-500 text-lg">✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Payment Button */}
      <View className="px-5 pb-10">
        <TouchableOpacity
          className={`py-4 rounded-lg items-center mt-8 ${
            selectedPaymentMethod && !isProcessing
              ? 'bg-blue-600'
              : 'bg-slate-300'
          }`}
          onPress={handlePayment}
          disabled={!selectedPaymentMethod || isProcessing}
        >
          {isProcessing ? (
            <View className="flex-row items-center">
              <ActivityIndicator color="white" size="small" />
              <Text className="text-white font-semibold ml-2">Processing...</Text>
            </View>
          ) : (
            <Text className="text-white font-semibold text-lg">
              Pay {formatAmount(amount)}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          className="py-3 rounded-lg items-center mt-4"
          onPress={handleCancel}
          disabled={isProcessing}
        >
          <Text className={`font-medium ${isProcessing ? 'text-slate-400' : 'text-slate-600'}`}>
            Cancel Payment
          </Text>
        </TouchableOpacity>
      </View>

      {/* Security Note */}
      <View className="px-5 pb-5">
        <View className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <Text className="text-sm text-blue-800 text-center">
            🔒 Your payment is secured with 256-bit SSL encryption
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}