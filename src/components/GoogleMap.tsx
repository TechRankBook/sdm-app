import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { GOOGLE_MAPS_API_KEY } from '@/constants';

interface LocationData {
  lat: number;
  lng: number;
  address: string;
}

interface RouteData {
  distance: string;
  duration: string;
  distanceKm: number;
  durationMinutes: number;
  polyline?: string;
}

interface GoogleMapProps {
  pickupLocation?: LocationData | null;
  dropoffLocation?: LocationData | null;
  height?: string | number;
  onRouteUpdate?: (routeData: RouteData) => void;
  interactive?: boolean;
  onPickupChange?: (location: LocationData) => void;
  onDropoffChange?: (location: LocationData) => void;
  activeMarker?: 'pickup' | 'dropoff';
}

export const GoogleMap: React.FC<GoogleMapProps> = ({
  pickupLocation,
  dropoffLocation,
  height = '300px',
  onRouteUpdate,
  interactive = false,
  onPickupChange,
  onDropoffChange,
  activeMarker = 'pickup',
}) => {
  const mapRef = useRef<MapView>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate route when both locations are available
  useEffect(() => {
    if (pickupLocation && dropoffLocation) {
      calculateRoute();
    } else {
      setRouteCoordinates([]);
    }
  }, [pickupLocation, dropoffLocation]);

  // Fit map to show both markers
  useEffect(() => {
    if (mapRef.current && (pickupLocation || dropoffLocation)) {
      const coordinates: any[] = [];

      if (pickupLocation) {
        coordinates.push({
          latitude: pickupLocation.lat,
          longitude: pickupLocation.lng,
        });
      }

      if (dropoffLocation) {
        coordinates.push({
          latitude: dropoffLocation.lat,
          longitude: dropoffLocation.lng,
        });
      }

      if (coordinates.length > 0) {
        mapRef.current.fitToCoordinates(coordinates, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
      }
    }
  }, [pickupLocation, dropoffLocation]);

  const calculateRoute = async () => {
    if (!pickupLocation || !dropoffLocation) return;

    setIsLoading(true);
    try {
      const origin = `${pickupLocation.lat},${pickupLocation.lng}`;
      const destination = `${dropoffLocation.lat},${dropoffLocation.lng}`;

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${GOOGLE_MAPS_API_KEY}&mode=driving&units=metric`
      );

      const data = await response.json();

      if (data.status === 'OK' && data.routes.length > 0) {
        const route = data.routes[0];
        const leg = route.legs[0];

        // Decode polyline
        const points = decodePolyline(route.overview_polyline.points);
        setRouteCoordinates(points);

        // Extract route data
        const routeData: RouteData = {
          distance: leg.distance.text,
          duration: leg.duration.text,
          distanceKm: leg.distance.value / 1000, // Convert meters to km
          durationMinutes: Math.round(leg.duration.value / 60), // Convert seconds to minutes
          polyline: route.overview_polyline.points,
        };

        onRouteUpdate?.(routeData);
      } else if (data.status === 'ZERO_RESULTS') {
        console.error('No route found between locations');
        Alert.alert('No Route Found', 'Unable to find a route between these locations. Please try different locations.');
        setRouteCoordinates([]);
      } else if (data.status === 'OVER_QUERY_LIMIT') {
        console.error('Directions API quota exceeded');
        Alert.alert('Service Unavailable', 'Route calculation service is temporarily unavailable. Please try again later.');
        setRouteCoordinates([]);
      } else if (data.status === 'REQUEST_DENIED') {
        console.error('Directions API request denied');
        Alert.alert('Service Error', 'Route calculation service is currently unavailable.');
        setRouteCoordinates([]);
      } else {
        console.error('Directions API error:', data.status);
        Alert.alert('Route Error', 'Unable to calculate route. Please check your locations.');
        setRouteCoordinates([]);
      }
    } catch (error) {
      console.error('Route calculation error:', error);
      Alert.alert('Error', 'Failed to calculate route. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Decode Google Maps polyline
  const decodePolyline = (encoded: string) => {
    const points: any[] = [];
    let index = 0;
    let lat = 0;
    let lng = 0;

    while (index < encoded.length) {
      let shift = 0;
      let result = 0;
      let byte: number;

      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      const dlat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;

      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      const dlng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5,
      });
    }

    return points;
  };

  const handleMapPress = async (event: any) => {
    if (!interactive) return;

    const { coordinate } = event.nativeEvent;
    const location: LocationData = {
      lat: coordinate.latitude,
      lng: coordinate.longitude,
      address: `${coordinate.latitude.toFixed(6)}, ${coordinate.longitude.toFixed(6)}`,
    };

    try {
      // Reverse geocode to get address
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinate.latitude},${coordinate.longitude}&key=${GOOGLE_MAPS_API_KEY}`
      );

      const data = await response.json();
      if (data.status === 'OK' && data.results.length > 0) {
        location.address = data.results[0].formatted_address;
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }

    if (activeMarker === 'pickup' && onPickupChange) {
      onPickupChange(location);
    } else if (activeMarker === 'dropoff' && onDropoffChange) {
      onDropoffChange(location);
    }
  };

  const getMapRegion = () => {
    if (pickupLocation) {
      return {
        latitude: pickupLocation.lat,
        longitude: pickupLocation.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    }

    // Default to Bangalore
    return {
      latitude: 12.9716,
      longitude: 77.5946,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    };
  };

  return (
    <View className="relative">
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={{
          width: '100%',
          height: typeof height === 'string' ? parseInt(height) : height,
        }}
        region={getMapRegion()}
        onPress={handleMapPress}
        showsUserLocation={true}
        showsMyLocationButton={true}
        zoomEnabled={true}
        scrollEnabled={interactive}
        rotateEnabled={interactive}
      >
        {/* Pickup Marker */}
        {pickupLocation && (
          <Marker
            coordinate={{
              latitude: pickupLocation.lat,
              longitude: pickupLocation.lng,
            }}
            title="Pickup Location"
            description={pickupLocation.address}
            pinColor="green"
          />
        )}

        {/* Dropoff Marker */}
        {dropoffLocation && (
          <Marker
            coordinate={{
              latitude: dropoffLocation.lat,
              longitude: dropoffLocation.lng,
            }}
            title="Drop-off Location"
            description={dropoffLocation.address}
            pinColor="red"
          />
        )}

        {/* Route Polyline */}
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#2563eb"
            strokeWidth={4}
          />
        )}
      </MapView>

      {/* Loading Indicator */}
      {isLoading && (
        <View className="absolute inset-0 bg-black/20 items-center justify-center">
          <View className="bg-white p-4 rounded-lg">
            <Text className="text-slate-800">Calculating route...</Text>
          </View>
        </View>
      )}

      {/* Interactive Mode Indicator */}
      {interactive && (
        <View className="absolute top-2 left-2 bg-white p-2 rounded-lg shadow-lg">
          <Text className="text-xs text-slate-600">
            Tap map to set {activeMarker === 'pickup' ? 'pickup' : 'drop-off'} location
          </Text>
        </View>
      )}
    </View>
  );
};