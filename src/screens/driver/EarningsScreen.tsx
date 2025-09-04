import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
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
    <ScrollView style={styles.container}>
      {/* Period Selector */}
      <View style={styles.periodSelector}>
        <View style={styles.periodSelectorRow}>
          {(['today', 'week', 'month'] as const).map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text style={[
                styles.periodButtonText,
                selectedPeriod === period && styles.periodButtonTextActive
              ]}>
                {getPeriodLabel(period)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Earnings Summary */}
      <View style={styles.earningsSummary}>
        <Text style={styles.earningsLabel}>Total Earnings</Text>
        <Text style={styles.earningsAmount}>₹{currentData.total.toLocaleString()}</Text>
        <View style={styles.earningsStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{currentData.rides}</Text>
            <Text style={styles.statLabel}>Rides</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{currentData.hours}h</Text>
            <Text style={styles.statLabel}>Hours</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>₹{currentData.average}</Text>
            <Text style={styles.statLabel}>Average</Text>
          </View>
        </View>
      </View>

      {/* Withdraw Button */}
      <View style={styles.withdrawContainer}>
        <TouchableOpacity
          style={styles.withdrawButton}
          onPress={handleWithdraw}
        >
          <Text style={styles.withdrawButtonText}>Withdraw Earnings</Text>
        </TouchableOpacity>
      </View>

      {/* Today's Breakdown (only for today) */}
      {selectedPeriod === 'today' && 'breakdown' in currentData && (
        <View style={styles.ridesSection}>
          <Text style={styles.sectionTitle}>Today's Rides</Text>
          {currentData.breakdown.map((ride: any, index: number) => (
            <View key={index} style={styles.rideCard}>
              <View style={styles.rideInfo}>
                <Text style={styles.rideTime}>{ride.time}</Text>
                <Text style={styles.rideType}>{ride.type}</Text>
              </View>
              <Text style={styles.rideAmount}>₹{ride.amount}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Weekly/Monthly Summary */}
      {selectedPeriod !== 'today' && (
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>
                ₹{(currentData.total / currentData.rides).toFixed(0)}
              </Text>
              <Text style={styles.summaryLabel}>Per Ride</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>
                ₹{(currentData.total / currentData.hours).toFixed(0)}
              </Text>
              <Text style={styles.summaryLabel}>Per Hour</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>
                {((currentData.hours / (selectedPeriod === 'week' ? 7 : 30)) * 24).toFixed(1)}h
              </Text>
              <Text style={styles.summaryLabel}>Daily Avg</Text>
            </View>
          </View>
        </View>
      )}

      {/* Performance Insights */}
      <View style={styles.insightsSection}>
        <Text style={styles.sectionTitle}>Performance Insights</Text>
        <View style={styles.insightsCard}>
          <Text style={styles.insightsTitle}>💡 Tip</Text>
          <Text style={styles.insightsText}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  periodSelector: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  periodSelectorRow: {
    flexDirection: 'row',
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#2563eb',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  periodButtonTextActive: {
    color: '#ffffff',
  },
  earningsSummary: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    marginHorizontal: 20,
    marginVertical: 20,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    alignItems: 'center',
  },
  earningsLabel: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 8,
  },
  earningsAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#16a34a',
    marginBottom: 20,
  },
  earningsStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  withdrawContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  withdrawButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  withdrawButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  ridesSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  rideCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rideInfo: {
    flex: 1,
  },
  rideTime: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 4,
  },
  rideType: {
    fontSize: 12,
    color: '#64748b',
  },
  rideAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#16a34a',
  },
  summarySection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 16,
    marginHorizontal: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  insightsSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  insightsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  insightsText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
});