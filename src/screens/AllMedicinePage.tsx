import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

interface Props {
  medicines: Medicine[];
  styles: StyleSheet.NamedStyles<any>;
  deleteMedicine: (id: string) => void;
  currentScreen: 'home' | 'add' | 'all';
  setCurrentScreen: (screen: 'home' | 'add' | 'all') => void;
  
}

const AllMedicinesPage: React.FC<Props> = ({ medicines, styles, deleteMedicine,currentScreen, setCurrentScreen }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>All Medicines</Text>
      
      {medicines.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No medicines added yet</Text>
        </View>
      ) : (
        <ScrollView style={styles.medicineList}>
          {medicines.map((medicine) => (
            <View key={medicine.id} style={styles.medicineCard}>
              <View style={styles.medicineHeader}>
                <Text style={styles.medicineName}>{medicine.name}</Text>
                <TouchableOpacity
                  onPress={() => deleteMedicine(medicine.id)}
                  style={styles.deleteButton}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.dosage}>{medicine.dosage}</Text>
              <Text style={styles.times}>
                Times: {medicine.times.join(', ')}
              </Text>
              <Text style={styles.days}>
                Days: {medicine.days.join(', ')}
              </Text>
              {medicine.notes && (
                <Text style={styles.notes}>{medicine.notes}</Text>
              )}
            </View>
          ))}
        </ScrollView>
      )}
     
    </View>
  );
};

export default AllMedicinesPage;

