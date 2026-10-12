import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from 'react-native-paper';

const ITEMS = [
  { label: 'Home', icon: 'home-outline', activeIcon: 'home' },
  { label: 'Diagnose', icon: 'camera-outline' },
  { label: 'My\nGarden', icon: 'leaf-outline' },
  { label: 'AI Chat', icon: 'chatbubble-outline' },
  { label: 'Profile', icon: 'person-outline' },
];

export default function Navbar() {
  return (
    <View style={styles.navbar}>
      {ITEMS.map((item, index) => {
        const isActive = index === 0;

        return (
          <View key={item.label} style={styles.item}>
            {isActive && <View style={styles.activeIndicator} />}
            <Ionicons
              name={isActive ? item.activeIcon : item.icon}
              size={21}
              color={isActive ? '#183B2B' : '#9AA3A5'}
            />
            <Text style={[styles.label, isActive && styles.activeLabel]}>
              {item.label}
            </Text>
            {isActive && <View style={styles.activeDot} />}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    height: 70,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8ECEA',
    shadowColor: '#183B2B',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 8,
  },
  item: {
    minWidth: 62,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    top: -1,
    width: 28,
    height: 2,
    backgroundColor: '#183B2B',
  },
  label: {
    marginTop: 4,
    color: '#9AA3A5',
    fontSize: 12,
    lineHeight: 15,
    textAlign: 'center',
  },
  activeLabel: {
    color: '#183B2B',
    fontWeight: '600',
  },
  activeDot: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#183B2B',
  },
});
