import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
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
    <ScrollView style={styles.container}>
      {/* Ride Status */}
      <View style={styles.card}>
        <Text style={styles.statusTitle}>Ride Status</Text>
        <View style={styles.statusContainer}>
          <View style={styles.statusStep}>
            <View style={[
              styles.statusDot,
              rideStatus === 'pickup' ? styles.statusDotActive : styles.statusDotInactive
            ]} />
            <Text style={styles.statusText}>Pickup</Text>
          </View>
          <View style={styles.statusLine} />
          <View style={styles.statusStep}>
            <View style={[
              styles.statusDot,
              rideStatus === 'in_progress' ? styles.statusDotActive : styles.statusDotInactive
            ]} />
            <Text style={styles.statusText}>In Progress</Text>
          </View>
          <View style={styles.statusLine} />
          <View style={styles.statusStep}>
            <View style={[
              styles.statusDot,
              rideStatus === 'completed' ? styles.statusDotActive : styles.statusDotInactive
            ]} />
            <Text style={styles.statusText}>Completed</Text>
          </View>
        </View>
      </View>

      {/* Customer Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Customer Details</Text>
        <View style={{ marginBottom: 16 }}>
          <Text style={styles.customerName}>{activeRide.customerName}</Text>
          <Text style={styles.customerPhone}>{activeRide.customerPhone}</Text>
        </View>
        <TouchableOpacity
          style={styles.callButton}
          onPress={handleCallCustomer}
        >
          <Text style={styles.callButtonText}>📞 Call Customer</Text>
        </TouchableOpacity>
      </View>

      {/* Ride Details */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Ride Details</Text>

        <View style={styles.rideDetails}>
          <View style={styles.routeContainer}>
            <View style={styles.routeStep}>
              <Text style={styles.routeDot}>●</Text>
              <Text style={styles.routeText}>{activeRide.pickup}</Text>
            </View>
            <View style={styles.routeLine} />
            <View style={styles.routeStep}>
              <Text style={styles.routeDot}>●</Text>
              <Text style={styles.routeText}>{activeRide.drop}</Text>
            </View>
          </View>

          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Distance:</Text>
              <Text style={styles.detailValue}>{activeRide.distance}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Duration:</Text>
              <Text style={styles.detailValue}>{activeRide.duration}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Vehicle:</Text>
              <Text style={styles.detailValue}>{activeRide.vehicleType}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Fare:</Text>
              <Text style={styles.detailValue}>₹{activeRide.fare}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        {rideStatus === 'pickup' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonPrimary]}
            onPress={handleArrivedAtPickup}
          >
            <Text style={styles.actionButtonText}>Arrived at Pickup</Text>
          </TouchableOpacity>
        )}

        {rideStatus === 'in_progress' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonPrimary]}
            onPress={handleStartRide}
          >
            <Text style={styles.actionButtonText}>Start Ride</Text>
          </TouchableOpacity>
        )}

        {rideStatus === 'in_progress' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonSuccess]}
            onPress={handleCompleteRide}
          >
            <Text style={styles.actionButtonText}>Complete Ride</Text>
          </TouchableOpacity>
        )}

        {rideStatus === 'completed' && (
          <View style={styles.completedCard}>
            <Text style={styles.completedTitle}>✅ Ride Completed</Text>
            <Text style={styles.completedText}>
              Payment of ₹{activeRide.fare} will be credited to your account
            </Text>
          </View>
        )}
      </View>

      {/* Emergency Button */}
      <View style={styles.emergencyContainer}>
        <TouchableOpacity
          style={styles.emergencyButton}
          onPress={handleEmergency}
        >
          <Text style={styles.emergencyButtonText}>🚨 Emergency</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  card: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 20,
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 20,
  },
  statusStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusDotActive: {
    backgroundColor: '#2563eb',
  },
  statusDotInactive: {
    backgroundColor: '#cbd5e1',
  },
  statusText: {
    fontSize: 14,
    color: '#475569',
  },
  statusLine: {
    width: 1,
    height: 20,
    backgroundColor: '#e2e8f0',
    marginVertical: 4,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  customerPhone: {
    fontSize: 14,
    color: '#64748b',
  },
  callButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  callButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  },
  rideDetails: {
    marginBottom: 20,
  },
  routeContainer: {
    marginBottom: 20,
  },
  routeStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  routeDot: {
    fontSize: 14,
    color: '#2563eb',
    marginRight: 12,
    width: 16,
    textAlign: 'center',
  },
  routeText: {
    fontSize: 14,
    color: '#475569',
    flex: 1,
  },
  routeLine: {
    height: 20,
    width: 1,
    backgroundColor: '#e2e8f0',
    marginLeft: 7,
    marginBottom: 8,
  },
  detailsCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  actionContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonPrimary: {
    backgroundColor: '#2563eb',
  },
  actionButtonSuccess: {
    backgroundColor: '#16a34a',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  completedCard: {
    backgroundColor: '#f0fdf4',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  completedTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 8,
  },
  completedText: {
    fontSize: 14,
    color: '#166534',
    textAlign: 'center',
  },
  emergencyContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  emergencyButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  emergencyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});