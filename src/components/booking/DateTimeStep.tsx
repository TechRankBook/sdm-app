import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { ServiceType } from '@/types';

interface DateTimeStepProps {
  serviceType: ServiceType;
  isRoundTrip: boolean;
  scheduledDate: Date | undefined;
  scheduledTime: string;
  returnDate: Date | undefined;
  returnTime: string;
  onScheduledDateChange: (date: Date | undefined) => void;
  onScheduledTimeChange: (time: string) => void;
  onReturnDateChange: (date: Date | undefined) => void;
  onReturnTimeChange: (time: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export const DateTimeStep: React.FC<DateTimeStepProps> = ({
  serviceType,
  isRoundTrip,
  scheduledDate,
  scheduledTime,
  returnDate,
  returnTime,
  onScheduledDateChange,
  onScheduledTimeChange,
  onReturnDateChange,
  onReturnTimeChange,
  onNext,
  onBack,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [activePicker, setActivePicker] = useState<'scheduled' | 'return'>('scheduled');

  // Generate time slots
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

  const timeSlots = generateTimeSlots();

  // Quick date options
  const quickDateOptions = [
    { label: 'Today', value: 0 },
    { label: 'Tomorrow', value: 1 },
    { label: 'Day After', value: 2 },
  ];

  const handleQuickDateSelect = (daysFromNow: number) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    if (activePicker === 'scheduled') {
      onScheduledDateChange(date);
    } else {
      onReturnDateChange(date);
    }
  };

  const handleTimeSelect = (time: string) => {
    if (activePicker === 'scheduled') {
      onScheduledTimeChange(time);
    } else {
      onReturnTimeChange(time);
    }
    setShowTimePicker(false);
  };

  const isFormValid = () => {
    const hasScheduledDateTime = scheduledDate && scheduledTime;
    const hasReturnDateTime = !isRoundTrip || (returnDate && returnTime);
    return hasScheduledDateTime && hasReturnDateTime;
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Select date';
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Schedule Your Ride</Text>
          <Text style={styles.subtitle}>Choose when you want to travel</Text>
        </View>

        {/* Scheduled Date & Time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pickup Date & Time</Text>

          {/* Quick Date Selection */}
          <View style={styles.quickDateContainer}>
            {quickDateOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.quickDateButton,
                  (activePicker === 'scheduled' && scheduledDate?.toDateString() === new Date(Date.now() + option.value * 24 * 60 * 60 * 1000).toDateString()) && styles.quickDateButtonActive
                ]}
                onPress={() => {
                  setActivePicker('scheduled');
                  handleQuickDateSelect(option.value);
                }}
              >
                <Text style={[
                  styles.quickDateText,
                  (activePicker === 'scheduled' && scheduledDate?.toDateString() === new Date(Date.now() + option.value * 24 * 60 * 60 * 1000).toDateString()) && styles.quickDateTextActive
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Date & Time Selection */}
          <View style={styles.dateTimeContainer}>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => {
                setActivePicker('scheduled');
                setShowDatePicker(true);
              }}
            >
              <Text style={styles.dateTimeLabel}>Date</Text>
              <Text style={styles.dateTimeValue}>
                {formatDate(scheduledDate)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => {
                setActivePicker('scheduled');
                setShowTimePicker(true);
              }}
            >
              <Text style={styles.dateTimeLabel}>Time</Text>
              <Text style={styles.dateTimeValue}>
                {scheduledTime || 'Select time'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Return Date & Time for Round Trip */}
        {isRoundTrip && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Return Date & Time</Text>

            {/* Quick Date Selection for Return */}
            <View style={styles.quickDateContainer}>
              {quickDateOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.quickDateButton,
                    (activePicker === 'return' && returnDate?.toDateString() === new Date(Date.now() + option.value * 24 * 60 * 60 * 1000).toDateString()) && styles.quickDateButtonActive
                  ]}
                  onPress={() => {
                    setActivePicker('return');
                    handleQuickDateSelect(option.value);
                  }}
                >
                  <Text style={[
                    styles.quickDateText,
                    (activePicker === 'return' && returnDate?.toDateString() === new Date(Date.now() + option.value * 24 * 60 * 60 * 1000).toDateString()) && styles.quickDateTextActive
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Return Date & Time Selection */}
            <View style={styles.dateTimeContainer}>
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => {
                  setActivePicker('return');
                  setShowDatePicker(true);
                }}
              >
                <Text style={styles.dateTimeLabel}>Return Date</Text>
                <Text style={styles.dateTimeValue}>
                  {formatDate(returnDate)}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => {
                  setActivePicker('return');
                  setShowTimePicker(true);
                }}
              >
                <Text style={styles.dateTimeLabel}>Return Time</Text>
                <Text style={styles.dateTimeValue}>
                  {returnTime || 'Select time'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Date Picker Modal */}
        {showDatePicker && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                Select {activePicker === 'scheduled' ? 'Pickup' : 'Return'} Date
              </Text>

              {/* Simple date selection - in real app, use proper date picker */}
              <View style={styles.dateGrid}>
                {Array.from({ length: 30 }, (_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() + i);
                  const isSelected = activePicker === 'scheduled'
                    ? scheduledDate?.toDateString() === date.toDateString()
                    : returnDate?.toDateString() === date.toDateString();

                  return (
                    <TouchableOpacity
                      key={i}
                      style={[styles.dateButton, isSelected && styles.dateButtonActive]}
                      onPress={() => {
                        if (activePicker === 'scheduled') {
                          onScheduledDateChange(date);
                        } else {
                          onReturnDateChange(date);
                        }
                        setShowDatePicker(false);
                      }}
                    >
                      <Text style={[styles.dateText, isSelected && styles.dateTextActive]}>
                        {date.getDate()}
                      </Text>
                      <Text style={[styles.dayText, isSelected && styles.dayTextActive]}>
                        {date.toLocaleDateString('en-IN', { weekday: 'short' })}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Time Picker Modal */}
        {showTimePicker && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                Select {activePicker === 'scheduled' ? 'Pickup' : 'Return'} Time
              </Text>

              <ScrollView style={styles.timeScrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.timeGrid}>
                  {timeSlots.map((time) => {
                    const isSelected = activePicker === 'scheduled'
                      ? scheduledTime === time
                      : returnTime === time;

                    return (
                      <TouchableOpacity
                        key={time}
                        style={[styles.timeButton, isSelected && styles.timeButtonActive]}
                        onPress={() => handleTimeSelect(time)}
                      >
                        <Text style={[styles.timeText, isSelected && styles.timeTextActive]}>
                          {time}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>

              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowTimePicker(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
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
    padding: 16,
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
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  quickDateContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  quickDateButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  quickDateButtonActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  quickDateText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
  },
  quickDateTextActive: {
    color: '#2563eb',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: 12,
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
    marginBottom: 4,
  },
  dateTimeValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  dateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  dateButton: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateButtonActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  dateTextActive: {
    color: '#2563eb',
  },
  dayText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  dayTextActive: {
    color: '#2563eb',
  },
  timeScrollView: {
    maxHeight: 300,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeButton: {
    width: 80,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  timeButtonActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
  },
  timeTextActive: {
    color: '#2563eb',
  },
  modalCancelButton: {
    backgroundColor: '#e2e8f0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
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