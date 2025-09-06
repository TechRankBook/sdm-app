import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { ServiceType } from '@/types';

interface ServiceTypeStepProps {
  serviceType: ServiceType;
  tripType: 'oneway' | 'roundtrip' | 'pickup' | 'drop';
  isRoundTrip: boolean;
  onServiceTypeChange: (serviceType: ServiceType) => void;
  onTripTypeChange: (tripType: 'oneway' | 'roundtrip' | 'pickup' | 'drop') => void;
  onRoundTripChange: (isRoundTrip: boolean) => void;
  onNext: () => void;
}

export const ServiceTypeStep: React.FC<ServiceTypeStepProps> = ({
  serviceType,
  tripType,
  isRoundTrip,
  onServiceTypeChange,
  onTripTypeChange,
  onRoundTripChange,
  onNext,
}) => {
  const serviceTypes = [
    { id: 'city' as ServiceType, name: 'City Ride', icon: 'location-city', iconType: 'MaterialIcons', description: 'Local city transportation' },
    { id: 'outstation' as ServiceType, name: 'Outstation', icon: 'directions-car', iconType: 'MaterialIcons', description: 'Inter-city travel' },
    { id: 'airport' as ServiceType, name: 'Airport Taxi', icon: 'flight', iconType: 'MaterialIcons', description: 'Airport transfers' },
    { id: 'hourly' as ServiceType, name: 'Car Rentals', icon: 'schedule', iconType: 'MaterialIcons', description: 'Hourly vehicle rental' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Your Service</Text>
        <Text style={styles.subtitle}>Select the type of ride you need</Text>
      </View>
     
      <View style={styles.serviceGrid}>
        {serviceTypes.map((service) => (
          <TouchableOpacity
            key={service.id}
            style={[
              styles.serviceCard,
              serviceType === service.id && styles.serviceCardActive,
            ]}
            onPress={() => onServiceTypeChange(service.id)}
          >
            <View style={styles.serviceIconContainer}>
              {service.iconType === 'MaterialIcons' ? (
                <MaterialIcons name={service.icon as any} size={24} color="#f59e0b" />
              ) : (
                <Ionicons name={service.icon as any} size={24} color="#f59e0b" />
              )}
            </View>
            <View style={styles.serviceContent}>
              <Text style={[
                styles.serviceName,
                serviceType === service.id && styles.serviceNameActive,
              ]}>
                {service.name}
              </Text>
              {/* <Text style={[
                styles.serviceDescription,
                serviceType === service.id && styles.serviceDescriptionActive,
              ]}>
                {service.description}
              </Text> */}
            </View>
            {/* {serviceType === service.id && (
              <View style={styles.checkmark}>
                <MaterialIcons name="check" size={16} color="#ffffff" />
              </View>
            )} */}
          </TouchableOpacity>
        ))}
        
      </View>

      {/* Trip Type Selection */}
      {(serviceType === 'outstation' || serviceType === 'airport') && (
        <View style={styles.tripTypeSection}>
          <Text style={styles.tripTypeLabel}>Trip Type</Text>
          <View style={styles.tripTypeContainer}>
            {serviceType === 'outstation' ? (
              <>
                <TouchableOpacity
                  style={[
                    styles.tripTypeButton,
                    tripType === 'oneway' && styles.tripTypeButtonActive,
                  ]}
                  onPress={() => {
                    onTripTypeChange('oneway');
                    onRoundTripChange(false);
                  }}
                >
                  <Text style={[
                    styles.tripTypeButtonText,
                    tripType === 'oneway' && styles.tripTypeButtonTextActive,
                  ]}>
                    One Way
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.tripTypeButton,
                    tripType === 'roundtrip' && styles.tripTypeButtonActive,
                  ]}
                  onPress={() => {
                    onTripTypeChange('roundtrip');
                    onRoundTripChange(true);
                  }}
                >
                  <Text style={[
                    styles.tripTypeButtonText,
                    tripType === 'roundtrip' && styles.tripTypeButtonTextActive,
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
                    tripType === 'pickup' && styles.tripTypeButtonActive,
                  ]}
                  onPress={() => {
                    onTripTypeChange('pickup');
                    onRoundTripChange(false);
                  }}
                >
                  <Text style={[
                    styles.tripTypeButtonText,
                    tripType === 'pickup' && styles.tripTypeButtonTextActive,
                  ]}>
                    Pick-up From Airport
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.tripTypeButton,
                    tripType === 'drop' && styles.tripTypeButtonActive,
                  ]}
                  onPress={() => {
                    onTripTypeChange('drop');
                    onRoundTripChange(false);
                  }}
                >
                  <Text style={[
                    styles.tripTypeButtonText,
                    tripType === 'drop' && styles.tripTypeButtonTextActive,
                  ]}>
                    Drop To Airport
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Round Trip Checkbox for Airport */}
          {serviceType === 'airport' && (
            <View style={styles.roundTripContainer}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => onRoundTripChange(!isRoundTrip)}
              >
                <View style={[
                  styles.checkbox,
                  isRoundTrip && styles.checkboxChecked,
                ]}>
                  {isRoundTrip && (
                    <MaterialIcons name="check" size={14} color="#ffffff" />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>Round Trip</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextButton, !serviceType && styles.nextButtonDisabled]}
          onPress={onNext}
          disabled={!serviceType}
        >
          <Text style={[
            styles.nextButtonText,
            !serviceType && styles.nextButtonTextDisabled,
          ]}>
            Continue
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffbeb',
  },
  header: {
    padding: 12,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#78350f',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#92400e',
    textAlign: 'center',
  },
  serviceGrid: {
    padding: 2,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  serviceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'column',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  serviceCardActive: {
    borderColor: '#f59e0b',
    backgroundColor: '#fef3c7',
  },
  serviceIconContainer: {
    width:36,
    height: 36,
    borderRadius: 24,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  serviceIcon: {
    fontSize: 20,
  },
  serviceContent: {
    flex: 1,
  },
  serviceName: {
    fontSize: 12,
    fontWeight: '400',
    color: '#78350f',
    marginBottom: 1,
  },
  serviceNameActive: {
    color: '#b45309',
  },
  serviceDescription: {
    fontSize: 12,
    color: '#92400e',
  },
  serviceDescriptionActive: {
    color: '#78350f',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f59e0b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    padding: 12,
    paddingBottom: 24,
  },
  nextButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  nextButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  nextButtonTextDisabled: {
    color: '#64748b',
  },
  tripTypeSection: {
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  tripTypeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  tripTypeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tripTypeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  tripTypeButtonActive: {
    backgroundColor: '#f59e0b',
    borderColor: '#f59e0b',
  },
  tripTypeButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
  },
  tripTypeButtonTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  roundTripContainer: {
    marginTop: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 3,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#f59e0b',
    borderColor: '#f59e0b',
  },
  checkboxLabel: {
    fontSize: 12,
    color: '#64748b',
  },
});