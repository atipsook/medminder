import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import HeaderStats from '../components/HeaderStats';
import HomePage from './HomePage';
import Placeholder from '../components/Placeholder';

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
  todayProgress: string;
  activeMedicationsCount: number;
  nextDose: {
    time: string;
    name: string;
  } | null;
  markAsTaken: (medicineId: string, scheduledTime: Date) => void;
  isTaken: (medicineId: string, scheduledTime: Date) => boolean;
}

const HomeScreen: React.FC<Props> = ({ 
  upcomingMedicines, 
  styles, 
  setCurrentScreen, 
  todayProgress, 
  activeMedicationsCount, 
  nextDose,
  markAsTaken,
  isTaken 
}) => {
  return (
    <View style={styles.container}>
      <HeaderStats
        todayProgress={todayProgress}
        activeMedicationsCount={activeMedicationsCount}
        nextDose={nextDose}
      />
      <HomePage
        upcomingMedicines={upcomingMedicines}
        styles={styles}
        setCurrentScreen={setCurrentScreen}
        markAsTaken={markAsTaken}
        isTaken={isTaken}
      />
      <Placeholder/>
    </View>
   
  );
};

export default HomeScreen;