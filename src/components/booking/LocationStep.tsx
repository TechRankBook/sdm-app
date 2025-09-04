import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { ServiceType } from '@/types';
import { GooglePlacesInput } from '@/components/GooglePlacesInput';

interface LocationData {
  lat: number;
  lng: number;
  address: string;
}

interface LocationStepProps {
  serviceType: ServiceType;
  tripType: 'oneway' | 'roundtrip' | 'pickup' | 'drop';
  pickupLocation: string;
  dropoffLocation: string;
  pickupCoords: LocationData | null;
  dropoffCoords: LocationData | null;
  pickupLocationError: string;
  dropoffLocationError: string;
  onPickupLocationChange: (value: string) => void;
  onDropoffLocationChange: (value: string) => void;
  onPickupCoordsChange: (coords: LocationData | null) => void;
  onDropoffCoordsChange: (coords: LocationData | null) => void;
  onPickupLocationError: (error: string) => void;
  onDropoffLocationError: (error: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export const LocationStep: React.FC<LocationStepProps> = ({
  serviceType,
  tripType,
  pickupLocation,
  dropoffLocation,
  pickupCoords,
  dropoffCoords,
  pickupLocationError,
  dropoffLocationError,
  onPickupLocationChange,
  onDropoffLocationChange,
  onPickupCoordsChange,
  onDropoffCoordsChange,
  onPickupLocationError,
  onDropoffLocationError,
  onNext,
  onBack,
}) => {

  // Airport terminals
  const airportTerminals = {
    terminal1: { name: 'Terminal 1 (KIA)', address: 'Terminal 1, Kempegowda International Airport' },
    terminal2: { name: 'Terminal 2 (KIA)', address: 'Terminal 2, Kempegowda International Airport' }
  };

  // Location validation
  const validateLocationRadius = (lat: number, lng: number) => {
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

  const handlePickupSelect = (place: any) => {
    const isWithinRadius = validateLocationRadius(
      place.geometry.location.lat,
      place.geometry.location.lng
    );

    if (!isWithinRadius) {
      onPickupLocationError("❌ We're currently unavailable in this location. Please select a location near Mysore or Bangalore.");
      onPickupCoordsChange(null);
      onPickupLocationChange(place.description);
      return;
    }

    onPickupLocationError("");
    onPickupCoordsChange({
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
      address: place.description
    });
    onPickupLocationChange(place.description);
  };

  const handleDropoffSelect = (place: any) => {
    const isWithinRadius = validateLocationRadius(
      place.geometry.location.lat,
      place.geometry.location.lng
    );

    if (!isWithinRadius) {
      onDropoffLocationError("❌ We're currently unavailable in this location. Please select a location near Mysore or Bangalore.");
      onDropoffCoordsChange(null);
      onDropoffLocationChange(place.description);
      return;
    }

    onDropoffLocationError("");
    onDropoffCoordsChange({
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
      address: place.description
    });
    onDropoffLocationChange(place.description);
  };

  const isFormValid = () => {
    const hasPickup = !!pickupCoords;
    const hasDestination = serviceType === 'hourly' ? true : !!dropoffCoords;
    const noErrors = !pickupLocationError && !dropoffLocationError;
    return hasPickup && hasDestination && noErrors;
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Select Locations</Text>
          <Text style={styles.subtitle}>Choose your pickup and drop-off locations</Text>
        </View>

        {/* Pickup Location */}
        <View style={styles.locationSection}>
          <Text style={styles.locationLabel}>
            {serviceType === 'airport' && tripType === 'pickup' ? 'Select Terminal' : 'Pickup Location'}
          </Text>

          {serviceType === 'airport' && tripType === 'pickup' ? (
            <View style={styles.terminalContainer}>
              {Object.entries(airportTerminals).map(([key, terminal]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.terminalButton,
                    pickupLocation === terminal.address && styles.terminalButtonActive
                  ]}
                  onPress={() => {
                    onPickupLocationChange(terminal.address);
                    onPickupCoordsChange({
                      lat: 13.1986, lng: 77.7066, address: terminal.address
                    });
                    onPickupLocationError('');
                  }}
                >
                  <Text style={[
                    styles.terminalText,
                    pickupLocation === terminal.address && styles.terminalTextActive
                  ]}>
                    {terminal.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <GooglePlacesInput
              placeholder="Enter pickup location"
              value={pickupLocation}
              onChange={(value) => {
                onPickupLocationChange(value);
                onPickupCoordsChange(null);
              }}
              onPlaceSelect={handlePickupSelect}
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
          <View style={styles.locationSection}>
            <Text style={styles.locationLabel}>
              {serviceType === 'airport' && tripType === 'drop' ? 'Select Terminal' : 'Drop-off Location'}
            </Text>

            {serviceType === 'airport' && tripType === 'drop' ? (
              <View style={styles.terminalContainer}>
                {Object.entries(airportTerminals).map(([key, terminal]) => (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.terminalButton,
                      dropoffLocation === terminal.address && styles.terminalButtonActive
                    ]}
                    onPress={() => {
                      onDropoffLocationChange(terminal.address);
                      onDropoffCoordsChange({
                        lat: 13.1986, lng: 77.7066, address: terminal.address
                      });
                      onDropoffLocationError('');
                    }}
                  >
                    <Text style={[
                      styles.terminalText,
                      dropoffLocation === terminal.address && styles.terminalTextActive
                    ]}>
                      {terminal.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <GooglePlacesInput
                placeholder="Enter drop-off location"
                value={dropoffLocation}
                onChange={(value) => {
                  onDropoffLocationChange(value);
                  onDropoffCoordsChange(null);
                }}
                onPlaceSelect={handleDropoffSelect}
                icon="dropoff"
              />
            )}

            {dropoffLocationError ? (
              <Text style={styles.errorText}>{dropoffLocationError}</Text>
            ) : null}
          </View>
        )}

      </ScrollView>

      {/* Navigation */}
      <View style={styles.footer}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.nextButton, !isFormValid() && styles.nextButtonDisabled]}
            onPress={onNext}
            disabled={!isFormValid()}
          >
            <Text style={[
              styles.nextButtonText,
              !isFormValid() && styles.nextButtonTextDisabled,
            ]}>
              Continue
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  locationSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  locationLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  terminalContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  terminalButton: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  terminalButtonActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  terminalText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
  },
  terminalTextActive: {
    color: '#2563eb',
  },
  errorText: {
    fontSize: 12,
    color: '#dc2626',
    marginTop: 8,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
  },
  nextButton: {
    flex: 2,
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  nextButtonTextDisabled: {
    color: '#64748b',
  },
});