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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Import services and stores
import { AuthService } from '../../services/supabase/auth';
import { useAppStore } from '../../stores/appStore';

// Import types
import { AuthStackParamList } from '@/types/navigation';

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { setLoading } = useAppStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!AuthService.isValidEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setLoading(true);

    try {
      const { data, error } = await AuthService.signIn(email.trim(), password);

      if (error) {
        Alert.alert('Login Failed', error.message || 'An error occurred during login');
      } else {
        // Navigation will be handled automatically by the auth state listener
        console.log('Login successful');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        className="flex-1"
      >
        <View className="flex-1 justify-center px-6 py-12">
          {/* Header */}
          <View className="items-center mb-8">
            <Text className="text-3xl font-bold text-foreground mb-2">Welcome Back</Text>
            <Text className="text-base text-muted-foreground text-center">
              Sign in to your SDM Cab Hailing account
            </Text>
          </View>

          {/* Form */}
          <View className="mb-4">
            {/* Email Input */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-foreground mb-2">Email Address</Text>
              <TextInput
                className="border border-input rounded-lg px-4 py-3 text-base bg-background"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
                placeholderTextColor="hsl(var(--muted-foreground))"
              />
            </View>

            {/* Password Input */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-foreground mb-2">Password</Text>
              <TextInput
                className="border border-input rounded-lg px-4 py-3 text-base bg-background"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
                placeholderTextColor="hsl(var(--muted-foreground))"
              />
            </View>

            {/* Forgot Password */}
            <TouchableOpacity
              onPress={handleForgotPassword}
              className="self-end mb-6"
              disabled={isLoading}
            >
              <Text className="text-primary text-sm font-medium">Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              className={`bg-primary py-3 rounded-lg items-center mt-6 ${isLoading ? 'opacity-50' : ''}`}
              disabled={isLoading}
            >
              <Text className="text-primary-foreground text-base font-semibold">
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Register Link */}
          <View className="flex-row justify-center items-center mt-8">
            <Text className="text-muted-foreground">Don't have an account? </Text>
            <TouchableOpacity onPress={handleRegister} disabled={isLoading}>
              <Text className="text-primary font-semibold">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}