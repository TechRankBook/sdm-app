import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Import services and stores
import { AuthService } from '@/services/supabase/auth';
import { useAppStore, useUser } from '@/stores/appStore';

// Import types
import { CustomerTabParamList } from '@/types/navigation';

type HomeScreenNavigationProp = StackNavigationProp<CustomerTabParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const user = useUser();
  const { setLoading } = useAppStore();

  const handleBookRide = () => {
    navigation.navigate('BookRide');
  };

  const handleViewHistory = () => {
    navigation.navigate('RideHistory');
  };

  const handleViewProfile = () => {
    navigation.navigate('Profile');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            await AuthService.signOut();
            setLoading(false);
          },
        },
      ]
    );
  };

  const quickActions = [
    {
      title: 'Book a Ride',
      subtitle: 'Find and book your next ride',
      icon: '🚗',
      onPress: handleBookRide,
      color: 'primary',
    },
    {
      title: 'Ride History',
      subtitle: 'View your past rides',
      icon: '📋',
      onPress: handleViewHistory,
      color: 'success',
    },
    {
      title: 'My Profile',
      subtitle: 'Manage your account',
      icon: '👤',
      onPress: handleViewProfile,
      color: 'destructive',
    },
    {
      title: 'Support',
      subtitle: 'Get help and support',
      icon: '🆘',
      onPress: () => navigation.navigate('Support'),
      color: 'warning',
    },
  ];

  return (
    <ScrollView className="flex-1 bg-secondary-50">
      {/* Welcome Header */}
      <View className="glass mx-5 mt-5 p-6 rounded-2xl border border-glass-border shadow-glass">
        <Text className="text-muted-foreground text-base mb-2">Welcome back,</Text>
        <Text className="text-foreground text-2xl font-bold mb-2">{user?.full_name || 'Customer'}</Text>
        <Text className="text-muted-foreground text-base">Ready for your next ride?</Text>
      </View>

      {/* Quick Actions */}
      <View className="px-5 mt-6">
        <Text className="text-foreground text-xl font-semibold mb-4">Quick Actions</Text>
        <View className="flex-row flex-wrap gap-3">
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              className={`flex-1 min-w-[45%] glass p-4 rounded-xl border border-glass-border shadow-elevation`}
              onPress={action.onPress}
            >
              <Text className="text-3xl mb-3">{action.icon}</Text>
              <Text className="text-foreground text-base font-semibold mb-1">{action.title}</Text>
              <Text className="text-muted-foreground text-sm leading-4">{action.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent Activity */}
      <View className="px-5 mt-6">
        <Text className="text-foreground text-xl font-semibold mb-4">Recent Activity</Text>
        <View className="glass p-6 rounded-xl border border-glass-border shadow-elevation">
          <Text className="text-muted-foreground text-base text-center">
            No recent rides. Book your first ride to get started!
          </Text>
        </View>
      </View>

      {/* Logout Button */}
      <View className="px-5 pb-10 mt-6">
        <TouchableOpacity
          className="bg-destructive py-3 rounded-lg items-center shadow-elevation"
          onPress={handleLogout}
        >
          <Text className="text-destructive-foreground text-base font-semibold">Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}