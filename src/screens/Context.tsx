import React, { useState, useEffect, useRef } from 'react';
import {View, Text,StyleSheet, TouchableOpacity, Alert, Platform,} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import HomeScreen from './homeScreen';
import AddMedicinePage from './AddMedicinePage';
import AllMedicinesPage from './AllMedicinePage';
import Navigation from './Navigation';


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,  
    shouldShowBanner: true, 
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

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

interface DosesTaken {
  id: string;
  time: string;
  takenAt: number;
}

const Context: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [upcomingMedicines, setUpcomingMedicines] = useState<UpcomingMedicine[]>([]);
  const [takenDoses, setTakenDoses] = useState<DosesTaken[]>([]);
  const [currentScreen, setCurrentScreen] = useState<'home' | 'add' | 'all'>('home');

  const [medicineName, setMedicineName] = useState('');
  const [dosage, setDosage] = useState('');
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [newTime, setNewTime] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const responseListener = useRef<any>();

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    loadData();
    registerForPushNotificationsAsync();

    
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notification tapped:', response);
      setCurrentScreen('home');
    });

    return () => {
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (medicines.length > 0) {
      calculateUpcomingMedicines();
      scheduleAllNotifications();
    } else {
      Notifications.cancelAllScheduledNotificationsAsync();
    }
  }, [medicines]);

  useEffect(() => {
    if (medicines.length > 0) {
      calculateUpcomingMedicines();
    }
  }, [takenDoses]);

  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      cleanupOldDoses();
    }, 60000);

    return () => clearInterval(cleanupInterval);
  }, [takenDoses]);

  useEffect(() => {
    const timerInterval = setInterval(() => {
      if (medicines.length > 0) {
        calculateUpcomingMedicines();
      }
    }, 60000);

    return () => clearInterval(timerInterval);
  }, [medicines, takenDoses]);

  const registerForPushNotificationsAsync = async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please enable notifications in your device settings to receive medicine reminders.'
        );
        return;
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('medicine-reminders', {
          name: 'Medicine Reminders',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF0000',
          sound: 'default',
          enableVibrate: true,
          showBadge: true,
          enableLights: true,
        });
      }

      console.log(' Notification permissions granted');
    } catch (error) {
      console.error(' Error requesting notification permissions:', error);
    }
  };

const scheduleAllNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    const now = new Date();
    
    for (const medicine of medicines) {
      if (!medicine.times || !medicine.days) continue;

      for (const timeStr of medicine.times) {
        const [hours, minutes] = timeStr.split(':').map(num => parseInt(num, 10));
        
        // Schedule for the next 7 days
        for (let i = 0; i < 7; i++) {
          const scheduleDate = new Date();
          scheduleDate.setDate(now.getDate() + i);
          scheduleDate.setHours(hours, minutes, 0, 0); // EXACT zero seconds

          const dayName = scheduleDate.toLocaleDateString('en-US', { weekday: 'long' });

          // Only schedule if it's the right day and in the future
          if (medicine.days.includes(dayName) && scheduleDate > now) {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: " Time for Medicine",
                body: `Take ${medicine.dosage} of ${medicine.name}`,
                sound: 'default',
                priority: Notifications.AndroidNotificationPriority.MAX, // Hits zero on Android
                interruptionLevel: 'timeSensitive', // Hits zero on iOS
                data: { medicineId: medicine.id },
              },
              trigger: {
                // IMPORTANT: In newer Expo versions, use the DATE type for precision
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: scheduleDate,
                channelId: 'medicine-reminders',
              },
            });
          }
        }
      }
    }
  } catch (e) {
    console.error("Failed to schedule:", e);
  }
};

  const cleanupOldDoses = () => {
    const now = Date.now();
    const eighteenHoursInMs = 18 * 60 * 60 * 1000;
    
    const validDoses = takenDoses.filter(dose => {
      const timeSinceTaken = now - dose.takenAt;
      return timeSinceTaken < eighteenHoursInMs;
    });

    if (validDoses.length !== takenDoses.length) {
      saveData(medicines, validDoses);
    }
  };

  const loadData = async () => {
    try {
      const storedMedicines = await AsyncStorage.getItem('medicines');
      const storedTakenDoses = await AsyncStorage.getItem('takenDoses');
      
      if (storedMedicines) {
        const parsedMedicines = JSON.parse(storedMedicines);
        if (Array.isArray(parsedMedicines)) {
          const validMedicines = parsedMedicines.filter(medicine => {
            return (
              medicine &&
              typeof medicine.name === 'string' &&
              typeof medicine.dosage === 'string' &&
              Array.isArray(medicine.times) &&
              Array.isArray(medicine.days) &&
              medicine.times.length > 0 &&
              medicine.days.length > 0
            );
          });
          setMedicines(validMedicines);
        } else {
          setMedicines([]);
        }
      }

      if (storedTakenDoses) {
        const parsedDoses = JSON.parse(storedTakenDoses);
        const now = Date.now();
        const eighteenHoursInMs = 18 * 60 * 60 * 1000;
        const validDoses = parsedDoses.filter((dose: DosesTaken) => {
          const timeSinceTaken = now - dose.takenAt;
          return timeSinceTaken < eighteenHoursInMs;
        });
        setTakenDoses(validDoses);
      }

    } catch (error) {
      console.error('Error loading data:', error);
      setMedicines([]);
      setTakenDoses([]);
    }
  };

  const saveData = async (newMedicines: Medicine[] = medicines, newTakenDoses: DosesTaken[] = takenDoses) => {
    try {
      await AsyncStorage.setItem('medicines', JSON.stringify(newMedicines));
      await AsyncStorage.setItem('takenDoses', JSON.stringify(newTakenDoses));
      setMedicines(newMedicines);
      setTakenDoses(newTakenDoses);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const addMedicine = async () => {
    if (!medicineName.trim() || !dosage.trim() || selectedTimes.length === 0 || selectedDays.length === 0) {
      Alert.alert('Error', 'Please fill in all required fields, add at least one time, and select at least one day.');
      return;
    }

    const newMedicine: Medicine = {
      id: Date.now().toString(),
      name: medicineName.trim(),
      dosage: dosage.trim(),
      times: [...selectedTimes].sort(),
      days: [...selectedDays],
      startDate: new Date().toISOString().split('T')[0],
      notes: notes.trim(),
    };

    const updatedMedicines = [...medicines, newMedicine];
    await saveData(updatedMedicines);

    
    Alert.alert('Success', `${medicineName} has been added successfully!`);

    setMedicineName('');
    setDosage('');
    setSelectedTimes([]);
    setSelectedDays([]);
    setNotes('');
    setCurrentScreen('home');
  };

  const colonFormat = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  const dotFormat = /^([01]?[0-9]|2[0-3]).[0-5][0-9]$/;

  const addTime = () => {
    if (!colonFormat.test(newTime) && !dotFormat.test(newTime)) {
      Alert.alert('Error', 'Please enter time in HH:MM format (24-hour)');
      return;
    }
    const normalizedTime = newTime.replace('.', ':');

    if (selectedTimes.includes(normalizedTime)) {
      Alert.alert('Error', 'This time is already added');
      return;
    }
    setSelectedTimes([...selectedTimes, normalizedTime].sort());
    setNewTime('');
  };
  
  const removeTime = (timeToRemove: string) => {
    setSelectedTimes(selectedTimes.filter(time => time !== timeToRemove));
  };

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };
   
  const calculateUpcomingMedicines = () => {
    const now = new Date();
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const upcoming: UpcomingMedicine[] = [];

    const getDayName = (date: Date): string => {
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    };

    medicines.forEach(medicine => {
      if (!medicine.times || !Array.isArray(medicine.times) || 
          !medicine.days || !Array.isArray(medicine.days)) {
        return;
      }

      medicine.times.forEach(timeStr => {
        if (!timeStr || typeof timeStr !== 'string') {
          return;
        }

        const timeParts = timeStr.split(':');
        if (timeParts.length !== 2) {
          return;
        }

        const hours = parseInt(timeParts[0], 10);
        const minutes = parseInt(timeParts[1], 10);
        
        if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
          return;
        }
        
        const todayTime = new Date(now);
        todayTime.setHours(hours, minutes, 0, 0);
        const todayDayName = getDayName(todayTime);
        
        if (medicine.days.includes(todayDayName) && 
            ((todayTime > now && todayTime <= next24Hours) || 
             (todayTime >= twoHoursAgo && todayTime <= now))) {
          upcoming.push({
            medicine,
            nextTime: todayTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timeUntil: getTimeUntil(todayTime),
            scheduledTime: todayTime,
          });
        }

        const tomorrowTime = new Date(todayTime);
        tomorrowTime.setDate(tomorrowTime.getDate() + 1);
        const tomorrowDayName = getDayName(tomorrowTime);
        
        if (tomorrowTime <= next24Hours && medicine.days.includes(tomorrowDayName)) {
          upcoming.push({
            medicine,
            nextTime: `Tomorrow ${tomorrowTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            timeUntil: getTimeUntil(tomorrowTime),
            scheduledTime: tomorrowTime,
          });
        }
      });
    });

    upcoming.sort((a, b) => {
      return a.scheduledTime.getTime() - b.scheduledTime.getTime();
    });

    setUpcomingMedicines(upcoming);
  };

  const markAsTaken = (medicineId: string, scheduledTime: Date) => {
    const timeKey = `${medicineId}-${scheduledTime.getTime()}`;
    
    const alreadyTaken = takenDoses.some(
      dose => dose.id === medicineId && dose.time === timeKey
    );
    
    if (alreadyTaken) {
      const updatedDoses = takenDoses.filter(
        dose => !(dose.id === medicineId && dose.time === timeKey)
      );
      saveData(medicines, updatedDoses);
    } else {
      const newDose: DosesTaken = {
        id: medicineId,
        time: timeKey,
        takenAt: Date.now(),
      };
      const updatedDoses = [...takenDoses, newDose];
      saveData(medicines, updatedDoses);
    }
  };

  const isTaken = (medicineId: string, scheduledTime: Date): boolean => {
    const timeKey = `${medicineId}-${scheduledTime.getTime()}`;
    return takenDoses.some(
      dose => dose.id === medicineId && dose.time === timeKey
    );
  };

  const getTimeUntil = (targetTime: Date): string => {
    const now = new Date();
    const diffMs = targetTime.getTime() - now.getTime();
    const absDiffMs = Math.abs(diffMs);
    const diffHours = Math.floor(absDiffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((absDiffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffMs < 0) {
      if (diffHours > 0) {
        return `${diffHours}h ${diffMinutes}m ago`;
      } else {
        return `${diffMinutes}m ago`;
      }
    } else {
      if (diffHours > 0) {
        return `in ${diffHours}h ${diffMinutes}m`;
      } else {
        return `in ${diffMinutes}m`;
      }
    }
  };

  const deleteMedicine = (id: string) => {
    Alert.alert(
      'Delete Medicine',
      'Are you sure you want to delete this medicine?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedMedicines = medicines.filter(med => med.id !== id);
            saveData(updatedMedicines, takenDoses);
          },
        },
      ]
    );
  };

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayScheduledDoses = medicines.reduce((count, medicine) => {
    if (medicine.days.includes(today)) {
      return count + medicine.times.length;
    }
    return count;
  }, 0);

  const todayTakenDosesCount = takenDoses.filter(dose => {
    const medicine = medicines.find(m => m.id === dose.id);
    if (!medicine) return false;
    
    const timeKey = dose.time;
    const timestamp = parseInt(timeKey.split('-')[1]);
    const doseDate = new Date(timestamp);
    const doseDayName = doseDate.toLocaleDateString('en-US', { weekday: 'long' });
    
    return doseDayName === today;
  }).length;

  const activeMedicationsCount = medicines.length;

  const nextUntakenDose = upcomingMedicines.find(item => {
    const now = new Date();
    return item.scheduledTime >= now && !isTaken(item.medicine.id, item.scheduledTime);
  });

  const nextDose = nextUntakenDose ? {
    time: nextUntakenDose.nextTime,
    name: nextUntakenDose.medicine.name,
  } : null;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        {currentScreen === 'home' && (
          <HomeScreen 
            upcomingMedicines={upcomingMedicines} 
            styles={styles} 
            setCurrentScreen={setCurrentScreen}
            todayProgress={`${todayTakenDosesCount}/${todayScheduledDoses}`}
            activeMedicationsCount={activeMedicationsCount}
            nextDose={nextDose}
            markAsTaken={markAsTaken}
            isTaken={isTaken}
          />
        )}
        {currentScreen === 'add' && (
          <AddMedicinePage
            medicineName={medicineName}
            setMedicineName={setMedicineName}
            dosage={dosage}
            setDosage={setDosage}
            selectedTimes={selectedTimes}
            setSelectedTimes={setSelectedTimes}
            newTime={newTime}
            setNewTime={setNewTime}
            selectedDays={selectedDays}
            setSelectedDays={setSelectedDays}
            notes={notes}
            setNotes={setNotes}
            daysOfWeek={daysOfWeek}
            styles={styles}
            addMedicine={addMedicine}
            addTime={addTime}
            removeTime={removeTime}
            toggleDay={toggleDay}
          />
        )}
        {currentScreen === 'all' && (
          <AllMedicinesPage 
            medicines={medicines} 
            styles={styles} 
            deleteMedicine={deleteMedicine} 
            currentScreen={currentScreen}
            setCurrentScreen={setCurrentScreen}
          />
        )}
        
        <Navigation 
          currentScreen={currentScreen} 
          setCurrentScreen={setCurrentScreen} 
          styles={styles} 
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  navigation: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderTopColor: '#333333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 4,
    backgroundColor: '#fff',
  },
  navButton: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  activeNavButton: {
    backgroundColor: '#0e52e3b5',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  navButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#888888',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginTop: 2,
  },
  activeNavText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  navIcon: {
    width: 18,
    height: 18,
    marginBottom: 2,
    borderWidth: 1.5,
    borderColor: '#888888',
    borderRadius: 3,
  },
  activeNavIcon: {
    borderColor: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginBottom: 20,
    textAlign: 'center',
  },
  medicineList: {
    flex: 1,
  },
  medicineCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  medicineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  medicineName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  timeUntil: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  dosage: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  time: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 4,
  },
  times: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
    marginBottom: 4,
  },
  notes: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 4,
  },
  form: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeInput: {
    flex: 1,
    marginRight: 12,
  },
  addTimeButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addTimeButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  timesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  timeChipText: {
    color: '#007AFF',
    fontWeight: '500',
    marginRight: 8,
  },
  removeTime: {
    color: '#007AFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 24,
    marginBottom: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  dayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  selectedDayButton: {
    backgroundColor: '#007AFF',
  },
  dayButtonText: {
    color: '#007AFF',
    fontWeight: '500',
    fontSize: 14,
  },
  selectedDayText: {
    color: '#fff',
  },
  days: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginBottom: 4,
  },
  nameCheckboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 6,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  takenCard: {
    opacity: 0.6,
    backgroundColor: '#f9f9f', 
  },
  takenText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  takenBadge: {
    backgroundColor: '#E8E8E8',
    color: '#999',
  },
});

export default Context;