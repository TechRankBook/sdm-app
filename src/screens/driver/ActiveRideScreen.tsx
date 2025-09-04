import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';

export default function ActiveRideScreen() {
  const [rideStatus, setRideStatus] = useState<'pickup' | 'in_progress' | 'completed'>('pickup');

  // Mock active ride data
  const activeRide = {
    id: '1',
    customerName: 'Rahul Sharma',
    customerPhone: '+91-9876543210',
    pickup: 'Connaught Place, New Delhi',
    drop: 'Indira Gandhi Airport, New Delhi',
    fare: 450,
    distance: '18.5 km',
    duration: '35 mins',
    vehicleType: 'Sedan',
  };

  const handleArrivedAtPickup = () => {
    setRideStatus('in_progress');
    Alert.alert('Status Updated', 'You have arrived at the pickup location');
  };

  const handleStartRide = () => {
    Alert.alert('Ride Started', 'The ride has begun. Navigate to drop location.');
  };

  const handleCompleteRide = () => {
    Alert.alert(
      'Complete Ride',
      'Confirm ride completion?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: () => {
            setRideStatus('completed');
            Alert.alert('Ride Completed', 'Payment will be processed shortly');
          },
        },
      ]
    );
  };

  const handleCallCustomer = () => {
    Alert.alert('Call Customer', `Call ${activeRide.customerPhone}?`);
  };

  const handleEmergency = () => {
    Alert.alert('Emergency', 'Call emergency services?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call 112', onPress: () => Alert.alert('Calling 112...') },
    ]);
  };

  return (
    <ScrollView className="flex-1 bg-slate-50">
      {/* Ride Status */}
      <View className="bg-white mx-5 mt-5 p-5 rounded-xl items-center shadow-lg">
        <Text className="text-lg font-semibold text-slate-800 mb-5">Ride Status</Text>
        <View className="flex-row items-center mb-2">
          <View className={`w-3 h-3 rounded-full mr-2 ${rideStatus === 'pickup' ? 'bg-blue-600' : 'bg-slate-300'}`} />
          <Text className="text-sm text-slate-700">Pickup</Text>
        </View>
        <View className="w-0.5 h-5 bg-slate-200 my-1" />
        <View className="flex-row items-center mb-2">
          <View className={`w-3 h-3 rounded-full mr-2 ${rideStatus === 'in_progress' ? 'bg-blue-600' : 'bg-slate-300'}`} />
          <Text className="text-sm text-slate-700">In Progress</Text>
        </View>
        <View className="w-0.5 h-5 bg-slate-200 my-1" />
        <View className="flex-row items-center">
          <View className={`w-3 h-3 rounded-full mr-2 ${rideStatus === 'completed' ? 'bg-blue-600' : 'bg-slate-300'}`} />
          <Text className="text-sm text-slate-700">Completed</Text>
        </View>
      </View>

      {/* Customer Info */}
      <View className="bg-white mx-5 mb-5 p-5 rounded-xl shadow-lg">
        <Text className="text-lg font-semibold text-slate-800 mb-4">Customer Details</Text>
        <View className="mb-4">
          <Text className="text-base font-semibold text-slate-800 mb-1">{activeRide.customerName}</Text>
          <Text className="text-sm text-slate-500">{activeRide.customerPhone}</Text>
        </View>
        <TouchableOpacity
          className="bg-blue-600 py-3 rounded-lg items-center"
          onPress={handleCallCustomer}
        >
          <Text className="text-sm font-medium text-white">📞 Call Customer</Text>
        </TouchableOpacity>
      </View>

      {/* Ride Details */}
      <View className="bg-white mx-5 mb-5 p-5 rounded-xl shadow-lg">
        <Text className="text-lg font-semibold text-slate-800 mb-4">Ride Details</Text>

        <View className="mb-5">
          <View className="flex-row items-center mb-2">
            <Text className="text-sm text-blue-600 mr-3 w-4 text-center">●</Text>
            <Text className="text-sm text-slate-700 flex-1">{activeRide.pickup}</Text>
          </View>
          <View className="h-5 w-0.5 bg-slate-200 ml-1.5 mb-2" />
          <View className="flex-row items-center">
            <Text className="text-sm text-blue-600 mr-3 w-4 text-center">●</Text>
            <Text className="text-sm text-slate-700 flex-1">{activeRide.drop}</Text>
          </View>
        </View>

        <View className="bg-slate-50 rounded-lg p-4">
          <View className="flex-row justify-between mb-3">
            <Text className="text-sm text-slate-500">Distance:</Text>
            <Text className="text-sm font-medium text-slate-800">{activeRide.distance}</Text>
          </View>
          <View className="flex-row justify-between mb-3">
            <Text className="text-sm text-slate-500">Duration:</Text>
            <Text className="text-sm font-medium text-slate-800">{activeRide.duration}</Text>
          </View>
          <View className="flex-row justify-between mb-3">
            <Text className="text-sm text-slate-500">Vehicle:</Text>
            <Text className="text-sm font-medium text-slate-800">{activeRide.vehicleType}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-sm text-slate-500">Fare:</Text>
            <Text className="text-sm font-medium text-slate-800">₹{activeRide.fare}</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="px-5 mb-5">
        {rideStatus === 'pickup' && (
          <TouchableOpacity
            className="bg-blue-600 py-4 rounded-lg items-center mb-3"
            onPress={handleArrivedAtPickup}
          >
            <Text className="text-base font-semibold text-white">Arrived at Pickup</Text>
          </TouchableOpacity>
        )}

        {rideStatus === 'in_progress' && (
          <TouchableOpacity
            className="bg-blue-600 py-4 rounded-lg items-center mb-3"
            onPress={handleStartRide}
          >
            <Text className="text-base font-semibold text-white">Start Ride</Text>
          </TouchableOpacity>
        )}

        {rideStatus === 'in_progress' && (
          <TouchableOpacity
            className="bg-green-600 py-4 rounded-lg items-center"
            onPress={handleCompleteRide}
          >
            <Text className="text-base font-semibold text-white">Complete Ride</Text>
          </TouchableOpacity>
        )}

        {rideStatus === 'completed' && (
          <View className="bg-green-50 p-5 rounded-xl items-center border border-green-200">
            <Text className="text-lg font-semibold text-green-800 mb-2">✅ Ride Completed</Text>
            <Text className="text-sm text-green-800 text-center">
              Payment of ₹{activeRide.fare} will be credited to your account
            </Text>
          </View>
        )}
      </View>

      {/* Emergency Button */}
      <View className="px-5 pb-10">
        <TouchableOpacity
          className="bg-red-600 py-4 rounded-lg items-center"
          onPress={handleEmergency}
        >
          <Text className="text-base font-semibold text-white">🚨 Emergency</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}