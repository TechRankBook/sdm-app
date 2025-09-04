import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { GOOGLE_MAPS_API_KEY } from '@/constants';

interface GooglePlacesInputProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect: (place: any) => void;
  icon?: 'pickup' | 'dropoff';
  showCurrentLocation?: boolean;
}

interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export const GooglePlacesInput: React.FC<GooglePlacesInputProps> = ({
  placeholder,
  value,
  onChange,
  onPlaceSelect,
  icon,
  showCurrentLocation = false,
}) => {
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const searchPlaces = async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setPredictions([]);
      setShowPredictions(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          query
        )}&key=${GOOGLE_MAPS_API_KEY}&components=country:in&types=geocode|establishment&location=12.9716,77.5946&radius=50000`
      );

      const data = await response.json();

      if (data.status === 'OK') {
        setPredictions(data.predictions.slice(0, 5)); // Limit to 5 results
        setShowPredictions(true);
      } else if (data.status === 'ZERO_RESULTS') {
        setPredictions([]);
        setShowPredictions(false);
      } else if (data.status === 'OVER_QUERY_LIMIT') {
        console.error('Places API quota exceeded');
        Alert.alert('Error', 'Search quota exceeded. Please try again later.');
        setPredictions([]);
        setShowPredictions(false);
      } else if (data.status === 'REQUEST_DENIED') {
        console.error('Places API request denied');
        Alert.alert('Error', 'Location search is currently unavailable.');
        setPredictions([]);
        setShowPredictions(false);
      } else {
        console.error('Places API error:', data.status);
        setPredictions([]);
        setShowPredictions(false);
      }
    } catch (error) {
      console.error('Network error:', error);
      Alert.alert('Network Error', 'Unable to search locations. Please check your internet connection.');
      setPredictions([]);
      setShowPredictions(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaceSelect = async (prediction: PlacePrediction) => {
    try {
      // Get place details
      const detailsResponse = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${prediction.place_id}&key=${GOOGLE_MAPS_API_KEY}&fields=geometry,formatted_address`
      );

      const detailsData = await detailsResponse.json();

      if (detailsData.status === 'OK') {
        const place = {
          description: prediction.description,
          geometry: {
            location: {
              lat: detailsData.result.geometry.location.lat,
              lng: detailsData.result.geometry.location.lng,
            },
          },
          formatted_address: detailsData.result.formatted_address,
        };

        onPlaceSelect(place);
        onChange(prediction.description);
        setShowPredictions(false);
        inputRef.current?.blur();
      }
    } catch (error) {
      console.error('Place details error:', error);
      Alert.alert('Error', 'Failed to get location details');
    }
  };

  const handleTextChange = (text: string) => {
    onChange(text);
    searchPlaces(text);
  };

  const getIcon = () => {
    switch (icon) {
      case 'pickup':
        return '📍';
      case 'dropoff':
        return '🏁';
      default:
        return '📍';
    }
  };

  const renderPrediction = ({ item }: { item: PlacePrediction }) => (
    <TouchableOpacity
      className="p-4 border-b border-slate-200 bg-white"
      onPress={() => handlePlaceSelect(item)}
    >
      <Text className="text-slate-800 font-medium">{item.structured_formatting.main_text}</Text>
      <Text className="text-slate-500 text-sm">{item.structured_formatting.secondary_text}</Text>
    </TouchableOpacity>
  );

  return (
    <View className="relative">
      <View className="flex-row items-center bg-white p-4 rounded-lg border border-slate-200">
        <Text className="text-lg mr-3">{getIcon()}</Text>
        <TextInput
          ref={inputRef}
          className="flex-1 text-base"
          placeholder={placeholder}
          value={value}
          onChangeText={handleTextChange}
          onFocus={() => {
            if (predictions.length > 0) {
              setShowPredictions(true);
            }
          }}
          onBlur={() => {
            // Delay hiding predictions to allow selection
            setTimeout(() => setShowPredictions(false), 200);
          }}
        />
        {isLoading && <Text className="text-slate-400">...</Text>}
      </View>

      {showPredictions && predictions.length > 0 && (
        <View className="absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-60">
          <FlatList
            data={predictions}
            keyExtractor={(item) => item.place_id}
            renderItem={renderPrediction}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}

      {showCurrentLocation && (
        <TouchableOpacity
          className="mt-2 p-2 bg-blue-50 rounded-lg items-center"
          onPress={() => {
            // This would integrate with device location
            Alert.alert('Current Location', 'Location service integration coming soon');
          }}
        >
          <Text className="text-blue-600 text-sm font-medium">📍 Use Current Location</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};