import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';

// Import services and stores
import { useAppStore, useUser } from '@/stores/appStore';

export default function DriverHomeScreen() {
  const user = useUser();
  const [isOnline, setIsOnline] = useState(false);
  const [currentRide, setCurrentRide] = useState<any>(null); // Will be typed properly later

  const stats = {
    todayEarnings: 1250,
    todayRides: 8,
    rating: 4.7,
    totalRides: 1247,
  };

  const toggleOnlineStatus = () => {
    if (!isOnline) {
      Alert.alert(
        'Go Online',
        'Are you ready to accept ride requests?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Go Online',
            onPress: () => setIsOnline(true),
          },
        ]
      );
    } else {
      setIsOnline(false);
    }
  };

  const handleAcceptRide = () => {
    Alert.alert('Ride Accepted', 'You have accepted the ride request. Navigate to pickup location.');
  };

  const handleRejectRide = () => {
    Alert.alert('Ride Rejected', 'You have rejected the ride request.');
  };

  return (
    <ScrollView className="flex-1 bg-secondary-50">
      {/* Online Status */}
      <View className="glass mx-5 mt-5 p-5 rounded-2xl border border-glass-border shadow-glass">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-lg font-semibold text-foreground">Driver Status</Text>
          <Switch
            value={isOnline}
            onValueChange={toggleOnlineStatus}
            trackColor={{ false: 'hsl(var(--muted))', true: 'hsl(var(--primary))' }}
            thumbColor={isOnline ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))'}
          />
        </View>
        <Text className={`text-sm font-medium ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
          {isOnline ? 'Online - Accepting rides' : 'Offline - Not accepting rides'}
        </Text>
      </View>

      {/* Current Ride */}
      {currentRide && (
        <View className="glass mx-5 my-5 p-5 rounded-2xl border border-glass-border shadow-glass">
          <Text className="text-lg font-semibold text-foreground mb-3">Current Ride</Text>
          <View className="mb-4">
            <Text className="text-sm text-muted-foreground mb-1">Pickup: {currentRide.pickup}</Text>
            <Text className="text-sm text-muted-foreground mb-1">Drop: {currentRide.drop}</Text>
            <Text className="text-sm text-muted-foreground">Fare: ₹{currentRide.fare}</Text>
          </View>
          <View className="flex-row gap-3">
            <TouchableOpacity className="flex-1 bg-warning py-3 rounded-lg items-center">
              <Text className="text-warning-foreground text-sm font-semibold">Arrived at Pickup</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 bg-success py-3 rounded-lg items-center">
              <Text className="text-success text-sm font-semibold">Complete Ride</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Available Ride Request */}
      {isOnline && !currentRide && (
        <View className="glass mx-5 my-5 p-5 rounded-2xl border-2 border-primary shadow-glass">
          <Text className="text-lg font-semibold text-foreground mb-3">🚗 New Ride Request</Text>
          <View className="mb-4">
            <Text className="text-sm text-muted-foreground mb-1">Distance: 2.5 km</Text>
            <Text className="text-sm text-muted-foreground mb-1">Fare: ₹180</Text>
            <Text className="text-sm text-muted-foreground mb-1">Pickup: Connaught Place</Text>
            <Text className="text-sm text-muted-foreground">Drop: Karol Bagh</Text>
          </View>
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 bg-destructive py-3 rounded-lg items-center"
              onPress={handleRejectRide}
            >
              <Text className="text-destructive-foreground text-sm font-semibold">Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-success py-3 rounded-lg items-center"
              onPress={handleAcceptRide}
            >
              <Text className="text-success text-sm font-semibold">Accept</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Stats */}
      <View className="px-5 mb-5">
        <Text className="text-xl font-semibold text-foreground mb-4">Today's Summary</Text>
        <View className="flex-row flex-wrap gap-3">
          <View className="flex-1 min-w-[45%] glass p-4 rounded-xl items-center border border-glass-border shadow-elevation">
            <Text className="text-3xl mb-2">💰</Text>
            <Text className="text-xl font-bold text-foreground mb-1">₹{stats.todayEarnings}</Text>
            <Text className="text-xs text-muted-foreground">Earnings</Text>
          </View>
          <View className="flex-1 min-w-[45%] glass p-4 rounded-xl items-center border border-glass-border shadow-elevation">
            <Text className="text-3xl mb-2">🚗</Text>
            <Text className="text-xl font-bold text-foreground mb-1">{stats.todayRides}</Text>
            <Text className="text-xs text-muted-foreground">Rides</Text>
          </View>
          <View className="flex-1 min-w-[45%] glass p-4 rounded-xl items-center border border-glass-border shadow-elevation">
            <Text className="text-3xl mb-2">⭐</Text>
            <Text className="text-xl font-bold text-foreground mb-1">{stats.rating}</Text>
            <Text className="text-xs text-muted-foreground">Rating</Text>
          </View>
          <View className="flex-1 min-w-[45%] glass p-4 rounded-xl items-center border border-glass-border shadow-elevation">
            <Text className="text-3xl mb-2">📊</Text>
            <Text className="text-xl font-bold text-foreground mb-1">{stats.totalRides}</Text>
            <Text className="text-xs text-muted-foreground">Total</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View className="px-5 pb-10">
        <Text className="text-xl font-semibold text-foreground mb-4">Quick Actions</Text>
        <View className="flex-row flex-wrap gap-3">
          <TouchableOpacity className="flex-1 min-w-[45%] glass p-4 rounded-xl items-center border border-glass-border shadow-elevation">
            <Text className="text-2xl mb-2">📍</Text>
            <Text className="text-sm font-medium text-muted-foreground">Update Location</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 min-w-[45%] glass p-4 rounded-xl items-center border border-glass-border shadow-elevation">
            <Text className="text-2xl mb-2">📞</Text>
            <Text className="text-sm font-medium text-muted-foreground">Emergency</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 min-w-[45%] glass p-4 rounded-xl items-center border border-glass-border shadow-elevation">
            <Text className="text-2xl mb-2">⚙️</Text>
            <Text className="text-sm font-medium text-muted-foreground">Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 min-w-[45%] glass p-4 rounded-xl items-center border border-glass-border shadow-elevation">
            <Text className="text-2xl mb-2">📈</Text>
            <Text className="text-sm font-medium text-muted-foreground">Analytics</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}