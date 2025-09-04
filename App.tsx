import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import global styles
import './src/global.css';

// Import our services and stores
import { AuthService } from '@/services/supabase/auth';
import { useAppStore } from '@/stores/appStore';

// Import hooks
import { useRealtimeSubscriptions } from '@/hooks/useRealtimeSubscriptions';

// Import navigation
import AppNavigator from '@/navigation/AppNavigator';

export default function App() {
  const { isLoading, isAuthenticated } = useAppStore();

  // Initialize real-time subscriptions
  useRealtimeSubscriptions();

  useEffect(() => {
    // Initialize auth state listener
    AuthService.initializeAuthListener();

    // Check if user is already authenticated
    const initializeAuth = async () => {
      const authenticated = await AuthService.isAuthenticated();
      useAppStore.getState().setAuthenticated(authenticated);
      useAppStore.getState().setLoading(false);
    };

    initializeAuth();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <StatusBar style="dark" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AppNavigator />
        <StatusBar style="dark" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
