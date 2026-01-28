import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  currentScreen: 'home' | 'add' | 'all';
  setCurrentScreen: (screen: 'home' | 'add' | 'all') => void;
  styles: StyleSheet.NamedStyles<any>;
}

// Simple icon components using View and Text
const HomeIcon: React.FC<{ active: boolean }> = ({ active }) => (
  <View style={[
    styles.iconContainer,
    { borderColor: active ? '#FFFFFF' : '#888888' }
  ]}>
    <View style={[
      styles.houseRoof,
      { borderBottomColor: active ? '#FFFFFF' : '#888888' }
    ]} />
    <View style={[
      styles.houseBase,
      { backgroundColor: active ? '#FFFFFF' : '#888888' }
    ]} />
  </View>
);

const AddIcon: React.FC<{ active: boolean }> = ({ active }) => (
  <View style={styles.iconContainer}>
    <Text style={[
      styles.plusIcon,
      { color: active ? '#FFFFFF' : '#888888' }
    ]}>+</Text>
  </View>
);

const ListIcon: React.FC<{ active: boolean }> = ({ active }) => (
  <View style={styles.iconContainer}>
    <View style={[
      styles.listLine,
      { backgroundColor: active ? '#FFFFFF' : '#888888' },
      { width: 12, marginBottom: 2 }
    ]} />
    <View style={[
      styles.listLine,
      { backgroundColor: active ? '#FFFFFF' : '#888888' },
      { width: 12, marginBottom: 2 }
    ]} />
    <View style={[
      styles.listLine,
      { backgroundColor: active ? '#FFFFFF' : '#888888' },
      { width: 12 }
    ]} />
  </View>
);

const Navigation: React.FC<Props> = ({ currentScreen, setCurrentScreen, styles: parentStyles }) => {
  return (
    <View style={parentStyles.navigation}>
      <TouchableOpacity
        style={[parentStyles.navButton, currentScreen === 'home' && parentStyles.activeNavButton]}
        onPress={() => setCurrentScreen('home')}
      >
        <HomeIcon active={currentScreen === 'home'} />
        <Text style={[parentStyles.navButtonText, currentScreen === 'home' && parentStyles.activeNavText]}>
          HOME
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[parentStyles.navButton, currentScreen === 'add' && parentStyles.activeNavButton]}
        onPress={() => setCurrentScreen('add')}
      >
        <AddIcon active={currentScreen === 'add'} />
        <Text style={[parentStyles.navButtonText, currentScreen === 'add' && parentStyles.activeNavText]}>
          ADD
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[parentStyles.navButton, currentScreen === 'all' && parentStyles.activeNavButton]}
        onPress={() => setCurrentScreen('all')}
      >
        <ListIcon active={currentScreen === 'all'} />
        <Text style={[parentStyles.navButtonText, currentScreen === 'all' && parentStyles.activeNavText]}>
          ALL
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    width: 20,
    height: 20,
    marginBottom: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Home icon styles
  houseRoof: {
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderBottomWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginBottom: 1,
  },
  houseBase: {
    width: 10,
    height: 8,
    borderRadius: 1,
  },
  // Add icon styles
  plusIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  // List icon styles
  listLine: {
    height: 2,
    borderRadius: 1,
  },
});

export default Navigation;