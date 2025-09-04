import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';

export default function EarningsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');

  // Mock earnings data
  const earningsData = {
    today: {
      total: 1250,
      rides: 8,
      hours: 6.5,
      average: 156,
      breakdown: [
        { time: '09:30', amount: 180, type: 'City Ride' },
        { time: '11:15', amount: 220, type: 'Airport Transfer' },
        { time: '13:45', amount: 150, type: 'City Ride' },
        { time: '15:20', amount: 200, type: 'Outstation' },
        { time: '17:00', amount: 180, type: 'City Ride' },
        { time: '18:30', amount: 160, type: 'City Ride' },
        { time: '20:15', amount: 190, type: 'Airport Transfer' },
        { time: '21:45', amount: 170, type: 'City Ride' },
      ],
    },
    week: {
      total: 8750,
      rides: 56,
      hours: 42,
      average: 156,
    },
    month: {
      total: 35000,
      rides: 224,
      hours: 168,
      average: 156,
    },
  };

  const currentData = earningsData[selectedPeriod];

  const handleWithdraw = () => {
    Alert.alert(
      'Withdraw Earnings',
      `Withdraw ₹${currentData.total} to your bank account?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Withdraw',
          onPress: () => Alert.alert('Success', 'Withdrawal request submitted'),
        },
      ]
    );
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'today':
        return 'Today';
      case 'week':
        return 'This Week';
      case 'month':
        return 'This Month';
      default:
        return '';
    }
  };

  return (
    <ScrollView className="flex-1 bg-secondary-50">
      {/* Period Selector */}
      <View className="glass mx-5 mt-5 p-1 rounded-2xl border border-glass-border shadow-glass">
        <View className="flex-row">
          {(['today', 'week', 'month'] as const).map((period) => (
            <TouchableOpacity
              key={period}
              className={`flex-1 py-3 rounded-xl items-center ${
                selectedPeriod === period ? 'bg-primary' : 'bg-transparent'
              }`}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text
                className={`text-sm font-medium ${
                  selectedPeriod === period ? 'text-primary-foreground' : 'text-muted-foreground'
                }`}
              >
                {getPeriodLabel(period)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Earnings Summary */}
      <View className="glass mx-5 my-5 p-6 rounded-2xl border border-glass-border shadow-glass items-center">
        <Text className="text-muted-foreground text-base mb-2">Total Earnings</Text>
        <Text className="text-success text-4xl font-bold mb-5">₹{currentData.total.toLocaleString()}</Text>
        <View className="flex-row justify-around w-full">
          <View className="items-center">
            <Text className="text-foreground text-lg font-semibold mb-1">{currentData.rides}</Text>
            <Text className="text-muted-foreground text-xs">Rides</Text>
          </View>
          <View className="items-center">
            <Text className="text-foreground text-lg font-semibold mb-1">{currentData.hours}h</Text>
            <Text className="text-muted-foreground text-xs">Hours</Text>
          </View>
          <View className="items-center">
            <Text className="text-foreground text-lg font-semibold mb-1">₹{currentData.average}</Text>
            <Text className="text-muted-foreground text-xs">Average</Text>
          </View>
        </View>
      </View>

      {/* Withdraw Button */}
      <View className="px-5 mb-5">
        <TouchableOpacity
          className="bg-success py-4 rounded-lg items-center shadow-elevation"
          onPress={handleWithdraw}
        >
          <Text className="text-success text-base font-semibold">Withdraw Earnings</Text>
        </TouchableOpacity>
      </View>

      {/* Today's Breakdown (only for today) */}
      {selectedPeriod === 'today' && 'breakdown' in currentData && (
        <View className="px-5 mb-5">
          <Text className="text-foreground text-xl font-semibold mb-4">Today's Rides</Text>
          {currentData.breakdown.map((ride: any, index: number) => (
            <View key={index} className="glass p-4 mb-3 rounded-xl border border-glass-border shadow-elevation flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="text-foreground text-sm font-medium mb-1">{ride.time}</Text>
                <Text className="text-muted-foreground text-xs">{ride.type}</Text>
              </View>
              <Text className="text-success text-base font-semibold">₹{ride.amount}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Weekly/Monthly Summary */}
      {selectedPeriod !== 'today' && (
        <View className="px-5 mb-5">
          <Text className="text-foreground text-xl font-semibold mb-4">Summary</Text>
          <View className="flex-row justify-between">
            <View className="glass flex-1 p-4 mx-1 rounded-xl border border-glass-border shadow-elevation items-center">
              <Text className="text-foreground text-lg font-semibold mb-1">
                ₹{(currentData.total / currentData.rides).toFixed(0)}
              </Text>
              <Text className="text-muted-foreground text-xs">Per Ride</Text>
            </View>
            <View className="glass flex-1 p-4 mx-1 rounded-xl border border-glass-border shadow-elevation items-center">
              <Text className="text-foreground text-lg font-semibold mb-1">
                ₹{(currentData.total / currentData.hours).toFixed(0)}
              </Text>
              <Text className="text-muted-foreground text-xs">Per Hour</Text>
            </View>
            <View className="glass flex-1 p-4 mx-1 rounded-xl border border-glass-border shadow-elevation items-center">
              <Text className="text-foreground text-lg font-semibold mb-1">
                {((currentData.hours / (selectedPeriod === 'week' ? 7 : 30)) * 24).toFixed(1)}h
              </Text>
              <Text className="text-muted-foreground text-xs">Daily Avg</Text>
            </View>
          </View>
        </View>
      )}

      {/* Performance Insights */}
      <View className="px-5 pb-10">
        <Text className="text-foreground text-xl font-semibold mb-4">Performance Insights</Text>
        <View className="glass p-5 rounded-2xl border border-glass-border shadow-glass">
          <Text className="text-foreground text-base font-semibold mb-2">💡 Tip</Text>
          <Text className="text-muted-foreground text-sm leading-5">
            You're earning {currentData.average >= 160 ? 'above' : 'below'} average.
            {currentData.average >= 160
              ? ' Keep up the great work!'
              : ' Try accepting more rides during peak hours.'}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}