import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Import stores and types
import { useAppStore, useIsAuthenticated, useUserRole } from '@/stores/appStore';

// Import screens
import AuthNavigator from '@/navigation/AuthNavigator';
import CustomerNavigator from '@/navigation/CustomerNavigator';
import DriverNavigator from '@/navigation/DriverNavigator';

// Import types
import { UserRole } from '@/types';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  const isAuthenticated = useIsAuthenticated();
  const userRole = useUserRole();

  console.log('🔄 AppNavigator rendering - isAuthenticated:', isAuthenticated, 'userRole:', userRole);

  // Show auth screens if not authenticated
  if (!isAuthenticated) {
    console.log('🔄 AppNavigator: Showing AuthNavigator');
    return <AuthNavigator />;
  }

  // Show role-based navigation based on user role
  switch (userRole) {
    case 'customer':
      console.log('🔄 AppNavigator: Showing CustomerNavigator');
      return <CustomerNavigator />;
    case 'driver':
      console.log('🔄 AppNavigator: Showing DriverNavigator');
      return <DriverNavigator />;
    case 'admin':
      // For now, show customer interface for admin
      console.log('🔄 AppNavigator: Showing CustomerNavigator (admin)');
      return <CustomerNavigator />;
    case 'vendor':
      // For now, show customer interface for vendor
      console.log('🔄 AppNavigator: Showing CustomerNavigator (vendor)');
      return <CustomerNavigator />;
    default:
      console.log('🔄 AppNavigator: Showing AuthNavigator (default)');
      return <AuthNavigator />;
  }
}

// Placeholder components for navigation (will be implemented in next steps)
export const PlaceholderScreen = ({ title }: { title: string }) => {
  return (
    <div style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <h1>{title}</h1>
      <p>This screen will be implemented in the next steps.</p>
    </div>
  );
};