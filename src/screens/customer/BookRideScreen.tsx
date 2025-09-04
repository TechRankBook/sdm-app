import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Switch,
  Modal,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Import types and constants
import { CustomerTabParamList } from '@/types/navigation';
import { ServiceType, VehicleType, Location } from '@/types';
import {
  SERVICE_TYPES,
  SERVICE_TYPE_LABELS,
  VEHICLE_TYPES,
  VEHICLE_TYPE_LABELS,
  FARE_CONFIG,
  LOCATION_CONFIG
} from '@/constants';

// Import stores and services
import { useAppStore } from '@/stores/appStore';

// Import components and hooks
import { GooglePlacesInput } from '@/components/GooglePlacesInput';
import { GoogleMap } from '@/components/GoogleMap';
import { useFareCalculation } from '@/hooks/useFareCalculation';

type BookRideScreenNavigationProp = StackNavigationProp<CustomerTabParamList, 'BookRide'>;

interface LocationData {
  lat: number;
  lng: number;
  address: string;
}

interface BookingData {
  serviceType: ServiceType;
  pickupLocation: string;
  dropoffLocation?: string;
  scheduledDateTime?: string;
  returnDateTime?: string;
  passengers: number;
  vehicleType: VehicleType;
  isRoundTrip: boolean;
  tripType: 'oneway' | 'roundtrip' | 'pickup' | 'drop';
  specialInstructions?: string;
  pickupLatitude?: number;
  pickupLongitude?: number;
  dropoffLatitude?: number;
  dropoffLongitude?: number;
  distanceKm?: number;
  durationMinutes?: number;
}

