import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import Toast from 'react-native-toast-message';

// Import services and stores
import { supabase } from '@/services/supabase/client';
import { useUser } from '@/stores/appStore';

// Import types
import { Booking } from '@/types';
import { CustomerTabParamList, CustomerStackParamList } from '@/types/navigation';

type TripDetailsScreenProps = {
  navigation: StackNavigationProp<CustomerStackParamList>;
  route: { params: { bookingId: string } };
};

const TripDetailsScreen: React.FC<TripDetailsScreenProps> = ({ route, navigation }) => {
  const user = useUser();
  const { bookingId } = route.params;
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  const fetchBookingDetails = async (): Promise<void> => {
    try {
      setLoading(true);
      
      // Fetch booking details
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single();

      if (bookingError) throw bookingError;

      // Fetch driver details if available
      let driverDetails = null;
      if (bookingData.driver_id) {
        const { data: driverData, error: driverError } = await supabase
          .from('users')
          .select('full_name, phone_no,profile_picture_url')
          .eq('id', bookingData.driver_id)
          .single();

        if (!driverError && driverData) {
          driverDetails = driverData;
        }
      }

      // Fetch vehicle details if available
      let vehicleDetails = null;
      if (bookingData.vehicle_id) {
        const { data: vehicleData, error: vehicleError } = await supabase
          .from('vehicles')
          .select('model, license_plate, color')
          .eq('id', bookingData.vehicle_id)
          .single();

        if (!vehicleError && vehicleData) {
          vehicleDetails = vehicleData;
        }
      }

      // Fetch payment details if available
      let paymentDetails = null;
      const { data: paymentData, error: paymentError } = await supabase
        .from('payments')
        .select('transaction_id, razorpay_payment_id, gateway_response, amount_paid')
        .eq('booking_id', bookingId)
        .single();

      if (!paymentError && paymentData) {
        paymentDetails = paymentData;
      }

      // Combine all data
      const completeBookingData = {
        ...bookingData,
        driver: driverDetails ? { user: driverDetails } : null,
        vehicle: vehicleDetails,
        payment: paymentDetails
      };

      setBooking(completeBookingData);
    } catch (error) {
      console.error('Error fetching booking details:', error);
      Toast.show({ type: 'error', text1: 'Failed to load trip details' });
    } finally {
      setLoading(false);
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

  const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateTripDuration = (startTime: string, endTime: string): string => {
    if (!startTime || !endTime) return 'N/A';
    const duration = new Date(endTime).getTime() - new Date(startTime).getTime();
    const minutes = Math.round(duration / (1000 * 60));
    
    if (minutes < 60) {
      return `${minutes} mins`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
  };

  const capitalizeText = (text: string): string => {
    if (!text) return '';
    return text
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const handleTrackRide = () => {
    if (booking?.driver_id && booking?.vehicle_id) {
      navigation.navigate('TrackRide', { 
        bookingId: booking.id,
        driverId: booking.driver_id,
        vehicleId: booking.vehicle_id
      });
    } else {
      Toast.show({
        type: 'info',
        text1: 'Tracking not available',
        text2: 'Driver or vehicle information is not available for this trip'
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.detailsHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.detailsHeaderTitle}>Trip Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.container}>
        <View style={styles.detailsHeader}>
          
          <View style={styles.placeholder} />
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.notFoundText}>Trip details not found</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.detailsHeader}>
       
        <View style={[styles.statusBadge, getStatusColor(booking.status)]}>
          <Text style={[styles.statusText, { color: getStatusColor(booking.status).color }]}>
            {capitalizeText(booking.status)}
          </Text>
        </View>
      </View>

      <View style={styles.detailsContent}>
        {/* Trip Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trip Information</Text>
          <View style={styles.sectionContent}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Service Type</Text>
              <Text style={styles.infoValue}>{capitalizeText(booking.service_type) || 'Standard'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Trip Type</Text>
              <Text style={styles.infoValue}>{(booking.trip_type) || 'One Way'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <MaterialIcons name="location-on" size={16} color="#10b981" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Pickup Location</Text>
                <Text style={styles.infoValue}>{booking.pickup_address}</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <MaterialIcons name="location-on" size={16} color="#ef4444" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Drop-off Location</Text>
                <Text style={styles.infoValue}>{booking.dropoff_address}</Text>
              </View>
            </View>
            
            {booking.distance_km && (
              <View style={styles.infoRow}>
                <MaterialIcons name="straighten" size={16} color="#3b82f6" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Distance</Text>
                  <Text style={styles.infoValue}>{booking.distance_km} km</Text>
                </View>
              </View>
            )}
            
            {booking.passengers && (
              <View style={styles.infoRow}>
                <MaterialIcons name="people" size={16} color="#8b5cf6" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Passengers</Text>
                  <Text style={styles.infoValue}>{booking.passengers}</Text>
                </View>
              </View>
            )}
            
            <View style={styles.infoRow}>
              <MaterialIcons name="event" size={16} color="#3b82f6" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Booking Time</Text>
                <Text style={styles.infoValue}>{formatDateTime(booking.created_at)}</Text>
              </View>
            </View>
            
            {booking.scheduled_time && (
              <View style={styles.infoRow}>
                <MaterialIcons name="access-time" size={16} color="#8b5cf6" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Scheduled Time</Text>
                  <Text style={styles.infoValue}>{formatDateTime(booking.scheduled_time)}</Text>
                </View>
              </View>
            )}
            
            {booking.started_at && booking.completed_at && (
              <View style={styles.infoRow}>
                <MaterialIcons name="access-time" size={16} color="#3b82f6" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Trip Duration</Text>
                  <Text style={styles.infoValue}>
                    {calculateTripDuration(booking.started_at, booking.completed_at)}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Track Ride Button - Only show for active trips
        {(booking.status === 'pending' || booking.status === 'started') && (
          <TouchableOpacity style={styles.trackButton} onPress={handleTrackRide}>
            <MaterialIcons name="my-location" size={20} color="#fff" />
            <Text style={styles.trackButtonText}>Track Ride</Text>
          </TouchableOpacity>
        )} */}

        {/* Vehicle & Driver Information */}
        {booking.driver && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Driver Information</Text>
            <View style={styles.sectionContent}>
              <View style={styles.infoRow}>
                <MaterialIcons name="person" size={16} color="#3b82f6" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Driver Name</Text>
                  <Text style={styles.infoValue}>{booking.driver.user?.full_name || 'N/A'}</Text>
                </View>
              </View>
              
              <View style={styles.infoRow}>
                <MaterialIcons name="phone" size={16} color="#3b82f6" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Contact</Text>
                  <Text style={styles.infoValue}>{booking.driver.user?.phone_no || 'N/A'}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Vehicle Information */}
        {booking.vehicle && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vehicle Information</Text>
            <View style={styles.sectionContent}>
              <View style={styles.infoRow}>
                <MaterialIcons name="directions-car" size={16} color="#3b82f6" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Vehicle Type</Text>
                  <Text style={styles.infoValue}>{capitalizeText(booking.vehicle_type) || 'Standard'}</Text>
                </View>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Vehicle Model</Text>
                <Text style={styles.infoValue}>{booking.vehicle?.model}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>License Plate</Text>
                <Text style={styles.infoValue}>{booking.vehicle?.license_plate}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Payment Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Details</Text>
          <View style={styles.sectionContent}>
            <View style={styles.infoRow}>
              <MaterialIcons name="attach-money" size={16} color="#3b82f6" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Total Fare</Text>
                <Text style={styles.totalFare}>₹{booking.fare_amount}</Text>
              </View>
            </View>
            
            {booking.advance_amount && (
              <View style={styles.infoRow}>
                <MaterialIcons name="payments" size={16} color="#3b82f6" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Advance Paid</Text>
                  <Text style={styles.infoValue}>₹{booking.advance_amount}</Text>
                </View>
              </View>
            )}
            
            {booking.remaining_amount && (
              <View style={styles.infoRow}>
                <MaterialIcons name="money-off" size={16} color="#3b82f6" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Remaining Amount</Text>
                  <Text style={styles.infoValue}>₹{booking.remaining_amount}</Text>
                </View>
              </View>
            )}
            
            {booking.payment?.amount_paid && (
              <View style={styles.infoRow}>
                <MaterialIcons name="payment" size={16} color="#3b82f6" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Amount Paid</Text>
                  <Text style={styles.infoValue}>₹{booking.payment.amount_paid}</Text>
                </View>
              </View>
            )}
            
            <View style={styles.infoRow}>
              <MaterialIcons name="payment" size={16} color="#3b82f6" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Payment Method</Text>
                <Text style={styles.infoValue}>{(booking.payment_method) || 'Not specified'}</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Payment Status</Text>
              <View style={[
                styles.paymentStatusBadge, 
                booking.payment_status === 'paid' ? styles.paidStatus : 
                booking.payment_status === 'pending' ? styles.pendingStatus : 
                styles.failedStatus
              ]}>
                <Text style={styles.paymentStatusText}>{(booking.payment_status)}</Text>
              </View>
            </View>
            
            {booking.payment?.transaction_id && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Transaction ID</Text>
                <Text style={styles.transactionId}>{booking.payment.transaction_id}</Text>
              </View>
            )}
          </View>
        </View>

        {booking.special_instructions && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Special Instructions</Text>
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsText}>{booking.special_instructions}</Text>
            </View>
          </View>
        )}

        <View style={styles.tripIdContainer}>
          <Text style={styles.tripIdText}>Trip ID: {booking.id}</Text>
        </View>
         {/* Track Ride Button - Only show for active trips */}
        {(booking.status === 'pending' || booking.status === 'started') && (
          <TouchableOpacity style={styles.trackButton} onPress={handleTrackRide}>
            <MaterialIcons name="my-location" size={20} color="#fff" />
            <Text style={styles.trackButtonText}>Track Ride</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 4,
  },
  detailsHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  placeholder: {
    width: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: 16,
    color: '#64748b',
  },
  detailsContent: {
    padding: 16,
  },
  section: {
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
    width: '40%',
  },
  infoValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
    flex: 1,
    textTransform: 'capitalize',
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: 8,
  },
  totalFare: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  paymentStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paidStatus: {
    backgroundColor: '#10b98120',
    borderColor: '#10b98150',
    borderWidth: 1,
  },
  pendingStatus: {
    backgroundColor: '#eab30820',
    borderColor: '#eab30850',
    borderWidth: 1,
  },
  failedStatus: {
    backgroundColor: '#ef444420',
    borderColor: '#ef444450',
    borderWidth: 1,
  },
  paymentStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  transactionId: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: 'monospace',
  },
  instructionsContainer: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#1e293b',
  },
  tripIdContainer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  tripIdText: {
    fontSize: 12,
    color: '#64748b',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  trackButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TripDetailsScreen;