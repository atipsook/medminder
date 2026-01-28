import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

interface Medicine {
  id: string;
  name: string;
  dosage: string;
  times: string[];
  days: string[];
  startDate: string;
  endDate?: string;
  notes?: string;
}

interface UpcomingMedicine {
  medicine: Medicine;
  nextTime: string;
  timeUntil: string;
  scheduledTime: Date;
}

interface Props {
  upcomingMedicines: UpcomingMedicine[];
  styles: StyleSheet.NamedStyles<any>;
  setCurrentScreen: (screen: 'home' | 'add' | 'all') => void;
  markAsTaken: (medicineId: string, scheduledTime: Date) => void;
  isTaken: (medicineId: string, scheduledTime: Date) => boolean;
}

const HomePage: React.FC<Props> = ({ 
  upcomingMedicines, 
  styles, 
  setCurrentScreen, 
  markAsTaken,
  isTaken 
}) => {
  // Sort medicines: untaken first, then taken
  const sortedMedicines = [...upcomingMedicines].sort((a, b) => {
    const aTaken = isTaken(a.medicine.id, a.scheduledTime);
    const bTaken = isTaken(b.medicine.id, b.scheduledTime);
    
    if (aTaken === bTaken) return 0;
    return aTaken ? 1 : -1;
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Medicine Reminders</Text>
      <Text style={styles.subtitle}>Next 24 Hours</Text>
     
      {upcomingMedicines.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No medicines scheduled for the next 24 hours</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setCurrentScreen('add')}
          >
            <Text style={styles.addButtonText}>Add Medicine</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.medicineList}>
          {sortedMedicines.map((item, index) => {
            const taken = isTaken(item.medicine.id, item.scheduledTime);
            return (
              <TouchableOpacity 
                key={`${item.medicine.id}-${index}`}
                onPress={() => markAsTaken(item.medicine.id, item.scheduledTime)}
                activeOpacity={0.7}
              >
                <View style={[styles.medicineCard, taken && styles.takenCard]}>
                  <View style={styles.medicineHeader}>
                    <View style={styles.nameCheckboxContainer}>
                      <View style={[styles.checkbox, taken && styles.checkboxChecked]}>
                        {taken && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                      <Text style={[styles.medicineName, taken && styles.takenText]}>
                        {item.medicine.name}
                      </Text>
                    </View>
                    <Text style={[styles.timeUntil, taken && styles.takenBadge]}>
                      {item.timeUntil}
                    </Text>
                  </View>
                  <Text style={[styles.dosage, taken && styles.takenText]}>
                    {item.medicine.dosage}
                  </Text>
                  <Text style={[styles.time, taken && styles.takenText]}>
                    {item.nextTime}
                  </Text>
                  {item.medicine.notes && (
                    <Text style={[styles.notes, taken && styles.takenText]}>
                      {item.medicine.notes}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

export default HomePage;