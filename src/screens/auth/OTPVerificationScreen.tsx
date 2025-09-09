import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Toast from 'react-native-toast-message';

// Import services and stores
import { AuthService } from '../../services/supabase/auth';
import { useAppStore } from '../../stores/appStore';

// Import error message utilities
import { getUserFriendlyError } from '../../utils/errorMessages';

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
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: 'Phone number not found. Please try again.',
    });
    setTimeout(() => {
      navigation.navigate('Login');
    }, 2000); // Delay to show the toast
    return null;
  }

  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Timer state for resend OTP restriction
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const RESEND_COOLDOWN = 60; // 60 seconds cooldown

  // Timer effect for countdown
  useEffect(() => {
    if (resendTimer > 0) {
      timerRef.current = setTimeout(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }

    // Cleanup timer on unmount or when timer reaches 0
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [resendTimer]);

  // Start resend cooldown timer
  const startResendCooldown = () => {
    setCanResend(false);
    setResendTimer(RESEND_COOLDOWN);
  };

  // Cleanup timer when component unmounts
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter the OTP',
      });
      return;
    }

    if (otp.length !== 6) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a valid 6-digit OTP',
      });
      return;
    }

    setIsLoading(true);
    setLoading(true);

    try {
      const { data, error } = await AuthService.verifyPhoneOTP(phoneNumber, otp);

      if (error) {
        Toast.show({
          type: 'error',
          text1: 'Verification Failed',
          text2: getUserFriendlyError(error),
        });
      } else {
        // Navigation will be handled automatically by the auth state listener
        console.log('OTP verification successful');
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Phone number verified successfully',
        });
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: getUserFriendlyError(error as Error),
      });
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) {
      Toast.show({
        type: 'warning',
        text1: 'Please Wait',
        text2: `You can resend OTP in ${resendTimer} seconds`,
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await AuthService.signInWithPhone(phoneNumber);

      if (error) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: getUserFriendlyError(error),
        });
      } else {
        Toast.show({
          type: 'success',
          text1: 'OTP Sent',
          text2: 'A new verification code has been sent to your phone',
        });
        // Start cooldown timer after successful send
        startResendCooldown();
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: getUserFriendlyError(error as Error),
      });
    } finally {
      setIsLoading(false);
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
              {/* <Text style={styles.label}>Verification Code</Text> */}
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
              style={[styles.resendButton, (!canResend || isLoading) && styles.resendButtonDisabled]}
              disabled={!canResend || isLoading}
            >
              <Text style={[styles.resendText, (!canResend || isLoading) && styles.resendTextDisabled]}>
                {canResend
                  ? "Didn't receive code? Resend OTP"
                  : `Resend OTP in ${resendTimer}s`
                }
              </Text>
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
    backgroundColor: '#2E8B57', // Traditional forest green
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
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendText: {
    color: '#2E8B57', // Traditional forest green
    fontSize: 14,
    fontWeight: '500',
  },
  resendTextDisabled: {
    color: '#64748b',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  footerLink: {
    color: '#2E8B57', // Traditional forest green
    fontWeight: '600',
  },
});