import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Import services and stores
import { AuthService } from '../../services/supabase/auth';
import { useAppStore } from '../../stores/appStore';

// Import types
import { AuthStackParamList } from '@/types/navigation';

type OTPVerificationScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'OTPVerification'>;

export default function OTPVerificationScreen() {
  console.log('🔵 OTPVerificationScreen component rendered');
  const navigation = useNavigation<OTPVerificationScreenNavigationProp>();
  const route = useRoute();
  const { setLoading } = useAppStore();

  const params = route.params as { phoneNumber: string } | undefined;
  const phoneNumber = params?.phoneNumber || '';

  console.log('OTPVerificationScreen mounted with phone:', phoneNumber);

  // Handle case where phone number is not provided
  if (!phoneNumber) {
    console.error('No phone number provided to OTPVerificationScreen');
    console.log('Params object:', params);
    console.log('Route params keys:', Object.keys(params || {}));
    Alert.alert('Error', 'Phone number not found. Please try again.');
    setTimeout(() => {
      navigation.navigate('Login');
    }, 2000); // Delay to show the alert
    return null;
  }

  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      Alert.alert('Error', 'Please enter the OTP');
      return;
    }

    if (otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setLoading(true);

    try {
      const { data, error } = await AuthService.verifyPhoneOTP(phoneNumber, otp);

      if (error) {
        Alert.alert('Verification Failed', error.message || 'Invalid OTP code');
      } else {
        // Navigation will be handled automatically by the auth state listener
        console.log('OTP verification successful');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    setLoading(true);

    try {
      const { data, error } = await AuthService.signInWithPhone(phoneNumber);

      if (error) {
        Alert.alert('Error', error.message || 'Failed to resend OTP');
      } else {
        Alert.alert('OTP Sent', 'A new verification code has been sent to your phone');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };


  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        style={styles.scrollView}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Verify Phone</Text>
            <Text style={styles.subtitle}>
              Enter the 6-digit code sent to {phoneNumber}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* OTP Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Verification Code</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
                maxLength={6}
                placeholderTextColor="#64748b"
              />
            </View>

            {/* Verify Button */}
            <TouchableOpacity
              onPress={handleVerifyOTP}
              style={[styles.button, isLoading && styles.buttonDisabled]}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </Text>
            </TouchableOpacity>

            {/* Resend OTP */}
            <TouchableOpacity
              onPress={handleResendOTP}
              style={styles.resendButton}
              disabled={isLoading}
            >
              <Text style={styles.resendText}>Didn't receive code? Resend OTP</Text>
            </TouchableOpacity>
          </View>

          {/* Back to Login Link */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={handleBackToLogin} disabled={isLoading}>
              <Text style={styles.footerLink}>Change phone number</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    textAlign: 'center',
    letterSpacing: 2,
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  resendButton: {
    alignSelf: 'center',
    marginTop: 16,
  },
  resendText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  footerLink: {
    color: '#2563eb',
    fontWeight: '600',
  },
});