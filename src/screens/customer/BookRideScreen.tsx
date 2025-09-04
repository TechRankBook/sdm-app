import React, { useCallback } from 'react';
import { ScrollView, Alert, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Import types and navigation
import { CustomerTabParamList } from '@/types/navigation';

// Import components
import { BookingFlow } from '@/components/booking/BookingFlow';

type BookRideScreenNavigationProp = StackNavigationProp<CustomerTabParamList, 'BookRide'>;

export default function BookRideScreen() {
  const navigation = useNavigation<BookRideScreenNavigationProp>();

  const handleBookingComplete = useCallback((bookingData: any) => {
    // Here you would typically send the booking data to your backend
    console.log('Booking completed:', bookingData);

    // For now, show success message and navigate back
    Alert.alert(
      'Booking Confirmed!',
      'Your ride has been booked successfully. You will receive a confirmation shortly.',
      [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Home')
        }
      ]
    );
  }, [navigation]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }}>
      <BookingFlow onBookingComplete={handleBookingComplete} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffbeb',
  },
});