import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

// Import services and stores
import { supabase } from '../../services/supabase/client';
import { useUser } from '../../stores/appStore';

// Import types
import { Booking } from '../../types';
import { CustomerTabParamList, CustomerStackParamList } from '../../types/navigation';

const RideHistoryScreen = ({ navigation }: { navigation: CompositeNavigationProp<BottomTabNavigationProp<CustomerTabParamList>, StackNavigationProp<CustomerStackParamList>> }) => {
  const user = useUser();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTripHistory();
    }
  }, [user]);

  const fetchTripHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const bookingsWithDrivers = await Promise.all(
        (data || []).map(async (booking) => {
          if (booking.driver_id) {
            const { data: driverData } = await supabase
              .from('users')
              .select('full_name')
              .eq('id', booking.driver_id)
              .single();
            
            return {
              ...booking,
              driver: {
                user: driverData
              }
            };
          }
          return booking;
        })
      );
      
      setBookings(bookingsWithDrivers);
    } catch (error) {
      console.error('Error fetching trip history:', error);
      Toast.show({ type: 'error', text1: 'Failed to load trip history' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!cancelBookingId || !cancelReason.trim()) {
      Toast.show({ type: 'error', text1: 'Please provide a cancellation reason' });
      return;
    }

    try {
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({ 
          status: 'cancelled',
          cancellation_reason: cancelReason.trim()
        })
        .eq('id', cancelBookingId);

      if (bookingError) throw bookingError;

      const { error: cancellationError } = await supabase
        .from('booking_cancellations')
        .insert({
          booking_id: cancelBookingId,
          user_id: user?.id,
          reason: cancelReason.trim()
        });

      if (cancellationError) throw cancellationError;

      Toast.show({ type: 'success', text1: 'Booking cancelled successfully' });
      setCancelDialogOpen(false);
      setCancelBookingId(null);
      setCancelReason('');
      fetchTripHistory();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      Toast.show({ type: 'error', text1: 'Failed to cancel booking' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return { backgroundColor: '#10b98120', color: '#10b981', borderColor: '#10b98150' };
      case 'cancelled':
        return { backgroundColor: '#ef444420', color: '#ef4444', borderColor: '#ef444450' };
      case 'pending':
        return { backgroundColor: '#eab30820', color: '#eab308', borderColor: '#eab30850' };
      case 'started':
        return { backgroundColor: '#3b82f620', color: '#3b82f6', borderColor: '#3b82f650' };
      default:
        return { backgroundColor: '#6b728020', color: '#6b7280', borderColor: '#6b728050' };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRateTrip = (booking: Booking) => {
    if (!booking.driver_id || !booking.driver?.user?.full_name) {
      Toast.show({ type: 'error', text1: 'Driver information not available' });
      return;
    }

    navigation.navigate('ReviewModal', {
      bookingId: booking.id,
      driverId: booking.driver_id,
      driverName: booking.driver.user.full_name
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTripHistory();
  };

  const renderBookingItem = ({ item }: { item: Booking }) => (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, getStatusColor(item.status)]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status).color }]}>
              {item.status}
            </Text>
          </View>
          <View style={styles.paymentBadge}>
            <Text style={styles.paymentText}>{item.payment_status}</Text>
          </View>
        </View>
        <View style={styles.dateContainer}>
          <MaterialIcons name="event" size={14} color="#6b7280" />
          <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
        </View>
      </View>

      <View style={styles.locationContainer}>
        <View style={styles.locationRow}>
          <MaterialIcons name="location-on" size={14} color="#10b981" />
          <View>
            <Text style={styles.locationLabel}>Pickup</Text>
            <Text style={styles.locationText}>{item.pickup_address || 'N/A'}</Text>
          </View>
        </View>
        <View style={styles.locationRow}>
          <MaterialIcons name="location-on" size={14} color="#ef4444" />
          <View>
            <Text style={styles.locationLabel}>Dropoff</Text>
            <Text style={styles.locationText}>{item.dropoff_address || 'N/A'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <MaterialIcons name="directions-car" size={14} color="#3b82f6" />
          <Text style={styles.detailText}>{item.vehicle_type || 'Standard'}</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialIcons name="attach-money" size={14} color="#3b82f6" />
          <Text style={styles.detailText}>₹{item.fare_amount}</Text>
        </View>
        {item.started_at && item.completed_at && (
          <View style={styles.detailRow}>
            <MaterialIcons name="schedule" size={14} color="#3b82f6" />
            <Text style={styles.detailText}>
              {Math.round((new Date(item.completed_at).getTime() - new Date(item.started_at).getTime()) / (1000 * 60))} mins
            </Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.tripId}>Trip ID: {item.id.slice(0, 8)}...</Text>
        <View style={styles.actionButtons}>
          {(item.status === 'pending' || item.status === 'accepted') && (
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => {
                setCancelBookingId(item.id);
                setCancelDialogOpen(true);
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
          {item.status === 'completed' && item.driver_id && (
            <TouchableOpacity
              style={styles.rateButton}
              onPress={() => handleRateTrip(item)}
            >
              <MaterialIcons name="star" size={14} color="#eab308" />
              <Text style={styles.rateButtonText}>Rate Trip</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={styles.detailsButton}
            onPress={() => navigation.navigate('TripDetails', { bookingId: item.id })}
          >
            <Text style={styles.detailsButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Trip History</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Trip History</Text>
        <Text style={styles.headerSubtitle}>View all your past and current bookings</Text>
      </View>

      {bookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="directions-car" size={48} color="#6b7280" />
          <Text style={styles.emptyTitle}>No trips yet</Text>
          <Text style={styles.emptySubtitle}>Book your first ride to see your trip history</Text>
          <TouchableOpacity style={styles.bookButton} onPress={() => navigation.navigate('BookRide')}>
            <Text style={styles.bookButtonText}>Book a Ride</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={bookings}
          renderItem={renderBookingItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      )}

      {/* Cancel Booking Modal */}
      <Modal
        visible={cancelDialogOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCancelDialogOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cancel Booking</Text>
            <Text style={styles.modalDescription}>
              Are you sure you want to cancel this booking? Please provide a reason for cancellation.
            </Text>
            <TextInput
              style={styles.reasonInput}
              placeholder="Please provide a reason for cancellation..."
              value={cancelReason}
              onChangeText={setCancelReason}
              multiline={true}
              numberOfLines={4}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelModalButton]}
                onPress={() => {
                  setCancelReason('');
                  setCancelBookingId(null);
                  setCancelDialogOpen(false);
                }}
              >
                <Text style={styles.cancelModalButtonText}>Keep Booking</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmCancelButton]}
                onPress={handleCancelBooking}
              >
                <Text style={styles.confirmCancelButtonText}>Cancel Booking</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  paymentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  paymentText: {
    fontSize: 12,
    color: '#64748b',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 4,
  },
  locationContainer: {
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  locationLabel: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 8,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
    marginLeft: 8,
  },
  detailsContainer: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#1e293b',
    marginLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  tripId: {
    fontSize: 12,
    color: '#64748b',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fef2f2',
    borderRadius: 6,
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '500',
  },
  rateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    marginRight: 8,
  },
  rateButtonText: {
    color: '#ca8a04',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  detailsButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
  },
  detailsButtonText: {
    color: '#3b82f6',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  bookButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  bookButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '100%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 8,
  },
  cancelModalButton: {
    backgroundColor: '#f1f5f9',
  },
  cancelModalButtonText: {
    color: '#64748b',
    fontWeight: '500',
  },
  confirmCancelButton: {
    backgroundColor: '#dc2626',
  },
  confirmCancelButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
});

export default RideHistoryScreen;