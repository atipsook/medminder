import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import StatsCard from './StatsCard';

interface Props {
  todayProgress: string;
  activeMedicationsCount: number;
  nextDose: {
    time: string;
    name: string;
  } | null;
}

export default function HeaderStats({ todayProgress, activeMedicationsCount, nextDose }: Props) {
  const nextDoseValue = nextDose ? nextDose.time : 'N/A';
  const nextDoseSubtitle = nextDose ? nextDose.name : 'No upcoming dose';
  
  // Hardcoded for now as streak logic is not implemented


  return (
    <View style={styles.container}>
      
      <View style={styles.row}>
        <View style={styles.statCard}>
          <StatsCard
            title="Active Medications"
            value={activeMedicationsCount.toString()}
            subtitle="prescriptions"
            color="#FF9800"
          />
        </View>
        <View style={styles.statCard}>
          <StatsCard
            title="Next Dose"
            value={nextDoseValue}
            subtitle={nextDoseSubtitle}
            color="#9C27B0"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    
  },
  statCard: {
    width: '48%', // Ensures two cards fit side-by-side with some space
  },
});
