import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { VehicleType } from '@/types';

interface VehiclePassengerStepProps {
  passengers: number;
  vehicleType: VehicleType;
  onPassengersChange: (count: number) => void;
  onVehicleTypeChange: (type: VehicleType) => void;
  onNext: () => void;
  onBack: () => void;
}

export const VehiclePassengerStep: React.FC<VehiclePassengerStepProps> = ({
  passengers,
  vehicleType,
  onPassengersChange,
  onVehicleTypeChange,
  onNext,
  onBack,
}) => {
  const [showPassengerModal, setShowPassengerModal] = useState(false);

  // Vehicle type options
  const vehicleTypes = [
    {
      type: 'sedan' as VehicleType,
      label: 'Sedan',
      capacity: '4 passengers',
      icon: 'directions-car',
      iconType: 'MaterialIcons',
      description: 'Comfortable for city rides',
      features: ['AC', 'Music System', 'GPS'],
    },
    {
      type: 'suv' as VehicleType,
      label: 'SUV',
      capacity: '6 passengers',
      icon: 'airport-shuttle',
      iconType: 'MaterialIcons',
      description: 'Spacious for families',
      features: ['AC', 'Extra Space', 'GPS'],
    },
    {
      type: 'premium' as VehicleType,
      label: 'Premium',
      capacity: '4 passengers',
      icon: 'local-taxi',
      iconType: 'MaterialIcons',
      description: 'Luxury experience',
      features: ['AC', 'Leather Seats', 'Music System', 'GPS'],
    },
  ];

  const handlePassengerSelect = (count: number) => {
    onPassengersChange(count);
    setShowPassengerModal(false);
  };

  const isFormValid = () => {
    return passengers > 0 && vehicleType;
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Vehicle</Text>
          <Text style={styles.subtitle}>Select vehicle type and passenger count</Text>
        </View>

        {/* Passenger Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Number of Passengers</Text>
          <TouchableOpacity
            style={styles.passengerButton}
            onPress={() => setShowPassengerModal(true)}
          >
            <View style={styles.passengerContent}>
              <MaterialIcons name="people" size={24} color="#64748b" />
              <View style={styles.passengerInfo}>
                <Text style={styles.passengerLabel}>Passengers</Text>
                <Text style={styles.passengerValue}>
                  {passengers} Guest{passengers !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>
            <Text style={styles.passengerArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Vehicle Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle Type</Text>
          <View style={styles.vehicleGrid}>
            {vehicleTypes.map((vehicle) => (
              <TouchableOpacity
                key={vehicle.type}
                style={[
                  styles.vehicleCard,
                  vehicleType === vehicle.type && styles.vehicleCardActive,
                ]}
                onPress={() => onVehicleTypeChange(vehicle.type)}
              >
                <View style={styles.vehicleHeader}>
                  <View style={styles.vehicleIconContainer}>
                    <MaterialIcons name={vehicle.icon as any} size={24} color="#64748b" />
                  </View>
                  {vehicleType === vehicle.type && (
                    <View style={styles.checkmark}>
                      <MaterialIcons name="check" size={16} color="#ffffff" />
                    </View>
                  )}
                </View>

                <View style={styles.vehicleContent}>
                  <Text style={[
                    styles.vehicleName,
                    vehicleType === vehicle.type && styles.vehicleNameActive,
                  ]}>
                    {vehicle.label}
                  </Text>
                  <Text style={[
                    styles.vehicleCapacity,
                    vehicleType === vehicle.type && styles.vehicleCapacityActive,
                  ]}>
                    {vehicle.capacity}
                  </Text>
                  <Text style={[
                    styles.vehicleDescription,
                    vehicleType === vehicle.type && styles.vehicleDescriptionActive,
                  ]}>
                    {vehicle.description}
                  </Text>

                  {/* Features */}
                  <View style={styles.featuresContainer}>
                    {vehicle.features.map((feature, index) => (
                      <View key={index} style={styles.featureBadge}>
                        <Text style={styles.featureText}>{feature}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Vehicle Comparison */}
        {vehicleType && (
          <View style={styles.comparisonSection}>
            <Text style={styles.comparisonTitle}>Why Choose This Vehicle?</Text>
            <View style={styles.comparisonCard}>
              {vehicleTypes
                .find(v => v.type === vehicleType)
                ?.features.map((feature, index) => (
                <View key={index} style={styles.comparisonItem}>
                  <Text style={styles.comparisonBullet}>•</Text>
                  <Text style={styles.comparisonText}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Passenger Modal */}
      <Modal visible={showPassengerModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Passengers</Text>

            <View style={styles.passengerGrid}>
              {[1, 2, 3, 4, 5, 6].map((count) => (
                <TouchableOpacity
                  key={count}
                  style={[
                    styles.passengerOption,
                    passengers === count && styles.passengerOptionActive,
                  ]}
                  onPress={() => handlePassengerSelect(count)}
                >
                  <Text style={[
                    styles.passengerOptionText,
                    passengers === count && styles.passengerOptionTextActive,
                  ]}>
                    {count}
                  </Text>
                  <Text style={[
                    styles.passengerOptionLabel,
                    passengers === count && styles.passengerOptionLabelActive,
                  ]}>
                    {count === 1 ? 'Guest' : 'Guests'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowPassengerModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
    padding: 12,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  passengerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  passengerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passengerIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  passengerInfo: {
    flex: 1,
  },
  passengerLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  passengerValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  passengerArrow: {
    fontSize: 18,
    color: '#64748b',
  },
  vehicleGrid: {
    gap: 12,
  },
  vehicleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
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
  vehicleCardActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  vehicleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleContent: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  vehicleNameActive: {
    color: '#2563eb',
  },
  vehicleCapacity: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 6,
  },
  vehicleCapacityActive: {
    color: '#475569',
  },
  vehicleDescription: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
  },
  vehicleDescriptionActive: {
    color: '#475569',
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  featureText: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '500',
  },
  comparisonSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  comparisonTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  comparisonCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  comparisonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  comparisonBullet: {
    fontSize: 16,
    color: '#2563eb',
    marginRight: 8,
  },
  comparisonText: {
    fontSize: 14,
    color: '#475569',
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
    marginBottom: 20,
    textAlign: 'center',
  },
  passengerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  passengerOption: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  passengerOptionActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  passengerOptionText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  passengerOptionTextActive: {
    color: '#2563eb',
  },
  passengerOptionLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  passengerOptionLabelActive: {
    color: '#2563eb',
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
  footer: {
    padding: 12,
    paddingBottom: 24,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  backButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  nextButton: {
    flex: 2,
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
});