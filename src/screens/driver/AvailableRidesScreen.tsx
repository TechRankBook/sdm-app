import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';

export default function AvailableRidesScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [availableRides, setAvailableRides] = useState<any[]>([]);

  // Mock data for available rides
  const mockRides = [
    {
      id: '1',
      pickup: 'Connaught Place',
      drop: 'Indira Gandhi Airport',
      distance: '18.5 km',
      duration: '35 mins',
      fare: 450,
      customerRating: 4.8,
      customerName: 'Rahul S.',
      requestedAt: '2 mins ago',
      serviceType: 'Airport Transfer',
    },
    {
      id: '2',
      pickup: 'Karol Bagh',
      drop: 'Lajpat Nagar',
      distance: '8.2 km',
      duration: '22 mins',
      fare: 180,
      customerRating: 4.6,
      customerName: 'Priya M.',
      requestedAt: '5 mins ago',
      serviceType: 'City Ride',
    },
    {
      id: '3',
      pickup: 'Delhi Railway Station',
      drop: 'Red Fort',
      distance: '6.8 km',
      duration: '18 mins',
      fare: 150,
      customerRating: 4.9,
      customerName: 'Amit K.',
      requestedAt: '8 mins ago',
      serviceType: 'City Ride',
    },
  ];

  useEffect(() => {
    setAvailableRides(mockRides);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleAcceptRide = (ride: any) => {
    Alert.alert(
      'Accept Ride',
      `Accept ride from ${ride.customerName}?\n\nPickup: ${ride.pickup}\nDrop: ${ride.drop}\nFare: ₹${ride.fare}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: () => {
            Alert.alert('Ride Accepted', 'Navigate to pickup location');
            // Here you would update the ride status and navigate to active ride
          },
        },
      ]
    );
  };

  const handleRejectRide = (rideId: string) => {
    setAvailableRides(prev => prev.filter(ride => ride.id !== rideId));
  };

  const getServiceTypeColor = (serviceType: string) => {
    switch (serviceType) {
      case 'Airport Transfer':
        return '#2563eb';
      case 'City Ride':
        return '#16a34a';
      case 'Outstation':
        return '#ca8a04';
      default:
        return '#6b7280';
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-slate-50"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View className="bg-white px-5 py-6 border-b border-slate-200">
        <Text className="text-2xl font-bold text-slate-800 mb-1">Available Rides</Text>
        <Text className="text-base text-slate-500">
          {availableRides.length} ride{availableRides.length !== 1 ? 's' : ''} available
        </Text>
      </View>

      {/* Rides List */}
      {availableRides.length > 0 ? (
        <View className="p-5">
          {availableRides.map((ride) => (
            <View key={ride.id} className="bg-white rounded-xl p-4 mb-4 shadow-lg">
              {/* Header */}
              <View className="flex-row justify-between items-start mb-4">
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-slate-800 mb-1">{ride.customerName}</Text>
                  <View className="flex-row items-center gap-3">
                    <Text className="text-sm text-amber-500 font-medium">⭐ {ride.customerRating}</Text>
                    <Text className="text-xs text-slate-500">{ride.requestedAt}</Text>
                  </View>
                </View>
                <View
                  className="px-2 py-1 rounded-xl"
                  style={{ backgroundColor: getServiceTypeColor(ride.serviceType) }}
                >
                  <Text className="text-xs font-medium text-white">{ride.serviceType}</Text>
                </View>
              </View>

              {/* Route */}
              <View className="mb-4">
                <View className="flex-row items-center mb-2">
                  <Text className="text-sm text-blue-600 mr-3 w-4 text-center">●</Text>
                  <Text className="text-sm text-slate-700 flex-1">{ride.pickup}</Text>
                </View>
                <View className="h-5 w-0.5 bg-slate-200 ml-1.5 mb-2" />
                <View className="flex-row items-center">
                  <Text className="text-sm text-blue-600 mr-3 w-4 text-center">●</Text>
                  <Text className="text-sm text-slate-700 flex-1">{ride.drop}</Text>
                </View>
              </View>

              {/* Ride Details */}
              <View className="bg-slate-50 rounded-lg p-3 mb-4">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-sm text-slate-500">Distance:</Text>
                  <Text className="text-sm font-medium text-slate-800">{ride.distance}</Text>
                </View>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-sm text-slate-500">Duration:</Text>
                  <Text className="text-sm font-medium text-slate-800">{ride.duration}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-slate-500">Fare:</Text>
                  <Text className="text-sm font-medium text-slate-800">₹{ride.fare}</Text>
                </View>
              </View>

              {/* Actions */}
              <View className="flex-row gap-3">
                <TouchableOpacity
                  className="flex-1 bg-white border border-slate-300 py-3 rounded-lg items-center"
                  onPress={() => handleRejectRide(ride.id)}
                >
                  <Text className="text-sm font-medium text-slate-700">Skip</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-[2] bg-green-600 py-3 rounded-lg items-center"
                  onPress={() => handleAcceptRide(ride)}
                >
                  <Text className="text-sm font-semibold text-white">Accept Ride</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View className="flex-1 justify-center items-center px-10 py-20">
          <Text className="text-6xl mb-4">🚗</Text>
          <Text className="text-xl font-semibold text-slate-800 mb-2">No rides available</Text>
          <Text className="text-base text-slate-500 text-center leading-6 mb-6">
            New ride requests will appear here when available
          </Text>
          <TouchableOpacity
            className="bg-blue-600 px-6 py-3 rounded-lg"
            onPress={onRefresh}
          >
            <Text className="text-base font-medium text-white">Refresh</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}