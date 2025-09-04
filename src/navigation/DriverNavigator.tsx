import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import DriverHomeScreen from '@/screens/driver/DriverHomeScreen';
import AvailableRidesScreen from '@/screens/driver/AvailableRidesScreen';
import ActiveRideScreen from '@/screens/driver/ActiveRideScreen';
import EarningsScreen from '@/screens/driver/EarningsScreen';
import DriverProfileScreen from '@/screens/driver/DriverProfileScreen';

// Import components
import NotificationBell from '@/components/NotificationBell';

// Import types
import { DriverTabParamList, DriverStackParamList } from '@/types/navigation';

const Tab = createBottomTabNavigator<DriverTabParamList>();
const Stack = createStackNavigator<DriverStackParamList>();

// Main tab navigator for driver
function DriverTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: 'hsl(var(--primary))',
        tabBarInactiveTintColor: 'hsl(var(--muted-foreground))',
        tabBarStyle: {
          backgroundColor: 'hsl(var(--background))',
          borderTopColor: 'hsl(var(--border))',
        },
        headerStyle: {
          backgroundColor: 'hsl(var(--primary))',
        },
        headerTintColor: 'hsl(var(--primary-foreground))',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerRight: () => <NotificationBell />,
      }}
    >
      <Tab.Screen
        name="DriverHome"
        component={DriverHomeScreen}
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Dashboard',
        }}
      />
      <Tab.Screen
        name="AvailableRides"
        component={AvailableRidesScreen}
        options={{
          title: 'Available Rides',
          tabBarLabel: 'Rides',
        }}
      />
      <Tab.Screen
        name="ActiveRide"
        component={ActiveRideScreen}
        options={{
          title: 'Active Ride',
          tabBarLabel: 'Active',
        }}
      />
      <Tab.Screen
        name="Earnings"
        component={EarningsScreen}
        options={{
          title: 'Earnings',
          tabBarLabel: 'Earnings',
        }}
      />
      <Tab.Screen
        name="DriverProfile"
        component={DriverProfileScreen}
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}

// Main driver navigator with stack for modals/details
export default function DriverNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#10b981',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="DriverTabs"
        component={DriverTabNavigator}
        options={{ headerShown: false }}
      />
      {/* Additional screens can be added here for modals/details */}
    </Stack.Navigator>
  );
}
