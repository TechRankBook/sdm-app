import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { ServiceType } from '@/types';

interface ServiceTypeStepProps {
  serviceType: ServiceType;
  onServiceTypeChange: (serviceType: ServiceType) => void;
  onNext: () => void;
}

export const ServiceTypeStep: React.FC<ServiceTypeStepProps> = ({
  serviceType,
  onServiceTypeChange,
  onNext,
}) => {
  const serviceTypes = [
    { id: 'city' as ServiceType, name: 'City Ride', icon: 'location-city', iconType: 'MaterialIcons', description: 'Local city transportation' },
    { id: 'outstation' as ServiceType, name: 'Outstation', icon: 'directions-car', iconType: 'MaterialIcons', description: 'Inter-city travel' },
    { id: 'airport' as ServiceType, name: 'Airport Taxi', icon: 'flight', iconType: 'MaterialIcons', description: 'Airport transfers' },
    { id: 'hourly' as ServiceType, name: 'Hourly Rentals', icon: 'schedule', iconType: 'MaterialIcons', description: 'Hourly vehicle rental' },
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
              <Text style={[
                styles.serviceDescription,
                serviceType === service.id && styles.serviceDescriptionActive,
              ]}>
                {service.description}
              </Text>
            </View>
            {serviceType === service.id && (
              <View style={styles.checkmark}>
                <MaterialIcons name="check" size={16} color="#ffffff" />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

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
    padding: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#78350f',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#92400e',
    textAlign: 'center',
  },
  serviceGrid: {
    padding: 16,
    gap: 12,
  },
  serviceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
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
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  serviceIcon: {
    fontSize: 24,
  },
  serviceContent: {
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#78350f',
    marginBottom: 4,
  },
  serviceNameActive: {
    color: '#b45309',
  },
  serviceDescription: {
    fontSize: 14,
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
    padding: 16,
    paddingBottom: 32,
  },
  nextButton: {
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