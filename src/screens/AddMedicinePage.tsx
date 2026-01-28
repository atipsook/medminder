import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';

interface Props {
  medicineName: string;
  setMedicineName: (name: string) => void;
  dosage: string;
  setDosage: (dosage: string) => void;
  selectedTimes: string[];
  setSelectedTimes: (times: string[]) => void;
  newTime: string;
  setNewTime: (time: string) => void;
  selectedDays: string[];
  setSelectedDays: (days: string[]) => void;
  notes: string;
  setNotes: (notes: string) => void;
  daysOfWeek: string[];
  styles: StyleSheet.NamedStyles<any>;
  addMedicine: () => void;
  addTime: () => void;
  removeTime: (time: string) => void;
  toggleDay: (day: string) => void;
}

const AddMedicinePage: React.FC<Props> = ({
  medicineName, setMedicineName, dosage, setDosage, selectedTimes, newTime, setNewTime,
  selectedDays, notes, setNotes, daysOfWeek, styles, addMedicine, addTime, removeTime,
  toggleDay,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Medicine</Text>
      
      <ScrollView style={styles.form}>
        <Text style={styles.label}>Medicine Name *</Text>
        <TextInput
          style={styles.input}
          value={medicineName}
          onChangeText={setMedicineName}
          placeholder="Enter medicine name"
        />

        <Text style={styles.label}>Dosage *</Text>
        <TextInput
          style={styles.input}
          value={dosage}
          onChangeText={setDosage}
          placeholder="e.g., 1 tablet, 5ml, etc."
        />

        <Text style={styles.label}>Times *</Text>
        <View style={styles.timeInputContainer}>
          <TextInput
            style={[styles.input, styles.timeInput]}
            value={newTime}
            onChangeText={setNewTime}
            placeholder="HH:MM (24-hour format)"
          />
          <TouchableOpacity style={styles.addTimeButton} onPress={addTime}>
            <Text style={styles.addTimeButtonText}>Add</Text>
          </TouchableOpacity>
        </View>

        {selectedTimes.length > 0 && (
          <View style={styles.timesList}>
            {selectedTimes.map((time, index) => (
              <View key={index} style={styles.timeChip}>
                <Text style={styles.timeChipText}>{time}</Text>
                <TouchableOpacity onPress={() => removeTime(time)}>
                  <Text style={styles.removeTime}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.label}>Days *</Text>
        <View style={styles.daysContainer}>
          {daysOfWeek.map((day) => (
            <TouchableOpacity
              key={day}
              style={[
                styles.dayButton,
                selectedDays.includes(day) && styles.selectedDayButton
              ]}
              onPress={() => toggleDay(day)}
            >
              <Text style={[
                styles.dayButtonText,
                selectedDays.includes(day) && styles.selectedDayText
              ]}>
                {day.substring(0, 3)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Notes (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Additional notes..."
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity style={styles.saveButton} onPress={addMedicine}>
          <Text style={styles.saveButtonText}>Save Medicine</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default AddMedicinePage;
