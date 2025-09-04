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

// Import services and stores
import { AuthService } from '../../services/supabase/auth';
import { useAppStore } from '../../stores/appStore';

// Import types
import { AuthStackParamList } from '@/types/navigation';

type RegisterScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Register'>;

export default function RegisterScreen() {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const { setLoading } = useAppStore();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'customer' as 'customer' | 'driver',
  });
  const [isLoading, setIsLoading] = useState(false);

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const { fullName, email, phone, password, confirmPassword } = formData;

    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return false;
    }

    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return false;
    }

    if (!AuthService.isValidEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    if (phone && !AuthService.isValidPhone(phone)) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return false;
    }

    if (!password) {
      Alert.alert('Error', 'Please enter a password');
      return false;
    }

    if (!AuthService.isValidPassword(password)) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setLoading(true);

    try {
      const { data, error } = await AuthService.signUp(
        formData.email.trim(),
        formData.password,
        formData.fullName.trim(),
        formData.phone.trim() || undefined,
        formData.role
      );

      if (error) {
        Alert.alert('Registration Failed', error.message || 'An error occurred during registration');
      } else {
        Alert.alert(
          'Registration Successful',
          'Please check your email to verify your account before signing in.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login'),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  const handleLogin = () => {
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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join SDM Cab Hailing as a customer or driver
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Role Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>I am a:</Text>
              <View style={styles.roleContainer}>
                <TouchableOpacity
                  onPress={() => updateFormData('role', 'customer')}
                  style={[
                    styles.roleButton,
                    formData.role === 'customer' && styles.roleButtonActive,
                  ]}
                  disabled={isLoading}
                >
                  <Text
                    style={[
                      styles.roleButtonText,
                      formData.role === 'customer' && styles.roleButtonTextActive,
                    ]}
                  >
                    Customer
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => updateFormData('role', 'driver')}
                  style={[
                    styles.roleButton,
                    formData.role === 'driver' && styles.roleButtonActiveDriver,
                  ]}
                  disabled={isLoading}
                >
                  <Text
                    style={[
                      styles.roleButtonText,
                      formData.role === 'driver' && styles.roleButtonTextActiveDriver,
                    ]}
                  >
                    Driver
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Full Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                value={formData.fullName}
                onChangeText={(value) => updateFormData('fullName', value)}
                autoCapitalize="words"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={formData.email}
                onChangeText={(value) => updateFormData('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            {/* Phone Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your phone number"
                value={formData.phone}
                onChangeText={(value) => updateFormData('phone', value)}
                keyboardType="phone-pad"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Create a password"
                value={formData.password}
                onChangeText={(value) => updateFormData('password', value)}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChangeText={(value) => updateFormData('confirmPassword', value)}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            {/* Register Button */}
            <TouchableOpacity
              onPress={handleRegister}
              style={[styles.button, isLoading && styles.buttonDisabled]}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Login Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={handleLogin} disabled={isLoading}>
              <Text style={styles.footerLink}>Sign In</Text>
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
  roleContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  roleButtonActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  roleButtonActiveDriver: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
  },
  roleButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  roleButtonTextActive: {
    color: '#2563eb',
  },
  roleButtonTextActiveDriver: {
    color: '#16a34a',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  footerText: {
    color: '#64748b',
  },
  footerLink: {
    color: '#2563eb',
    fontWeight: '600',
  },
});