export default function BookRideScreen() {
  const navigation = useNavigation<BookRideScreenNavigationProp>();
  const { user } = useAppStore();

  // Form state
  const [serviceType, setServiceType] = useState<ServiceType>('city');
  const [tripType, setTripType] = useState<'oneway' | 'roundtrip' | 'pickup' | 'drop'>('oneway');
  const [isRoundTrip, setIsRoundTrip] = useState(false);
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [passengers, setPassengers] = useState(2);
  const [vehicleType, setVehicleType] = useState<VehicleType>('sedan');
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>();
  const [scheduledTime, setScheduledTime] = useState('');
  const [returnDate, setReturnDate] = useState<Date | undefined>();
  const [returnTime, setReturnTime] = useState('');

  // Location coordinates
  const [pickupCoords, setPickupCoords] = useState<LocationData | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<LocationData | null>(null);

  // Special instructions
  const [showSpecialInstructions, setShowSpecialInstructions] = useState(false);
  const [luggageCount, setLuggageCount] = useState(0);
  const [hasPet, setHasPet] = useState(false);
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // UI state
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [showDateTimeModal, setShowDateTimeModal] = useState(false);
  const [pickupLocationError, setPickupLocationError] = useState('');
  const [dropoffLocationError, setDropoffLocationError] = useState('');
  const [dateTimeError, setDateTimeError] = useState('');
  const [activeMapMarker, setActiveMapMarker] = useState<'pickup' | 'dropoff'>('pickup');
  const [showMap, setShowMap] = useState(false);

  // Route data for fare calculation
  const [routeData, setRouteData] = useState<{
    distance: string;
    duration: string;
    distanceKm: number;
    durationMinutes: number;
  } | null>(null);

  // Service type options
  const serviceTypes = [
    { id: 'airport', name: 'Airport Taxi', icon: '✈️' },
    { id: 'outstation', name: 'Outstation', icon: '🛣️' },
    { id: 'hourly', name: 'Hourly Rentals', icon: '⏰' },
    { id: 'city', name: 'City Ride', icon: '🏙️' }
  ];

  // Vehicle type options
  const vehicleTypes = [
    { type: 'sedan', label: 'Sedan', capacity: '4 passengers', icon: '🚗' },
    { type: 'suv', label: 'SUV', capacity: '6 passengers', icon: '🚙' },
    { type: 'premium', label: 'Premium', capacity: '4 passengers', icon: '🏎️' }
  ];

  // Airport terminals
  const airportTerminals = {
    terminal1: { name: 'Terminal 1 (KIA)', address: 'Terminal 1, Kempegowda International Airport' },
    terminal2: { name: 'Terminal 2 (KIA)', address: 'Terminal 2, Kempegowda International Airport' }
  };

  // Fare calculation with surge pricing
  const fareData = useFareCalculation({
    serviceType,
    vehicleType,
    distanceKm: routeData?.distanceKm || 0,
    durationMinutes: routeData?.durationMinutes || 0,
    scheduledDateTime: scheduledDate && scheduledTime
      ? `${scheduledDate.toISOString().split('T')[0]}T${scheduledTime}:00`
      : undefined,
  });

  // Time slots generation
  const generateTimeSlots = () => {
    const slots: string[] = [];
    for (let h = 0; h < 24; h++) {
      const hh = String(h).padStart(2, '0');
      slots.push(`${hh}:00`);
      slots.push(`${hh}:30`);
    }
    slots.push('24:00');
    return slots;
  };

  // Location validation
  const validateLocationRadius = (lat: number, lng: number) => {
    // Mysore and Bangalore coordinates
    const mysoreCoords = { lat: 12.2958, lng: 76.6394 };
    const bangaloreCoords = { lat: 12.9716, lng: 77.5946 };

    const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLng = (lng2 - lng1) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    const distanceFromMysore = calculateDistance(lat, lng, mysoreCoords.lat, mysoreCoords.lng);
    const distanceFromBangalore = calculateDistance(lat, lng, bangaloreCoords.lat, bangaloreCoords.lng);

    return distanceFromMysore <= 50 || distanceFromBangalore <= 50;
  };

  // Update special instructions
  const updateSpecialInstructions = () => {
    const parts = [];
    if (luggageCount > 0) parts.push(`${luggageCount} luggage item${luggageCount !== 1 ? 's' : ''}`);
    if (hasPet) parts.push('Traveling with pet');
    if (additionalInstructions.trim()) parts.push(additionalInstructions.trim());

    const combined = parts.join(', ');
    setSpecialInstructions(combined);
    return combined;
  };

  useEffect(() => {
    updateSpecialInstructions();
  }, [luggageCount, hasPet, additionalInstructions]);

  // Form validation
  const isFormValid = useCallback(() => {
    const hasPickup = !!pickupCoords;
    const hasDestination = serviceType === 'hourly' ? true : !!dropoffCoords;
    const hasDateTime = !!(scheduledDate && scheduledTime);
    const hasValidReturn = !isRoundTrip || (returnDate && returnTime);
    const noLocationErrors = !pickupLocationError && !dropoffLocationError;

    return hasPickup && hasDestination && hasDateTime && hasValidReturn && noLocationErrors;
  }, [pickupCoords, dropoffCoords, serviceType, scheduledDate, scheduledTime, isRoundTrip, returnDate, returnTime, pickupLocationError, dropoffLocationError]);

  // Handle booking submission
  const handleSearchCars = useCallback(() => {
    if (!isFormValid()) {
      Alert.alert('Incomplete Form', 'Please fill all required fields');
      return;
    }

    // Create booking data
    const bookingData: BookingData = {
      serviceType,
      pickupLocation,
      dropoffLocation: serviceType === 'hourly' ? undefined : dropoffLocation,
      passengers,
      vehicleType,
      isRoundTrip,
      tripType,
      specialInstructions,
      pickupLatitude: pickupCoords?.lat,
      pickupLongitude: pickupCoords?.lng,
      dropoffLatitude: dropoffCoords?.lat,
      dropoffLongitude: dropoffCoords?.lng,
      distanceKm: routeData?.distanceKm,
      durationMinutes: routeData?.durationMinutes,
    };

    // Add date/time if scheduled
    if (scheduledDate && scheduledTime) {
      const dateTime = `${scheduledDate.toISOString().split('T')[0]}T${scheduledTime}:00`;
      bookingData.scheduledDateTime = dateTime;
    }

    if (isRoundTrip && returnDate && returnTime) {
      const returnDateTime = `${returnDate.toISOString().split('T')[0]}T${returnTime}:00`;
      bookingData.returnDateTime = returnDateTime;
    }

    // Navigate to vehicle selection with fare data
    navigation.navigate('Home'); // For now, navigate back to home
    Alert.alert('Booking Created', 'Your booking has been submitted successfully!');
  }, [isFormValid, serviceType, pickupLocation, dropoffLocation, passengers, vehicleType, isRoundTrip, tripType, specialInstructions, pickupCoords, dropoffCoords, routeData, scheduledDate, scheduledTime, returnDate, returnTime, navigation]);

  return (
    <ScrollView
      style={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Service Type Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Book Your Ride</Text>
        <View style={styles.serviceTypeContainer}>
          {serviceTypes.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={[
                styles.serviceTypeButton,
                serviceType === service.id && styles.serviceTypeButtonActive
              ]}
              onPress={() => setServiceType(service.id as ServiceType)}
            >
              <Text style={styles.serviceIcon}>{service.icon}</Text>
              <Text style={[
                styles.serviceText,
                serviceType === service.id && styles.serviceTextActive
              ]}>
                {service.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Trip Type for Outstation and Airport */}
      {(serviceType === 'outstation' || serviceType === 'airport') && (
        <View style={styles.tripTypeSection}>
          <View style={styles.tripTypeContainer}>
            {serviceType === 'outstation' ? (
              <>
                <TouchableOpacity
                  style={[
                    styles.tripTypeButton,
                    tripType === 'oneway' && styles.tripTypeButtonActive
                  ]}
                  onPress={() => {
                    setTripType('oneway');
                    setIsRoundTrip(false);
                  }}
                >
                  <Text style={[
                    styles.tripTypeText,
                    tripType === 'oneway' && styles.tripTypeTextActive
                  ]}>
                    One Way
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.tripTypeButton,
                    tripType === 'roundtrip' && styles.tripTypeButtonActive
                  ]}
                  onPress={() => {
                    setTripType('roundtrip');
                    setIsRoundTrip(true);
                  }}
                >
                  <Text style={[
                    styles.tripTypeText,
                    tripType === 'roundtrip' && styles.tripTypeTextActive
                  ]}>
                    Round Trip
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={[
                    styles.tripTypeButton,
                    tripType === 'pickup' && styles.tripTypeButtonActive
                  ]}
                  onPress={() => setTripType('pickup')}
                >
                  <Text style={[
                    styles.tripTypeText,
                    tripType === 'pickup' && styles.tripTypeTextActive
                  ]}>
                    Pick-up
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.tripTypeButton,
                    tripType === 'drop' && styles.tripTypeButtonActive
                  ]}
                  onPress={() => setTripType('drop')}
                >
                  <Text style={[
                    styles.tripTypeText,
                    tripType === 'drop' && styles.tripTypeTextActive
                  ]}>
                    Drop-off
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Round Trip Toggle for Airport */}
          {serviceType === 'airport' && (
            <View style={styles.roundTripToggle}>
              <Text style={styles.roundTripText}>Round Trip</Text>
              <Switch
                value={isRoundTrip}
                onValueChange={setIsRoundTrip}
                trackColor={{ false: '#cbd5e1', true: '#2563eb' }}
                thumbColor={isRoundTrip ? '#ffffff' : '#f1f5f9'}
              />
            </View>
          )}
        </View>
      )}

      {/* Location Selection */}
      <View style={styles.locationSection}>
        {/* Pickup Location */}
        <View style={styles.locationField}>
          <Text style={styles.locationLabel}>
            {serviceType === 'airport' && tripType === 'pickup' ? 'Select Terminal' : 'Pickup Location'}
          </Text>

          {serviceType === 'airport' && tripType === 'pickup' ? (
            <View style={styles.terminalContainer}>
              {Object.entries(airportTerminals).map(([key, terminal]) => (
                <TouchableOpacity
                  key={key}
                  style={styles.terminalButton}
                  onPress={() => {
                    setPickupLocation(terminal.address);
                    setPickupCoords({
                      lat: 13.1986, lng: 77.7066, address: terminal.address
                    });
                    setPickupLocationError('');
                  }}
                >
                  <Text style={styles.terminalText}>{terminal.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <GooglePlacesInput
              placeholder="Enter pickup location"
              value={pickupLocation}
              onChange={(value) => {
                setPickupLocation(value);
                setPickupCoords(null);
              }}
              onPlaceSelect={(place) => {
                const isWithinRadius = validateLocationRadius(
                  place.geometry.location.lat,
                  place.geometry.location.lng
                );

                if (!isWithinRadius) {
                  setPickupLocationError("❌ We're currently unavailable in this location. Please select a location near Mysore or Bangalore.");
                  setPickupCoords(null);
                  setPickupLocation(place.description);
                  return;
                }

                setPickupLocationError("");
                setPickupCoords({
                  lat: place.geometry.location.lat,
                  lng: place.geometry.location.lng,
                  address: place.description
                });
                setPickupLocation(place.description);
              }}
              icon="pickup"
              showCurrentLocation={true}
            />
          )}

          {pickupLocationError ? (
            <Text style={styles.errorText}>{pickupLocationError}</Text>
          ) : null}
        </View>

        {/* Dropoff Location */}
        {serviceType !== 'hourly' && (
          <View style={styles.locationField}>
            <Text style={styles.locationLabel}>
              {serviceType === 'airport' && tripType === 'drop' ? 'Select Terminal' : 'Drop Location'}
            </Text>

            {serviceType === 'airport' && tripType === 'drop' ? (
              <View style={styles.terminalContainer}>
                {Object.entries(airportTerminals).map(([key, terminal]) => (
                  <TouchableOpacity
                    key={key}
                    style={styles.terminalButton}
                    onPress={() => {
                      setDropoffLocation(terminal.address);
                      setDropoffCoords({
                        lat: 13.1986, lng: 77.7066, address: terminal.address
                      });
                      setDropoffLocationError('');
                    }}
                  >
                    <Text style={styles.terminalText}>{terminal.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <GooglePlacesInput
                placeholder="Enter drop location"
                value={dropoffLocation}
                onChange={(value) => {
                  setDropoffLocation(value);
                  setDropoffCoords(null);
                }}
                onPlaceSelect={(place) => {
                  const isWithinRadius = validateLocationRadius(
                    place.geometry.location.lat,
                    place.geometry.location.lng
                  );

                  if (!isWithinRadius) {
                    setDropoffLocationError("❌ We're currently unavailable in this location. Please select a location near Mysore or Bangalore.");
                    setDropoffCoords(null);
                    setDropoffLocation(place.description);
                    return;
                  }

                  setDropoffLocationError("");
                  setDropoffCoords({
                    lat: place.geometry.location.lat,
                    lng: place.geometry.location.lng,
                    address: place.description
                  });
                  setDropoffLocation(place.description);
                }}
                icon="dropoff"
              />
            )}

            {dropoffLocationError ? (
              <Text style={styles.errorText}>{dropoffLocationError}</Text>
            ) : null}
          </View>
        )}

        {/* Map Toggle */}
        <View style={styles.mapToggle}>
          <TouchableOpacity
            style={styles.mapToggleButton}
            onPress={() => setShowMap(!showMap)}
          >
            <View style={styles.mapToggleContent}>
              <Text style={styles.mapIcon}>🗺️</Text>
              <Text style={styles.mapToggleText}>View on Map</Text>
            </View>
            <Text style={styles.mapToggleIcon}>{showMap ? '−' : '+'}</Text>
          </TouchableOpacity>
        </View>

        {/* Interactive Map */}
        {showMap && (
          <View style={styles.mapContainer}>
            <View style={styles.mapMarkerContainer}>
              <TouchableOpacity
                style={[
                  styles.mapMarkerButton,
                  activeMapMarker === 'pickup' && styles.mapMarkerButtonActive
                ]}
                onPress={() => setActiveMapMarker('pickup')}
              >
                <Text style={[
                  styles.mapMarkerText,
                  activeMapMarker === 'pickup' && styles.mapMarkerTextActive
                ]}>
                  Set Pickup
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.mapMarkerButton,
                  activeMapMarker === 'dropoff' && styles.mapMarkerButtonActive
                ]}
                onPress={() => setActiveMapMarker('dropoff')}
              >
                <Text style={[
                  styles.mapMarkerText,
                  activeMapMarker === 'dropoff' && styles.mapMarkerTextActive
                ]}>
                  Set Drop-off
                </Text>
              </TouchableOpacity>
            </View>

            <GoogleMap
              pickupLocation={pickupCoords}
              dropoffLocation={dropoffCoords}
              height="300px"
              onRouteUpdate={(routeData) => {
                setRouteData(routeData);
              }}
              interactive={true}
              onPickupChange={(location) => {
                const isWithinRadius = validateLocationRadius(location.lat, location.lng);
                if (!isWithinRadius) {
                  setPickupLocationError("❌ We're currently unavailable in this location. Please select a location near Mysore or Bangalore.");
                  return;
                }
                setPickupLocationError("");
                setPickupCoords(location);
                setPickupLocation(location.address);
              }}
              onDropoffChange={(location) => {
                const isWithinRadius = validateLocationRadius(location.lat, location.lng);
                if (!isWithinRadius) {
                  setDropoffLocationError("❌ We're currently unavailable in this location. Please select a location near Mysore or Bangalore.");
                  return;
                }
                setDropoffLocationError("");
                setDropoffCoords(location);
                setDropoffLocation(location.address);
              }}
              activeMarker={activeMapMarker}
            />
          </View>
        )}

        {/* Date & Time Selection */}
        <View style={styles.dateTimeContainer}>
          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={() => setShowDateTimeModal(true)}
          >
            <Text style={styles.dateTimeLabel}>Select Date</Text>
            <Text style={styles.dateTimeValue}>
              {scheduledDate ? scheduledDate.toLocaleDateString() : 'Choose date'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={() => setShowDateTimeModal(true)}
          >
            <Text style={styles.dateTimeLabel}>Select Time</Text>
            <Text style={styles.dateTimeValue}>
              {scheduledTime || 'Choose time'}
            </Text>
          </TouchableOpacity>
        </View>

        {dateTimeError ? (
          <Text style={styles.errorText}>{dateTimeError}</Text>
        ) : null}

        {/* Return Date & Time for Round Trip */}
        {isRoundTrip && (
          <View style={styles.dateTimeContainer}>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowDateTimeModal(true)}
            >
              <Text style={styles.dateTimeLabel}>Return Date</Text>
              <Text style={styles.dateTimeValue}>
                {returnDate ? returnDate.toLocaleDateString() : 'Choose date'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowDateTimeModal(true)}
            >
              <Text style={styles.dateTimeLabel}>Return Time</Text>
              <Text style={styles.dateTimeValue}>
                {returnTime || 'Choose time'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Passenger Selection */}
        <TouchableOpacity
          style={styles.passengerButton}
          onPress={() => setShowGuestModal(true)}
        >
          <Text style={styles.passengerLabel}>Passengers</Text>
          <Text style={styles.passengerValue}>
            {passengers} Guest{passengers !== 1 ? 's' : ''}
          </Text>
        </TouchableOpacity>

        {/* Vehicle Type Selection */}
        <View style={styles.vehicleSection}>
          <Text style={styles.vehicleLabel}>Vehicle Type</Text>
          <View style={styles.vehicleContainer}>
            {vehicleTypes.map((vehicle) => (
              <TouchableOpacity
                key={vehicle.type}
                style={[
                  styles.vehicleButton,
                  vehicleType === vehicle.type && styles.vehicleButtonActive
                ]}
                onPress={() => setVehicleType(vehicle.type as VehicleType)}
              >
                <Text style={styles.vehicleIcon}>{vehicle.icon}</Text>
                <Text style={[
                  styles.vehicleName,
                  vehicleType === vehicle.type && styles.vehicleNameActive
                ]}>
                  {vehicle.label}
                </Text>
                <Text style={styles.vehicleCapacity}>{vehicle.capacity}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Special Instructions */}
        <View style={styles.specialInstructionsSection}>
          <TouchableOpacity
            style={styles.specialInstructionsToggle}
            onPress={() => setShowSpecialInstructions(!showSpecialInstructions)}
          >
            <Text style={styles.specialInstructionsLabel}>Special Instructions</Text>
            <Text style={styles.specialInstructionsIcon}>{showSpecialInstructions ? '−' : '+'}</Text>
          </TouchableOpacity>

          {showSpecialInstructions && (
            <View style={styles.specialInstructionsContent}>
              {/* Luggage */}
              <View style={styles.specialInstructionsRow}>
                <Text style={styles.specialInstructionsText}>Luggage Items</Text>
                <View style={styles.counterContainer}>
                  <TouchableOpacity
                    style={styles.counterButton}
                    onPress={() => setLuggageCount(Math.max(0, luggageCount - 1))}
                  >
                    <Text style={styles.counterButtonText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.counterValue}>{luggageCount}</Text>
                  <TouchableOpacity
                    style={styles.counterButton}
                    onPress={() => setLuggageCount(Math.min(3, luggageCount + 1))}
                  >
                    <Text style={styles.counterButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Pet */}
              <View style={styles.specialInstructionsRow}>
                <Text style={styles.specialInstructionsText}>Traveling with Pet</Text>
                <Switch
                  value={hasPet}
                  onValueChange={setHasPet}
                  trackColor={{ false: '#cbd5e1', true: '#2563eb' }}
                  thumbColor={hasPet ? '#ffffff' : '#f1f5f9'}
                />
              </View>

              {/* Additional Instructions */}
              <TextInput
                style={styles.additionalInstructionsInput}
                placeholder="Any additional requirements..."
                value={additionalInstructions}
                onChangeText={setAdditionalInstructions}
                multiline
                numberOfLines={3}
              />
            </View>
          )}
        </View>

        {/* Fare Display */}
        {fareData && routeData && (
          <View style={styles.fareDisplay}>
            <View style={styles.fareHeader}>
              <Text style={styles.fareTitle}>Estimated Fare</Text>
              {fareData.surgeMultiplier > 1 && (
                <View style={styles.surgeBadge}>
                  <Text style={styles.surgeText}>
                    {((fareData.surgeMultiplier - 1) * 100).toFixed(0)}% Surge
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.fareAmount}>₹{fareData.totalFare}</Text>
            <Text style={styles.fareBreakdown}>
              Base: ₹{fareData.baseFare} | Distance: ₹{fareData.distanceFare} | Time: ₹{fareData.timeFare}
            </Text>
            <Text style={styles.fareDetails}>
              Distance: {routeData.distance} | Duration: {routeData.duration}
            </Text>
            {fareData.surgeReason && (
              <Text style={styles.surgeReason}>
                Surge: {fareData.surgeReason}
              </Text>
            )}
          </View>
        )}

        {/* Search Cars Button */}
        <TouchableOpacity
          style={[
            styles.searchButton,
            isFormValid() && styles.searchButtonActive
          ]}
          onPress={handleSearchCars}
          disabled={!isFormValid()}
        >
          <Text style={[
            styles.searchButtonText,
            isFormValid() && styles.searchButtonTextActive
          ]}>
            {isFormValid() ? 'Search Cars' : 'Complete Form'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Guest Modal */}
      <Modal visible={showGuestModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Passengers</Text>

            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>Passengers</Text>
              <View style={styles.modalCounter}>
                <TouchableOpacity
                  style={styles.modalCounterButton}
                  onPress={() => setPassengers(Math.max(1, passengers - 1))}
                >
                  <Text style={styles.modalCounterText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.modalCounterValue}>{passengers}</Text>
                <TouchableOpacity
                  style={styles.modalCounterButton}
                  onPress={() => setPassengers(Math.min(6, passengers + 1))}
                >
                  <Text style={styles.modalCounterText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowGuestModal(false)}
            >
              <Text style={styles.modalButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Date Time Modal - Simplified for now */}
      <Modal visible={showDateTimeModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Date & Time</Text>

            {/* This would be replaced with proper date/time pickers */}
            <TouchableOpacity
              style={[styles.modalButton, { marginBottom: 16 }]}
              onPress={() => {
                const now = new Date();
                now.setHours(now.getHours() + 1);
                setScheduledDate(now);
                setScheduledTime(now.toTimeString().slice(0, 5));
                setShowDateTimeModal(false);
              }}
            >
              <Text style={styles.modalButtonText}>Schedule for 1 hour later</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowDateTimeModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  serviceTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    padding: 4,
    backgroundColor: '#ffffff',
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
  serviceTypeButton: {
    flex: 1,
    minWidth: '45%',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  serviceTypeButtonActive: {
    backgroundColor: '#2563eb',
  },
  serviceIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  serviceText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    color: '#475569',
  },
  serviceTextActive: {
    color: '#ffffff',
  },
  tripTypeSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tripTypeContainer: {
    flexDirection: 'row',
    padding: 4,
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
  tripTypeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
  },
  tripTypeButtonActive: {
    backgroundColor: '#2563eb',
  },
  tripTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
  },
  tripTypeTextActive: {
    color: '#ffffff',
  },
  roundTripToggle: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 8,
  },
  roundTripText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
  },
  locationSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  locationField: {
    marginBottom: 16,
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
    marginBottom: 8,
  },
  terminalContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  terminalButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  terminalText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 12,
    color: '#dc2626',
    marginTop: 4,
  },
  mapToggle: {
    marginBottom: 16,
  },
  mapToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  mapToggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  mapToggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
  },
  mapToggleIcon: {
    fontSize: 18,
  },
  mapContainer: {
    marginBottom: 24,
  },
  mapMarkerContainer: {
    flexDirection: 'row',
    padding: 4,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 12,
  },
  mapMarkerButton: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
  },
  mapMarkerButtonActive: {
    backgroundColor: '#2563eb',
  },
  mapMarkerText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
  },
  mapMarkerTextActive: {
    color: '#ffffff',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  dateTimeButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  dateTimeLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  dateTimeValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    marginTop: 4,
  },
  passengerButton: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  passengerLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  passengerValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    marginTop: 4,
  },
  vehicleSection: {
    marginBottom: 16,
  },
  vehicleLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
    marginBottom: 12,
  },
  vehicleContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  vehicleButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  vehicleButtonActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  vehicleIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  vehicleName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
  },
  vehicleNameActive: {
    color: '#2563eb',
  },
  vehicleCapacity: {
    fontSize: 12,
    color: '#64748b',
  },
  specialInstructionsSection: {
    marginBottom: 16,
  },
  specialInstructionsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  specialInstructionsLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
  },
  specialInstructionsIcon: {
    fontSize: 18,
  },
  specialInstructionsContent: {
    marginTop: 12,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  specialInstructionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  specialInstructionsText: {
    fontSize: 14,
    color: '#475569',
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  counterButton: {
    width: 32,
    height: 32,
    backgroundColor: '#e2e8f0',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  counterValue: {
    width: 32,
    textAlign: 'center',
  },
  additionalInstructionsInput: {
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  fareDisplay: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  fareHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  fareTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  surgeBadge: {
    backgroundColor: '#fed7aa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  surgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#ea580c',
  },
  fareAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  fareBreakdown: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  fareDetails: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  surgeReason: {
    fontSize: 12,
    color: '#ea580c',
    marginTop: 4,
  },
  searchButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#cbd5e1',
  },
  searchButtonActive: {
    backgroundColor: '#2563eb',
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  searchButtonTextActive: {
    color: '#ffffff',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  modalLabel: {
    fontSize: 16,
    color: '#475569',
  },
  modalCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  modalCounterButton: {
    width: 40,
    height: 40,
    backgroundColor: '#e2e8f0',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCounterText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalCounterValue: {
    fontSize: 18,
    fontWeight: '600',
    width: 32,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  modalCancelButton: {
    backgroundColor: '#e2e8f0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
  },
});