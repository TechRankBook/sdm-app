import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import AuthFlowScreen from '@/screens/auth/AuthFlowScreen';
import OTPVerificationScreen from '@/screens/auth/OTPVerificationScreen';
import ForgotPasswordScreen from '@/screens/auth/ForgotPasswordScreen';

// Import types
import { AuthStackParamList } from '@/types/navigation';

const Stack = createStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2dd4bf', // Teal color from the modern theme
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
        cardStyle: {
          backgroundColor: '#f8f9fa', // Light background color
        },
      }}
    >
      <Stack.Screen
        name="Login"
        component={AuthFlowScreen}
        options={{
          title: 'Sign In',
          headerShown: false
        }}
      />
      <Stack.Screen
        name="OTPVerification"
        component={OTPVerificationScreen}
        options={{
          title: 'Verify Phone',
          headerShown: false
        }}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{
          title: 'Reset Password',
          headerShown: false
        }}
      />
    </Stack.Navigator>
  );
}