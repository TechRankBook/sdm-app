import { useMemo } from 'react';
import { ServiceType, VehicleType } from '@/types';
import { FARE_CONFIG } from '@/constants';

interface FareCalculationParams {
  serviceType: ServiceType;
  vehicleType: VehicleType;
  distanceKm: number;
  durationMinutes: number;
  scheduledDateTime?: string;
  currentTime?: Date;
}

interface FareData {
  baseFare: number;
  distanceFare: number;
  timeFare: number;
  surgeMultiplier: number;
  totalFare: number;
  estimatedDuration: number;
  estimatedDistance: number;
  surgeReason?: string;
}

export const useFareCalculation = ({
  serviceType,
  vehicleType,
  distanceKm,
  durationMinutes,
  scheduledDateTime,
  currentTime = new Date(),
}: FareCalculationParams): FareData | null => {
  return useMemo(() => {
    if (!distanceKm || !durationMinutes) return null;

    // Get base rates from config
    const baseFare = FARE_CONFIG.BASE_FARE[serviceType] || 50;
    const perKmRate = FARE_CONFIG.PER_KM_RATE[serviceType] || 12;
    const perMinuteRate = FARE_CONFIG.PER_MINUTE_RATE[serviceType] || 2;

    // Calculate fares
    const distanceFare = distanceKm * perKmRate;
    const timeFare = durationMinutes * perMinuteRate;

    // Apply vehicle type multiplier
    let vehicleMultiplier = 1;
    switch (vehicleType) {
      case 'suv':
        vehicleMultiplier = 1.3;
        break;
      case 'premium':
        vehicleMultiplier = 1.8;
        break;
      case 'sedan':
      default:
        vehicleMultiplier = 1;
        break;
    }

    // Calculate surge multiplier based on time and demand
    let surgeMultiplier = 1.0;
    let surgeReason = '';

    // Time-based surge pricing
    const hour = currentTime.getHours();
    const day = currentTime.getDay();

    // Peak hours (7-9 AM, 5-7 PM on weekdays)
    if (day >= 1 && day <= 5) { // Monday to Friday
      if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
        surgeMultiplier = 1.5;
        surgeReason = 'Peak hours';
      }
    }

    // Weekend surge (Friday 8 PM to Sunday 10 PM)
    if (day === 5 && hour >= 20) { // Friday evening
      surgeMultiplier = 1.3;
      surgeReason = 'Weekend start';
    } else if (day === 6 || (day === 0 && hour <= 22)) { // Saturday or Sunday before 10 PM
      surgeMultiplier = 1.4;
      surgeReason = 'Weekend';
    }

    // Special events surge (can be enhanced with real event data)
    // For now, using simplified logic
    if (serviceType === 'airport') {
      // Airport services have slight surge during peak travel times
      if ((hour >= 4 && hour <= 7) || (hour >= 18 && hour <= 21)) {
        surgeMultiplier = Math.max(surgeMultiplier, 1.2);
        surgeReason = surgeReason ? `${surgeReason} + Airport peak` : 'Airport peak';
      }
    }

    // Distance-based surge for very short rides (under 2km)
    if (distanceKm < 2) {
      surgeMultiplier *= 1.1;
      surgeReason = surgeReason ? `${surgeReason} + Short trip` : 'Short trip';
    }

    // Long distance surge for rides over 50km
    if (distanceKm > 50) {
      surgeMultiplier *= 1.2;
      surgeReason = surgeReason ? `${surgeReason} + Long distance` : 'Long distance';
    }

    // Scheduled booking discount (opposite of surge)
    if (scheduledDateTime) {
      const scheduledTime = new Date(scheduledDateTime);
      const hoursDifference = (scheduledTime.getTime() - currentTime.getTime()) / (1000 * 60 * 60);

      if (hoursDifference > 24) { // Booked more than 24 hours in advance
        surgeMultiplier *= 0.9;
        surgeReason = surgeReason ? `${surgeReason} + Advance booking discount` : 'Advance booking discount';
      } else if (hoursDifference > 4) { // Booked more than 4 hours in advance
        surgeMultiplier *= 0.95;
        surgeReason = surgeReason ? `${surgeReason} + Early booking discount` : 'Early booking discount';
      }
    }

    // Calculate total with surge
    const subtotal = (baseFare + distanceFare + timeFare) * vehicleMultiplier;
    const totalFare = Math.max(subtotal * surgeMultiplier, FARE_CONFIG.MINIMUM_FARE);

    // Cap at maximum fare
    const finalFare = Math.min(totalFare, FARE_CONFIG.MAXIMUM_FARE);

    return {
      baseFare: Math.round(baseFare * vehicleMultiplier),
      distanceFare: Math.round(distanceFare * vehicleMultiplier),
      timeFare: Math.round(timeFare * vehicleMultiplier),
      surgeMultiplier: Math.round(surgeMultiplier * 100) / 100, // Round to 2 decimal places
      totalFare: Math.round(finalFare),
      estimatedDuration: durationMinutes,
      estimatedDistance: distanceKm,
      surgeReason: surgeReason || undefined,
    };
  }, [serviceType, vehicleType, distanceKm, durationMinutes, scheduledDateTime, currentTime]);
};