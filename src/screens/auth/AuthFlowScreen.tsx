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
  Image,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CommonActions } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

// Import services and stores
import { AuthService } from '../../services/supabase/auth';
import { useAppStore } from '../../stores/appStore';

// Import error message utilities
import { getUserFriendlyError } from '../../utils/errorMessages';

// Import types
import { AuthStackParamList } from '@/types/navigation';

type AuthFlowScreenNavigationProp = StackNavigationProp<AuthStackParamList>;

export default function AuthFlowScreen() {
  const navigation = useNavigation<AuthFlowScreenNavigationProp>();
  const { setLoading } = useAppStore();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Timer state for resend OTP restriction
  const [sendTimer, setSendTimer] = useState(0);
  const [canSend, setCanSend] = useState(true);
  const sendTimerRef = useRef<NodeJS.Timeout | null>(null);
  const SEND_COOLDOWN = 60; // 60 seconds cooldown

  // Timer effect for countdown
  useEffect(() => {
    if (sendTimer > 0) {
      sendTimerRef.current = setTimeout(() => {
        setSendTimer(prev => prev - 1);
      }, 1000);
    } else {
      setCanSend(true);
    }

    // Cleanup timer on unmount or when timer reaches 0
    return () => {
      if (sendTimerRef.current) {
        clearTimeout(sendTimerRef.current);
      }
    };
  }, [sendTimer]);

  // Start send cooldown timer
  const startSendCooldown = () => {
    setCanSend(false);
    setSendTimer(SEND_COOLDOWN);
  };

  // Cleanup timer when component unmounts
  useEffect(() => {
    return () => {
      if (sendTimerRef.current) {
        clearTimeout(sendTimerRef.current);
      }
    };
  }, []);

  const handleSendOTP = async () => {
    if (!canSend) {
      Toast.show({
        type: 'warning',
        text1: 'Please Wait',
        text2: `You can send OTP again in ${sendTimer} seconds`,
      });
      return;
    }

    if (!phoneNumber.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter your phone number',
      });
      return;
    }

    if (!AuthService.isValidPhone(phoneNumber)) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a valid 10-digit phone number',
      });
      return;
    }

    setIsLoading(true);
    // Don't call setLoading from appStore to avoid re-rendering AppNavigator

    try {
      const { data, error } = await AuthService.signInWithPhone(phoneNumber.trim());

      if (error) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: getUserFriendlyError(error),
        });
      } else {
        console.log('OTP sent successfully, navigating to OTPVerification');
        Toast.show({
          type: 'success',
          text1: 'OTP Sent',
          text2: 'Verification code sent to your phone',
        });

        console.log('Navigation object:', navigation);
        console.log('Navigation type:', typeof navigation);
        console.log('Navigation methods:', Object.keys(navigation));

        // Try different navigation approaches
        console.log('Current navigation state:', navigation.getState());

        // Try push first (adds to stack)
        try {
          navigation.push('OTPVerification', { phoneNumber: phoneNumber.trim() });
          console.log('Navigation.push called successfully');
        } catch (pushError) {
          console.error('Push failed:', pushError);
          // Try replace (replaces current screen)
          try {
            navigation.replace('OTPVerification', { phoneNumber: phoneNumber.trim() });
            console.log('Navigation.replace called successfully');
          } catch (replaceError) {
            console.error('Replace failed:', replaceError);
            // Final fallback: reset
            navigation.reset({
              index: 0,
              routes: [
                {
                  name: 'OTPVerification',
                  params: { phoneNumber: phoneNumber.trim() }
                }
              ]
            });
            console.log('Navigation reset fallback successful');
          }
        }
        // Start cooldown timer after successful send
        startSendCooldown();
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: getUserFriendlyError(error as Error),
      });
    } finally {
      setIsLoading(false);
      // Don't call setLoading(false) to avoid re-rendering AppNavigator
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    // Don't call setLoading from appStore to avoid re-rendering AppNavigator

    try {
      const { data, error } = await AuthService.signInWithGoogle();

      if (error) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error.message || 'Failed to sign in with Google',
        });
      } else {
        // Navigation will be handled automatically by the auth state listener
        console.log('Google sign-in initiated');
        Toast.show({
          type: 'info',
          text1: 'Google Sign-In',
          text2: 'Redirecting to Google...',
        });
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: getUserFriendlyError(error as Error),
      });
    } finally {
      setIsLoading(false);
      // Don't call setLoading(false) to avoid re-rendering AppNavigator
    }
  };

  const handleForgotPassword = () => {
    try {
      navigation.navigate('ForgotPassword');
    } catch (error) {
      console.error('Navigation error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Unable to navigate to forgot password screen',
      });
    }
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
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>SDM</Text>
          </View>

          {/* Hero Section */}
          <View style={styles.heroContainer}>
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>
                <Text style={styles.heroTitleDark}>Electric</Text>{'\n'}
                <Text style={styles.heroTitleGreen}>Mobility</Text>{'\n'}
                <Text style={styles.heroTitleDark}>Reimagined</Text>
              </Text>
              <Text style={styles.heroSubtitle}>
                Experience the future of urban transportation with SDM E-Mobility. Clean, smart, and sustainable rides at your fingertips.
              </Text>
            </View>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <View style={styles.header}>
              <Text style={styles.title}>Get Started</Text>
              <Text style={styles.subtitle}>
                Enter your phone number to access your SDM emobility Services account.
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Phone Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <View style={styles.phoneInputContainer}>
                  <Text style={styles.countryCode}>+91</Text>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="Enter 10-digit phone number"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                    maxLength={10}
                    placeholderTextColor="#64748b"
                  />
                </View>
              </View>

              {/* Send OTP Button */}
              <TouchableOpacity
                onPress={handleSendOTP}
                style={[styles.button, (isLoading || !canSend) && styles.buttonDisabled]}
                disabled={isLoading || !canSend}
              >
                <Text style={styles.buttonText}>
                  {isLoading
                    ? 'Sending OTP...'
                    : !canSend
                      ? `Send OTP in ${sendTimer}s`
                      : 'Send OTP'
                  }
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats Section */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>2.5M+</Text>
              <Text style={styles.statLabel}>Happy Riders</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>50K+</Text>
              <Text style={styles.statLabel}>Drivers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>100%</Text>
              <Text style={styles.statLabel}>Electric</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>24/7</Text>
              <Text style={styles.statLabel}>Available</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    letterSpacing: 1,
  },
  heroContainer: {
    marginBottom: 32,
  },
  heroContent: {
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    lineHeight: 44,
    marginBottom: 16,
  },
  heroTitleDark: {
    color: '#1e293b',
  },
  heroTitleGreen: {
    color: '#2dd4bf', // Teal color from the web app
  },
  heroSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: '#64748b',
    marginBottom: 24,
    maxWidth: '90%',
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 4,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b',
    lineHeight: 22,
  },
  form: {
    marginBottom: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  countryCode: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#374151',
    backgroundColor: '#f8fafc',
    borderRightWidth: 1,
    borderRightColor: '#e2e8f0',
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1e293b',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    color: '#2dd4bf', // Teal color from the web app
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#2dd4bf', // Teal color from the web app
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  googleSection: {
    marginTop: 32,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    paddingHorizontal: 16,
    color: '#64748b',
    fontSize: 14,
  },
  googleButton: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  googleButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  statItem: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2dd4bf', // Teal color from the web app
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
  },
});