import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
    Modal,
    StyleSheet,
    TouchableOpacity,
    useColorScheme,
    View,
} from 'react-native';
import { formatReminderTime } from '../utils/notifications';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { IconSymbol } from './ui/icon-symbol';

interface ReminderPickerProps {
  reminder: Date | null;
  onReminderChange: (date: Date | null) => void;
}

export function ReminderPicker({ reminder, onReminderChange }: ReminderPickerProps) {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const [tempDate, setTempDate] = useState(reminder || new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);

  const handleDateChange = (date: Date) => {
    setTempDate(date);
    setShowDatePicker(false);
    setShowTimePicker(true);
  };

  const handleTimeChange = (date: Date) => {
    setTempDate(date);
    setShowTimePicker(false);
  };

  const handleSaveReminder = () => {
    onReminderChange(tempDate);
    setShowReminderModal(false);
  };

  const handleClearReminder = () => {
    onReminderChange(null);
    setShowReminderModal(false);
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.reminderButton, { backgroundColor: isDarkMode ? '#1F1F1F' : '#f0f0f0' }]}
        onPress={() => {
          setTempDate(reminder || new Date());
          setShowReminderModal(true);
        }}
      >
        <IconSymbol name="bell" size={20} color={isDarkMode ? '#ECEDEE' : '#11181C'} />
        <ThemedText style={styles.reminderButtonText}>
          {reminder ? formatReminderTime(reminder) : 'Set Reminder'}
        </ThemedText>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showReminderModal}
        onRequestClose={() => setShowReminderModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.reminderModal}>
            <ThemedText type="title" style={styles.reminderModalTitle}>
              Set Reminder
            </ThemedText>

            <View style={styles.reminderContent}>
              <TouchableOpacity
                style={[styles.dateTimeButton, { backgroundColor: isDarkMode ? '#1F1F1F' : '#f0f0f0' }]}
                onPress={() => setShowDatePicker(true)}
              >
                <IconSymbol name="calendar" size={18} color={isDarkMode ? '#ECEDEE' : '#11181C'} />
                <ThemedText style={styles.dateTimeText}>
                  {tempDate.toLocaleDateString()}
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.dateTimeButton, { backgroundColor: isDarkMode ? '#1F1F1F' : '#f0f0f0' }]}
                onPress={() => setShowTimePicker(true)}
              >
                <IconSymbol name="clock" size={18} color={isDarkMode ? '#ECEDEE' : '#11181C'} />
                <ThemedText style={styles.dateTimeText}>
                  {tempDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                </ThemedText>
              </TouchableOpacity>

              <View style={styles.previewBox}>
                <ThemedText style={styles.previewLabel}>Reminder Preview:</ThemedText>
                <ThemedText style={styles.previewText}>{formatReminderTime(tempDate)}</ThemedText>
              </View>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={(event, date) => {
                  if (date) handleDateChange(date);
                }}
              />
            )}

            {showTimePicker && (
              <DateTimePicker
                value={tempDate}
                mode="time"
                display="spinner"
                onChange={(event, date) => {
                  if (date) handleTimeChange(date);
                }}
              />
            )}

            <View style={styles.reminderModalButtons}>
              <TouchableOpacity
                style={[styles.reminderModalButton, { backgroundColor: '#50C878' }]}
                onPress={handleSaveReminder}
              >
                <ThemedText style={styles.reminderModalButtonText}>Save Reminder</ThemedText>
              </TouchableOpacity>

              {reminder && (
                <TouchableOpacity
                  style={[styles.reminderModalButton, { backgroundColor: '#FF6B6B' }]}
                  onPress={handleClearReminder}
                >
                  <ThemedText style={styles.reminderModalButtonText}>Clear Reminder</ThemedText>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.reminderModalButton, { backgroundColor: '#999' }]}
                onPress={() => setShowReminderModal(false)}
              >
                <ThemedText style={styles.reminderModalButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  reminderButton: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  reminderButtonText: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  reminderModal: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  reminderModalTitle: {
    marginBottom: 20,
    textAlign: 'center',
  },
  reminderContent: {
    gap: 12,
    marginBottom: 20,
  },
  dateTimeButton: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dateTimeText: {
    flex: 1,
  },
  previewBox: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    borderWidth: 1,
    borderColor: '#4A90E2',
    marginTop: 8,
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  previewText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90E2',
  },
  reminderModalButtons: {
    gap: 10,
  },
  reminderModalButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  reminderModalButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
});
