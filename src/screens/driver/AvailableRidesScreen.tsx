import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

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
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Available Rides</Text>
        <Text style={styles.headerSubtitle}>
          {availableRides.length} ride{availableRides.length !== 1 ? 's' : ''} available
        </Text>
      </View>

      {/* Rides List */}
      {availableRides.length > 0 ? (
        <View style={styles.ridesList}>
          {availableRides.map((ride) => (
            <View key={ride.id} style={styles.rideCard}>
              {/* Header */}
              <View style={styles.rideHeader}>
                <View style={styles.rideHeaderLeft}>
                  <Text style={styles.customerName}>{ride.customerName}</Text>
                  <View style={styles.customerInfo}>
                    <View style={styles.customerRatingContainer}>
                      <MaterialIcons name="star" size={14} color="#f59e0b" />
                      <Text style={styles.customerRating}>{ride.customerRating}</Text>
                    </View>
                    <Text style={styles.requestedTime}>{ride.requestedAt}</Text>
                  </View>
                </View>
                <View
                  style={[styles.serviceTypeBadge, { backgroundColor: getServiceTypeColor(ride.serviceType) }]}
                >
                  <Text style={styles.serviceTypeText}>{ride.serviceType}</Text>
                </View>
              </View>

              {/* Route */}
              <View style={styles.routeContainer}>
                <View style={styles.routeStep}>
                  <Text style={styles.routeDot}>●</Text>
                  <Text style={styles.routeText}>{ride.pickup}</Text>
                </View>
                <View style={styles.routeLine} />
                <View style={styles.routeStep}>
                  <Text style={styles.routeDot}>●</Text>
                  <Text style={styles.routeText}>{ride.drop}</Text>
                </View>
              </View>

              {/* Ride Details */}
              <View style={styles.rideDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Distance:</Text>
                  <Text style={styles.detailValue}>{ride.distance}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Duration:</Text>
                  <Text style={styles.detailValue}>{ride.duration}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Fare:</Text>
                  <Text style={styles.detailValue}>₹{ride.fare}</Text>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.actionButtonSkip]}
                  onPress={() => handleRejectRide(ride.id)}
                >
                  <Text style={styles.actionButtonText}>Skip</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.actionButtonAccept]}
                  onPress={() => handleAcceptRide(ride)}
                >
                  <Text style={[styles.actionButtonText, styles.actionButtonTextAccept]}>Accept Ride</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="directions-car" size={60} color="#cbd5e1" />
          <Text style={styles.emptyTitle}>No rides available</Text>
          <Text style={styles.emptyText}>
            New ride requests will appear here when available
          </Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={onRefresh}
          >
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  ridesList: {
    padding: 20,
  },
  rideCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  rideHeaderLeft: {
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  customerRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  customerRating: {
    fontSize: 14,
    color: '#f59e0b',
    fontWeight: '500',
  },
  requestedTime: {
    fontSize: 12,
    color: '#64748b',
  },
  serviceTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  serviceTypeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#ffffff',
  },
  routeContainer: {
    marginBottom: 16,
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
  rideDetails: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
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
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonSkip: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  actionButtonAccept: {
    flex: 2,
    backgroundColor: '#16a34a',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
  },
  actionButtonTextAccept: {
    color: '#ffffff',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  refreshButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  refreshButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
});