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
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CommonActions } from '@react-navigation/native';

// Import services and stores
import { AuthService } from '../../services/supabase/auth';
import { useAppStore } from '../../stores/appStore';

// Import types
import { AuthStackParamList } from '@/types/navigation';

type AuthFlowScreenNavigationProp = StackNavigationProp<AuthStackParamList>;

export default function AuthFlowScreen() {
  const navigation = useNavigation<AuthFlowScreenNavigationProp>();
  const { setLoading } = useAppStore();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    if (!AuthService.isValidPhone(phoneNumber)) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }

    setIsLoading(true);
    // Don't call setLoading from appStore to avoid re-rendering AppNavigator

    try {
      const { data, error } = await AuthService.signInWithPhone(phoneNumber.trim());

      if (error) {
        Alert.alert('Error', `Failed to send OTP: ${error.message || 'Unknown error'}`);
      } else {
        console.log('OTP sent successfully, navigating to OTPVerification');
        Alert.alert('Navigation', 'Attempting to navigate to OTP verification screen...');

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
        Alert.alert('Success', 'Navigation attempted! Check if screen changed.');
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
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
        Alert.alert('Error', error.message || 'Failed to sign in with Google');
      } else {
        // Navigation will be handled automatically by the auth state listener
        console.log('Google sign-in initiated');
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
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
      Alert.alert('Error', 'Unable to navigate to forgot password screen');
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
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Sign in to your SDM Cab Hailing account
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

            {/* Forgot Password */}
            <TouchableOpacity
              onPress={handleForgotPassword}
              style={styles.forgotPassword}
              disabled={isLoading}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Send OTP Button */}
            <TouchableOpacity
              onPress={handleSendOTP}
              style={[styles.button, isLoading && styles.buttonDisabled]}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Sending OTP...' : 'Send OTP'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Google Sign In */}
          {/* <View style={styles.googleSection}>
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              onPress={handleGoogleSignIn}
              style={[styles.googleButton, isLoading && styles.buttonDisabled]}
              disabled={isLoading}
            >
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>
          </View> */}
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
  },
  form: {
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
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
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  countryCode: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#374151',
    borderRightWidth: 1,
    borderRightColor: '#d1d5db',
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.5,
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
    backgroundColor: '#d1d5db',
  },
  dividerText: {
    paddingHorizontal: 16,
    color: '#64748b',
    fontSize: 14,
  },
  googleButton: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  googleButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
  },
});