import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';

// Import services and stores
import { supabase } from '../../services/supabase/client';
import { useUser } from '../../stores/appStore';

// Import types
import { Booking } from '../../types';

export default function RideHistoryScreen() {
  const user = useUser();
  const [refreshing, setRefreshing] = useState(false);
  const [rides, setRides] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRideHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          driver:driver_id (
            id,
            full_name
          )
        `)
        .eq('customer_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching ride history:', error);
        Alert.alert('Error', 'Failed to load ride history');
      } else {
        setRides(data || []);
      }
    } catch (error) {
      console.error('Error fetching ride history:', error);
      Alert.alert('Error', 'Failed to load ride history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRideHistory();
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRideHistory();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#16a34a';
      case 'cancelled':
        return '#dc2626';
      case 'in_progress':
        return '#ca8a04';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      case 'in_progress':
        return 'In Progress';
      default:
        return 'Unknown';
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-secondary-50"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View className="glass mx-5 mt-5 p-6 rounded-2xl border border-glass-border shadow-glass">
        <Text className="text-2xl font-bold text-foreground mb-1">Ride History</Text>
        <Text className="text-base text-muted-foreground">
          {rides.length} {rides.length === 1 ? 'ride' : 'rides'} completed
        </Text>
      </View>

      {/* Ride List */}
      {loading ? (
        <View className="flex-1 justify-center items-center py-20">
          <Text className="text-muted-foreground">Loading ride history...</Text>
        </View>
      ) : rides.length > 0 ? (
        <View className="px-5 mt-5">
          {rides.map((ride) => (
            <TouchableOpacity key={ride.id} className="glass p-4 mb-4 rounded-2xl border border-glass-border shadow-elevation">
              {/* Header */}
              <View className="flex-row justify-between items-start mb-4">
                <View className="flex-1">
                  <Text className="text-sm text-muted-foreground mb-1">
                    {new Date(ride.created_at).toLocaleDateString()} • {new Date(ride.created_at).toLocaleTimeString()}
                  </Text>
                  <Text className="text-lg font-semibold text-foreground capitalize">
                    {ride.service_type} Service
                  </Text>
                </View>
                <View
                  className="px-3 py-1 rounded-xl"
                  style={{ backgroundColor: getStatusColor(ride.status) }}
                >
                  <Text className="text-xs font-medium text-white">
                    {getStatusText(ride.status)}
                  </Text>
                </View>
              </View>

              {/* Route */}
              <View className="mb-4">
                <View className="flex-row items-center mb-2">
                  <Text className="text-sm text-primary mr-3 w-4 text-center">●</Text>
                  <Text className="text-sm text-foreground flex-1">
                    {ride.pickup_location.address || 'Pickup Location'}
                  </Text>
                </View>
                <View className="h-5 w-0.5 bg-border ml-1.5 mb-2" />
                <View className="flex-row items-center">
                  <Text className="text-sm text-primary mr-3 w-4 text-center">●</Text>
                  <Text className="text-sm text-foreground flex-1">
                    {ride.drop_location?.address || 'Drop Location'}
                  </Text>
                </View>
              </View>

              {/* Details */}
              <View className="bg-secondary-100 rounded-lg p-3 mb-4">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-sm text-muted-foreground">Vehicle:</Text>
                  <Text className="text-sm font-medium text-foreground capitalize">
                    {ride.vehicle_type}
                  </Text>
                </View>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-sm text-muted-foreground">Driver:</Text>
                  <Text className="text-sm font-medium text-foreground">
                    {(ride as any).driver?.full_name || 'Not assigned'}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted-foreground">Fare:</Text>
                  <Text className="text-sm font-medium text-foreground">
                    ₹{ride.actual_fare || ride.estimated_fare}
                  </Text>
                </View>
              </View>

              {/* Actions */}
              <View className="flex-row gap-3">
                <TouchableOpacity
                  className="flex-1 bg-primary py-3 rounded-lg items-center"
                  onPress={() => Alert.alert('View Details', 'Detailed ride information coming soon')}
                >
                  <Text className="text-sm font-medium text-primary-foreground">View Details</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 glass border border-glass-border py-3 rounded-lg items-center"
                  onPress={() => Alert.alert('Book Again', 'Quick booking feature coming soon')}
                >
                  <Text className="text-sm font-medium text-foreground">Book Again</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View className="flex-1 justify-center items-center px-10 py-20">
          <Text className="text-6xl mb-4">🚗</Text>
          <Text className="text-xl font-semibold text-foreground mb-2">No rides yet</Text>
          <Text className="text-base text-muted-foreground text-center leading-6">
            Your completed rides will appear here
          </Text>
        </View>
      )}
    </ScrollView>
  );
}