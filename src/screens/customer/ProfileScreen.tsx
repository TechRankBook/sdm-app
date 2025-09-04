import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';

// Import services and stores
import { AuthService } from '@/services/supabase/auth';
import { useAppStore, useUser } from '@/stores/appStore';

export default function ProfileScreen() {
  const user = useUser();
  const { setLoading } = useAppStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.full_name || '');
  const [editedPhone, setEditedPhone] = useState(user?.phone || '');

  const handleSaveProfile = async () => {
    if (!editedName.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    setLoading(true);
    try {
      const { error } = await AuthService.updateProfile(user!.id, {
        full_name: editedName.trim(),
        phone: editedPhone.trim() || undefined,
      });

      if (error) {
        Alert.alert('Error', 'Failed to update profile');
      } else {
        Alert.alert('Success', 'Profile updated successfully');
        setIsEditing(false);
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
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

  const profileStats = [
    {
      label: 'Total Rides',
      value: '12',
      icon: '🚗',
    },
    {
      label: 'Rating',
      value: '4.8',
      icon: '⭐',
    },
    {
      label: 'Member Since',
      value: 'Jan 2024',
      icon: '📅',
    },
  ];

  const menuItems = [
    {
      title: 'Payment Methods',
      subtitle: 'Manage cards and UPI',
      icon: '💳',
      onPress: () => Alert.alert('Coming Soon', 'Payment methods feature coming soon'),
    },
    {
      title: 'Saved Addresses',
      subtitle: 'Manage favorite locations',
      icon: '📍',
      onPress: () => Alert.alert('Coming Soon', 'Saved addresses feature coming soon'),
    },
    {
      title: 'Notifications',
      subtitle: 'Manage app notifications',
      icon: '🔔',
      onPress: () => Alert.alert('Coming Soon', 'Notifications settings coming soon'),
    },
    {
      title: 'Help & Support',
      subtitle: 'Get help and contact us',
      icon: '🆘',
      onPress: () => Alert.alert('Coming Soon', 'Help & support feature coming soon'),
    },
    {
      title: 'Privacy Policy',
      subtitle: 'Read our privacy policy',
      icon: '🔒',
      onPress: () => Alert.alert('Coming Soon', 'Privacy policy feature coming soon'),
    },
    {
      title: 'Terms of Service',
      subtitle: 'Read our terms and conditions',
      icon: '📄',
      onPress: () => Alert.alert('Coming Soon', 'Terms of service feature coming soon'),
    },
  ];

  return (
    <ScrollView className="flex-1 bg-secondary-50">
      {/* Profile Header */}
      <View className="glass mx-5 mt-5 p-6 rounded-2xl border border-glass-border shadow-glass">
        <View className="flex-row items-center">
          <View className="w-16 h-16 bg-primary rounded-full justify-center items-center mr-4">
            <Text className="text-2xl font-bold text-primary-foreground">
              {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
          <View className="flex-1">
            {isEditing ? (
              <TextInput
                className="text-xl font-bold text-foreground border border-input rounded-lg px-3 py-2 mb-2 bg-background"
                value={editedName}
                onChangeText={setEditedName}
                placeholder="Enter your name"
                autoCapitalize="words"
                placeholderTextColor="hsl(var(--muted-foreground))"
              />
            ) : (
              <Text className="text-xl font-bold text-foreground mb-1">{user?.full_name || 'Customer'}</Text>
            )}
            <Text className="text-sm text-muted-foreground mb-1">{user?.email}</Text>
            {isEditing ? (
              <TextInput
                className="text-sm text-muted-foreground border border-input rounded-lg px-3 py-2 bg-background"
                value={editedPhone}
                onChangeText={setEditedPhone}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
                placeholderTextColor="hsl(var(--muted-foreground))"
              />
            ) : (
              <Text className="text-sm text-muted-foreground">
                {user?.phone || 'No phone number'}
              </Text>
            )}
          </View>
          <TouchableOpacity
            className="bg-primary px-4 py-2 rounded-lg ml-2"
            onPress={() => {
              if (isEditing) {
                handleSaveProfile();
              } else {
                setIsEditing(true);
              }
            }}
          >
            <Text className="text-primary-foreground font-medium text-sm">
              {isEditing ? 'Save' : 'Edit'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats */}
      <View className="glass mx-5 mt-5 p-5 rounded-2xl border border-glass-border shadow-elevation">
        <View className="flex-row justify-around">
          {profileStats.map((stat, index) => (
            <View key={index} className="items-center">
              <Text className="text-3xl mb-2">{stat.icon}</Text>
              <Text className="text-xl font-bold text-foreground mb-1">{stat.value}</Text>
              <Text className="text-xs text-muted-foreground text-center">{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Menu Items */}
      <View className="glass mx-5 mt-5 rounded-2xl overflow-hidden border border-glass-border shadow-glass">
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            className="flex-row items-center justify-between px-5 py-4 border-b border-border"
            onPress={item.onPress}
          >
            <View className="flex-row items-center flex-1">
              <Text className="text-2xl mr-4 w-6 text-center">{item.icon}</Text>
              <View className="flex-1">
                <Text className="text-base font-medium text-foreground mb-1">{item.title}</Text>
                <Text className="text-sm text-muted-foreground">{item.subtitle}</Text>
              </View>
            </View>
            <Text className="text-lg text-muted-foreground">›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout Button */}
      <View className="px-5 py-6 pb-10">
        <TouchableOpacity
          className="bg-destructive py-3 rounded-lg items-center shadow-elevation"
          onPress={handleLogout}
        >
          <Text className="text-destructive-foreground font-semibold text-base">Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}