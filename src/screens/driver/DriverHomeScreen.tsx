import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  StyleSheet,
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
    <ScrollView style={styles.container}>
      {/* Online Status */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Text style={styles.statusTitle}>Driver Status</Text>
          <Switch
            value={isOnline}
            onValueChange={toggleOnlineStatus}
            trackColor={{ false: '#cbd5e1', true: '#2563eb' }}
            thumbColor={isOnline ? '#ffffff' : '#f1f5f9'}
          />
        </View>
        <Text style={[styles.statusText, isOnline ? styles.onlineText : styles.offlineText]}>
          {isOnline ? 'Online - Accepting rides' : 'Offline - Not accepting rides'}
        </Text>
      </View>

      {/* Current Ride */}
      {currentRide && (
        <View style={styles.rideCard}>
          <Text style={styles.rideTitle}>Current Ride</Text>
          <View style={styles.rideDetails}>
            <Text style={styles.rideDetailText}>Pickup: {currentRide.pickup}</Text>
            <Text style={styles.rideDetailText}>Drop: {currentRide.drop}</Text>
            <Text style={styles.rideDetailText}>Fare: ₹{currentRide.fare}</Text>
          </View>
          <View style={styles.rideActions}>
            <TouchableOpacity style={styles.arrivedButton}>
              <Text style={styles.arrivedButtonText}>Arrived at Pickup</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.completeButton}>
              <Text style={styles.completeButtonText}>Complete Ride</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Available Ride Request */}
      {isOnline && !currentRide && (
        <View style={styles.requestCard}>
          <Text style={styles.requestTitle}>🚗 New Ride Request</Text>
          <View style={styles.requestDetails}>
            <Text style={styles.requestDetailText}>Distance: 2.5 km</Text>
            <Text style={styles.requestDetailText}>Fare: ₹180</Text>
            <Text style={styles.requestDetailText}>Pickup: Connaught Place</Text>
            <Text style={styles.requestDetailText}>Drop: Karol Bagh</Text>
          </View>
          <View style={styles.requestActions}>
            <TouchableOpacity
              style={styles.rejectButton}
              onPress={handleRejectRide}
            >
              <Text style={styles.rejectButtonText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={handleAcceptRide}
            >
              <Text style={styles.acceptButtonText}>Accept</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Stats */}
      <View style={styles.statsSection}>
        <Text style={styles.statsTitle}>Today's Summary</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>💰</Text>
            <Text style={styles.statValue}>₹{stats.todayEarnings}</Text>
            <Text style={styles.statLabel}>Earnings</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🚗</Text>
            <Text style={styles.statValue}>{stats.todayRides}</Text>
            <Text style={styles.statLabel}>Rides</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>⭐</Text>
            <Text style={styles.statValue}>{stats.rating}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📊</Text>
            <Text style={styles.statValue}>{stats.totalRides}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsSection}>
        <Text style={styles.actionsTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionIcon}>📍</Text>
            <Text style={styles.actionText}>Update Location</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionIcon}>📞</Text>
            <Text style={styles.actionText}>Emergency</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionIcon}>⚙️</Text>
            <Text style={styles.actionText}>Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionIcon}>📈</Text>
            <Text style={styles.actionText}>Analytics</Text>
          </TouchableOpacity>
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
  statusCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 20,
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
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  onlineText: {
    color: '#10b981',
  },
  offlineText: {
    color: '#ef4444',
  },
  rideCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginVertical: 20,
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
  rideTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  rideDetails: {
    marginBottom: 16,
  },
  rideDetailText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  rideActions: {
    flexDirection: 'row',
    gap: 12,
  },
  arrivedButton: {
    flex: 1,
    backgroundColor: '#f59e0b',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  arrivedButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  completeButton: {
    flex: 1,
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  requestCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginVertical: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#2563eb',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  requestTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  requestDetails: {
    marginBottom: 16,
  },
  requestDetailText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 12,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  rejectButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  statIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  actionsSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  actionsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
});