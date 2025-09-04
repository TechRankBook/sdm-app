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
    <ScrollView className="flex-1 bg-secondary-50">
      {/* Service Type Selection */}
      <View className="p-5">
        <Text className="text-xl font-semibold text-foreground mb-4">Book Your Ride</Text>
        <View className="flex-row flex-wrap gap-3 p-1 glass rounded-2xl border border-glass-border">
          {serviceTypes.map((service) => (
            <TouchableOpacity
              key={service.id}
              className={`flex-1 min-w-[45%] p-3 rounded-xl items-center ${
                serviceType === service.id ? 'bg-primary' : 'bg-secondary-50'
              }`}
              onPress={() => setServiceType(service.id as ServiceType)}
            >
              <Text className="text-2xl mb-2">{service.icon}</Text>
              <Text className={`text-sm font-medium text-center ${
                serviceType === service.id ? 'text-primary-foreground' : 'text-secondary-700'
              }`}>
                {service.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Trip Type for Outstation and Airport */}
      {(serviceType === 'outstation' || serviceType === 'airport') && (
        <View className="px-5 mb-5">
          <View className="flex-row p-1 bg-white rounded-xl">
            {serviceType === 'outstation' ? (
              <>
                <TouchableOpacity
                  className={`flex-1 p-3 rounded-lg items-center ${
                    tripType === 'oneway' ? 'bg-blue-600' : 'bg-slate-50'
                  }`}
                  onPress={() => {
                    setTripType('oneway');
                    setIsRoundTrip(false);
                  }}
                >
                  <Text className={`text-sm font-medium ${
                    tripType === 'oneway' ? 'text-white' : 'text-slate-700'
                  }`}>
                    One Way
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 p-3 rounded-lg items-center ${
                    tripType === 'roundtrip' ? 'bg-blue-600' : 'bg-slate-50'
                  }`}
                  onPress={() => {
                    setTripType('roundtrip');
                    setIsRoundTrip(true);
                  }}
                >
                  <Text className={`text-sm font-medium ${
                    tripType === 'roundtrip' ? 'text-white' : 'text-slate-700'
                  }`}>
                    Round Trip
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  className={`flex-1 p-3 rounded-lg items-center ${
                    tripType === 'pickup' ? 'bg-blue-600' : 'bg-slate-50'
                  }`}
                  onPress={() => setTripType('pickup')}
                >
                  <Text className={`text-sm font-medium ${
                    tripType === 'pickup' ? 'text-white' : 'text-slate-700'
                  }`}>
                    Pick-up
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 p-3 rounded-lg items-center ${
                    tripType === 'drop' ? 'bg-blue-600' : 'bg-slate-50'
                  }`}
                  onPress={() => setTripType('drop')}
                >
                  <Text className={`text-sm font-medium ${
                    tripType === 'drop' ? 'text-white' : 'text-slate-700'
                  }`}>
                    Drop-off
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Round Trip Toggle for Airport */}
          {serviceType === 'airport' && (
            <View className="mt-4 flex-row items-center justify-between p-3 bg-white rounded-lg">
              <Text className="text-sm font-medium text-slate-700">Round Trip</Text>
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
      <View className="px-5 mb-5">
        {/* Pickup Location */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-slate-700 mb-2">
            {serviceType === 'airport' && tripType === 'pickup' ? 'Select Terminal' : 'Pickup Location'}
          </Text>

          {serviceType === 'airport' && tripType === 'pickup' ? (
            <View className="flex-row gap-3">
              {Object.entries(airportTerminals).map(([key, terminal]) => (
                <TouchableOpacity
                  key={key}
                  className="flex-1 p-3 bg-white rounded-lg border-2 border-slate-200"
                  onPress={() => {
                    setPickupLocation(terminal.address);
                    setPickupCoords({
                      lat: 13.1986, lng: 77.7066, address: terminal.address
                    });
                    setPickupLocationError('');
                  }}
                >
                  <Text className="text-sm font-medium text-center">{terminal.name}</Text>
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
            <Text className="text-xs text-red-600 mt-1">{pickupLocationError}</Text>
          ) : null}
        </View>

        {/* Dropoff Location */}
        {serviceType !== 'hourly' && (
          <View className="mb-4">
            <Text className="text-sm font-medium text-slate-700 mb-2">
              {serviceType === 'airport' && tripType === 'drop' ? 'Select Terminal' : 'Drop Location'}
            </Text>

            {serviceType === 'airport' && tripType === 'drop' ? (
              <View className="flex-row gap-3">
                {Object.entries(airportTerminals).map(([key, terminal]) => (
                  <TouchableOpacity
                    key={key}
                    className="flex-1 p-3 bg-white rounded-lg border-2 border-slate-200"
                    onPress={() => {
                      setDropoffLocation(terminal.address);
                      setDropoffCoords({
                        lat: 13.1986, lng: 77.7066, address: terminal.address
                      });
                      setDropoffLocationError('');
                    }}
                  >
                    <Text className="text-sm font-medium text-center">{terminal.name}</Text>
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
              <Text className="text-xs text-red-600 mt-1">{dropoffLocationError}</Text>
            ) : null}
          </View>
        )}

        {/* Map Toggle */}
        <View className="mb-4">
          <TouchableOpacity
            className="flex-row items-center justify-between p-3 bg-white rounded-lg border border-slate-200"
            onPress={() => setShowMap(!showMap)}
          >
            <View className="flex-row items-center">
              <Text className="text-lg mr-2">🗺️</Text>
              <Text className="text-sm font-medium text-slate-700">View on Map</Text>
            </View>
            <Text className="text-lg">{showMap ? '−' : '+'}</Text>
          </TouchableOpacity>
        </View>

        {/* Interactive Map */}
        {showMap && (
          <View className="mb-6">
            <View className="flex-row p-1 bg-white rounded-lg mb-3">
              <TouchableOpacity
                className={`flex-1 p-2 rounded-md items-center ${
                  activeMapMarker === 'pickup' ? 'bg-blue-600' : 'bg-slate-50'
                }`}
                onPress={() => setActiveMapMarker('pickup')}
              >
                <Text className={`text-sm font-medium ${
                  activeMapMarker === 'pickup' ? 'text-white' : 'text-slate-700'
                }`}>
                  Set Pickup
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 p-2 rounded-md items-center ${
                  activeMapMarker === 'dropoff' ? 'bg-blue-600' : 'bg-slate-50'
                }`}
                onPress={() => setActiveMapMarker('dropoff')}
              >
                <Text className={`text-sm font-medium ${
                  activeMapMarker === 'dropoff' ? 'text-white' : 'text-slate-700'
                }`}>
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
        <View className="flex-row gap-3 mb-4">
          <TouchableOpacity
            className="flex-1 bg-white p-4 rounded-lg border border-slate-200"
            onPress={() => setShowDateTimeModal(true)}
          >
            <Text className="text-sm text-slate-500">Select Date</Text>
            <Text className="text-base font-medium text-slate-800">
              {scheduledDate ? scheduledDate.toLocaleDateString() : 'Choose date'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 bg-white p-4 rounded-lg border border-slate-200"
            onPress={() => setShowDateTimeModal(true)}
          >
            <Text className="text-sm text-slate-500">Select Time</Text>
            <Text className="text-base font-medium text-slate-800">
              {scheduledTime || 'Choose time'}
            </Text>
          </TouchableOpacity>
        </View>

        {dateTimeError ? (
          <Text className="text-xs text-red-600 mb-4">{dateTimeError}</Text>
        ) : null}

        {/* Return Date & Time for Round Trip */}
        {isRoundTrip && (
          <View className="flex-row gap-3 mb-4">
            <TouchableOpacity
              className="flex-1 bg-white p-4 rounded-lg border border-slate-200"
              onPress={() => setShowDateTimeModal(true)}
            >
              <Text className="text-sm text-slate-500">Return Date</Text>
              <Text className="text-base font-medium text-slate-800">
                {returnDate ? returnDate.toLocaleDateString() : 'Choose date'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-white p-4 rounded-lg border border-slate-200"
              onPress={() => setShowDateTimeModal(true)}
            >
              <Text className="text-sm text-slate-500">Return Time</Text>
              <Text className="text-base font-medium text-slate-800">
                {returnTime || 'Choose time'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Passenger Selection */}
        <TouchableOpacity
          className="bg-white p-4 rounded-lg border border-slate-200 mb-4"
          onPress={() => setShowGuestModal(true)}
        >
          <Text className="text-sm text-slate-500">Passengers</Text>
          <Text className="text-base font-medium text-slate-800">
            {passengers} Guest{passengers !== 1 ? 's' : ''}
          </Text>
        </TouchableOpacity>

        {/* Vehicle Type Selection */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-slate-700 mb-3">Vehicle Type</Text>
          <View className="flex-row gap-3">
            {vehicleTypes.map((vehicle) => (
              <TouchableOpacity
                key={vehicle.type}
                className={`flex-1 p-3 rounded-lg items-center border-2 ${
                  vehicleType === vehicle.type
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-slate-200 bg-white'
                }`}
                onPress={() => setVehicleType(vehicle.type as VehicleType)}
              >
                <Text className="text-xl mb-1">{vehicle.icon}</Text>
                <Text className={`text-sm font-medium ${
                  vehicleType === vehicle.type ? 'text-blue-600' : 'text-slate-700'
                }`}>
                  {vehicle.label}
                </Text>
                <Text className="text-xs text-slate-500">{vehicle.capacity}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Special Instructions */}
        <View className="mb-4">
          <TouchableOpacity
            className="flex-row items-center justify-between p-3 bg-white rounded-lg border border-slate-200"
            onPress={() => setShowSpecialInstructions(!showSpecialInstructions)}
          >
            <Text className="text-sm font-medium text-slate-700">Special Instructions</Text>
            <Text className="text-lg">{showSpecialInstructions ? '−' : '+'}</Text>
          </TouchableOpacity>

          {showSpecialInstructions && (
            <View className="mt-3 p-4 bg-white rounded-lg border border-slate-200">
              {/* Luggage */}
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-sm text-slate-700">Luggage Items</Text>
                <View className="flex-row items-center gap-3">
                  <TouchableOpacity
                    className="w-8 h-8 bg-slate-200 rounded-full items-center justify-center"
                    onPress={() => setLuggageCount(Math.max(0, luggageCount - 1))}
                  >
                    <Text className="text-lg font-bold">−</Text>
                  </TouchableOpacity>
                  <Text className="w-8 text-center">{luggageCount}</Text>
                  <TouchableOpacity
                    className="w-8 h-8 bg-slate-200 rounded-full items-center justify-center"
                    onPress={() => setLuggageCount(Math.min(3, luggageCount + 1))}
                  >
                    <Text className="text-lg font-bold">+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Pet */}
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-sm text-slate-700">Traveling with Pet</Text>
                <Switch
                  value={hasPet}
                  onValueChange={setHasPet}
                  trackColor={{ false: '#cbd5e1', true: '#2563eb' }}
                  thumbColor={hasPet ? '#ffffff' : '#f1f5f9'}
                />
              </View>

              {/* Additional Instructions */}
              <TextInput
                className="p-3 bg-slate-50 rounded-lg border border-slate-200"
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
          <View className="bg-white p-4 rounded-lg border border-slate-200 mb-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-lg font-semibold text-slate-800">Estimated Fare</Text>
              {fareData.surgeMultiplier > 1 && (
                <View className="bg-orange-100 px-2 py-1 rounded">
                  <Text className="text-xs font-medium text-orange-800">
                    {((fareData.surgeMultiplier - 1) * 100).toFixed(0)}% Surge
                  </Text>
                </View>
              )}
            </View>
            <Text className="text-2xl font-bold text-green-600">₹{fareData.totalFare}</Text>
            <Text className="text-xs text-slate-500 mt-1">
              Base: ₹{fareData.baseFare} | Distance: ₹{fareData.distanceFare} | Time: ₹{fareData.timeFare}
            </Text>
            <Text className="text-xs text-slate-400 mt-1">
              Distance: {routeData.distance} | Duration: {routeData.duration}
            </Text>
            {fareData.surgeReason && (
              <Text className="text-xs text-orange-600 mt-1">
                Surge: {fareData.surgeReason}
              </Text>
            )}
          </View>
        )}

        {/* Search Cars Button */}
        <TouchableOpacity
          className={`py-4 rounded-lg items-center mb-6 ${
            isFormValid() ? 'bg-blue-600' : 'bg-slate-300'
          }`}
          onPress={handleSearchCars}
          disabled={!isFormValid()}
        >
          <Text className={`text-base font-semibold ${
            isFormValid() ? 'text-white' : 'text-slate-500'
          }`}>
            {isFormValid() ? 'Search Cars' : 'Complete Form'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Guest Modal */}
      <Modal visible={showGuestModal} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white p-6 rounded-t-2xl">
            <Text className="text-lg font-semibold text-slate-800 mb-4">Select Passengers</Text>

            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-base text-slate-700">Passengers</Text>
              <View className="flex-row items-center gap-4">
                <TouchableOpacity
                  className="w-10 h-10 bg-slate-200 rounded-full items-center justify-center"
                  onPress={() => setPassengers(Math.max(1, passengers - 1))}
                >
                  <Text className="text-xl font-bold">−</Text>
                </TouchableOpacity>
                <Text className="text-lg font-semibold w-8 text-center">{passengers}</Text>
                <TouchableOpacity
                  className="w-10 h-10 bg-slate-200 rounded-full items-center justify-center"
                  onPress={() => setPassengers(Math.min(6, passengers + 1))}
                >
                  <Text className="text-xl font-bold">+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              className="bg-blue-600 py-3 rounded-lg items-center"
              onPress={() => setShowGuestModal(false)}
            >
              <Text className="text-base font-semibold text-white">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Date Time Modal - Simplified for now */}
      <Modal visible={showDateTimeModal} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white p-6 rounded-t-2xl">
            <Text className="text-lg font-semibold text-slate-800 mb-4">Select Date & Time</Text>

            {/* This would be replaced with proper date/time pickers */}
            <TouchableOpacity
              className="bg-blue-600 py-3 rounded-lg items-center mb-4"
              onPress={() => {
                const now = new Date();
                now.setHours(now.getHours() + 1);
                setScheduledDate(now);
                setScheduledTime(now.toTimeString().slice(0, 5));
                setShowDateTimeModal(false);
              }}
            >
              <Text className="text-base font-semibold text-white">Schedule for 1 hour later</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-slate-200 py-3 rounded-lg items-center"
              onPress={() => setShowDateTimeModal(false)}
            >
              <Text className="text-base font-semibold text-slate-700">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}