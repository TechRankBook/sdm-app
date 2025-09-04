import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { RazorpayService, PaymentData } from '@/services/payment/razorpay';
import { supabase } from '@/services/supabase/client';

interface PaymentStepProps {
  bookingData: any;
  onPaymentSuccess: (paymentDetails: any) => void;
  onBack: () => void;
}

export const PaymentStep: React.FC<PaymentStepProps> = ({
  bookingData,
  onPaymentSuccess,
  onBack,
}) => {
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [paymentAmount, setPaymentAmount] = useState<'partial' | 'full'>('partial');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate payment amounts
  const estimatedFare = 500; // This would come from fare calculation
  const partialPayment = Math.ceil(estimatedFare * 0.25); // 25% advance
  const currentPaymentAmount = paymentAmount === 'full' ? estimatedFare : partialPayment;
  const remainingAmount = paymentAmount === 'full' ? 0 : estimatedFare - partialPayment;

  const paymentMethods = [
    {
      id: 'upi',
      name: 'UPI',
      icon: 'smartphone',
      description: 'PhonePe, GooglePay, Paytm',
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: 'credit-card',
      description: 'Visa, Mastercard, RuPay',
    },
    {
      id: 'wallet',
      name: 'Digital Wallet',
      icon: 'account-balance-wallet',
      description: 'Paytm, Mobikwik, Amazon Pay',
    },
  ];

  const handlePayment = async () => {
    if (!acceptedTerms) {
      Alert.alert('Terms Required', 'Please accept the Terms and Conditions to proceed.');
      return;
    }

    setIsProcessing(true);

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        Alert.alert('Authentication Error', 'Please login to continue booking.');
        setIsProcessing(false);
        return;
      }

      // Create booking in database first
      const bookingPayload = {
        user_id: user.id,
        pickup_address: bookingData.pickupLocation,
        dropoff_address: bookingData.dropoffLocation,
        pickup_latitude: bookingData.pickupCoords?.lat,
        pickup_longitude: bookingData.pickupCoords?.lng,
        dropoff_latitude: bookingData.dropoffCoords?.lat,
        dropoff_longitude: bookingData.dropoffCoords?.lng,
        fare_amount: estimatedFare,
        status: 'pending',
        payment_status: 'pending',
        scheduled_time: bookingData.scheduledDate ? 
          new Date(`${bookingData.scheduledDate.toISOString().split('T')[0]}T${bookingData.scheduledTime}:00`).toISOString() : null,
        service_type: bookingData.serviceType,
        is_scheduled: bookingData.scheduledDate ? true : false,
        is_round_trip: bookingData.isRoundTrip || false,
        return_scheduled_time: bookingData.returnDate && bookingData.returnTime ?
          new Date(`${bookingData.returnDate.toISOString().split('T')[0]}T${bookingData.returnTime}:00`).toISOString() : null,
        trip_type: bookingData.tripType,
        vehicle_type: bookingData.vehicleType,
        passengers: bookingData.passengers || 1,
        special_instructions: bookingData.additionalInstructions,
        advance_amount: currentPaymentAmount,
        remaining_amount: remainingAmount,
        luggage_count: bookingData.luggageCount,
        has_pet: bookingData.hasPet,
      };

      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert(bookingPayload)
        .select()
        .single();

      if (bookingError) {
        console.error('Booking creation error:', bookingError);
        Alert.alert('Booking Error', 'Failed to create booking. Please try again.');
        setIsProcessing(false);
        return;
      }

      console.log('Booking created:', booking.id);

      // Prepare payment data
      const paymentData: PaymentData = {
        amount: RazorpayService.formatAmount(currentPaymentAmount),
        currency: 'INR',
        bookingId: booking.id,
        customerId: user.id,
        customerName: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
        customerEmail: user.email || '',
        customerPhone: user.user_metadata?.phone || '',
        description: `${bookingData.vehicleType} - ${bookingData.serviceType.charAt(0).toUpperCase() + bookingData.serviceType.slice(1)} Ride`,
        paymentMethod: paymentMethod,
        paymentAmount: paymentAmount,
      };

      // Initiate payment
      const paymentResult = await RazorpayService.initiatePayment(paymentData, bookingData);

      if (paymentResult.success) {
        // Update booking status
        const { error: updateError } = await supabase
          .from('bookings')
          .update({
            payment_status: paymentAmount === 'full' ? 'completed' : 'partial',
            status: 'confirmed',
          })
          .eq('id', booking.id);

        if (updateError) {
          console.error('Booking update error:', updateError);
        }

        // Call success handler
        onPaymentSuccess({
          bookingId: booking.id,
          paymentId: paymentResult.paymentId,
          orderId: paymentResult.orderId,
          amount: currentPaymentAmount,
          paymentType: paymentAmount,
          remainingAmount: remainingAmount,
        });

        Alert.alert(
          'Payment Successful!',
          `Your booking has been confirmed. ${paymentAmount === 'partial' ? `Remaining amount: ₹${remainingAmount}` : ''}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Payment Failed', paymentResult.error || 'Payment could not be processed.');
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Payment</Text>
        <Text style={styles.subtitle}>Complete your booking payment</Text>
      </View>

      {/* Payment Amount Selection */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Payment Options</Text>
        <View style={styles.paymentAmountContainer}>
          <TouchableOpacity
            style={[
              styles.paymentAmountOption,
              paymentAmount === 'partial' && styles.paymentAmountOptionSelected,
            ]}
            onPress={() => setPaymentAmount('partial')}
          >
            <View style={styles.paymentAmountHeader}>
              <Text style={[
                styles.paymentAmountTitle,
                paymentAmount === 'partial' && styles.paymentAmountTitleSelected,
              ]}>
                Pay 25% Advance
              </Text>
              <Text style={styles.paymentAmountValue}>₹{partialPayment}</Text>
            </View>
            <Text style={styles.paymentAmountDescription}>
              Pay remaining ₹{remainingAmount} after ride completion
            </Text>
            {paymentAmount === 'partial' && (
              <MaterialIcons name="check-circle" size={20} color="#f59e0b" style={styles.selectedIcon} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentAmountOption,
              paymentAmount === 'full' && styles.paymentAmountOptionSelected,
            ]}
            onPress={() => setPaymentAmount('full')}
          >
            <View style={styles.paymentAmountHeader}>
              <Text style={[
                styles.paymentAmountTitle,
                paymentAmount === 'full' && styles.paymentAmountTitleSelected,
              ]}>
                Pay Full Amount
              </Text>
              <Text style={styles.paymentAmountValue}>₹{estimatedFare}</Text>
            </View>
            <Text style={styles.paymentAmountDescription}>
              Complete payment now, no additional charges
            </Text>
            {paymentAmount === 'full' && (
              <MaterialIcons name="check-circle" size={20} color="#f59e0b" style={styles.selectedIcon} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Payment Method Selection */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Choose Payment Method</Text>
        <View style={styles.paymentMethodsContainer}>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentMethodOption,
                paymentMethod === method.id && styles.paymentMethodOptionSelected,
              ]}
              onPress={() => setPaymentMethod(method.id)}
            >
              <View style={styles.paymentMethodIcon}>
                <MaterialIcons
                  name={method.icon as any}
                  size={24}
                  color={paymentMethod === method.id ? '#f59e0b' : '#6b7280'}
                />
              </View>
              <View style={styles.paymentMethodDetails}>
                <Text style={[
                  styles.paymentMethodName,
                  paymentMethod === method.id && styles.paymentMethodNameSelected,
                ]}>
                  {method.name}
                </Text>
                <Text style={styles.paymentMethodDescription}>
                  {method.description}
                </Text>
              </View>
              {paymentMethod === method.id && (
                <MaterialIcons name="check-circle" size={20} color="#f59e0b" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Terms and Conditions */}
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.termsContainer}
          onPress={() => setAcceptedTerms(!acceptedTerms)}
        >
          <MaterialIcons
            name={acceptedTerms ? 'check-box' : 'check-box-outline-blank'}
            size={24}
            color={acceptedTerms ? '#f59e0b' : '#6b7280'}
          />
          <Text style={styles.termsText}>
            I accept the{' '}
            <Text style={styles.termsLink}>Terms and Conditions</Text>
            {' '}and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.payButton,
            (!acceptedTerms || isProcessing) && styles.payButtonDisabled,
          ]}
          onPress={handlePayment}
          disabled={!acceptedTerms || isProcessing}
        >
          {isProcessing ? (
            <View style={styles.payButtonContent}>
              <ActivityIndicator color="white" size="small" />
              <Text style={[styles.payButtonText, styles.payButtonTextProcessing]}>
                Processing...
              </Text>
            </View>
          ) : (
            <Text style={styles.payButtonText}>
              Pay ₹{currentPaymentAmount}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          disabled={isProcessing}
        >
          <Text style={[styles.backButtonText, isProcessing && styles.backButtonTextDisabled]}>
            Back to Confirmation
          </Text>
        </TouchableOpacity>
      </View>

      {/* Security Note */}
      <View style={styles.securityNote}>
        <MaterialIcons name="security" size={16} color="#f59e0b" />
        <Text style={styles.securityText}>
          Your payment is secured with 256-bit SSL encryption
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffbeb',
  },
  header: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#b45309',
  },
  card: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#f59e0b',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#fef3c7',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 16,
  },
  paymentAmountContainer: {
    gap: 12,
  },
  paymentAmountOption: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 16,
    position: 'relative',
  },
  paymentAmountOptionSelected: {
    borderColor: '#f59e0b',
    backgroundColor: '#fffbeb',
  },
  paymentAmountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  paymentAmountTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  paymentAmountTitleSelected: {
    color: '#92400e',
  },
  paymentAmountValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f59e0b',
  },
  paymentAmountDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  selectedIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  paymentMethodsContainer: {
    gap: 12,
  },
  paymentMethodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 8,
  },
  paymentMethodOptionSelected: {
    borderColor: '#f59e0b',
    backgroundColor: '#fffbeb',
  },
  paymentMethodIcon: {
    marginRight: 16,
  },
  paymentMethodDetails: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 2,
  },
  paymentMethodNameSelected: {
    color: '#92400e',
  },
  paymentMethodDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  termsLink: {
    color: '#f59e0b',
    fontWeight: '500',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
  payButton: {
    backgroundColor: '#f59e0b',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  payButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  payButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  payButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  payButtonTextProcessing: {
    marginLeft: 0,
  },
  backButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#b45309',
  },
  backButtonTextDisabled: {
    color: '#d1d5db',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 8,
  },
  securityText: {
    fontSize: 14,
    color: '#b45309',
    textAlign: 'center',
  },
});