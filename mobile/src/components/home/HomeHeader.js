import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

export default function HomeHeader() {
  return (
    <View style={styles.container}>
      {/* TOP BAR */}
      <View style={styles.headerRow}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Ionicons name="leaf" size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.logoText}>Plantify</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.bellButton} activeOpacity={0.8}>
            <Ionicons name="notifications-outline" size={20} color="#183B2B" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.avatarButton} activeOpacity={0.8}>
            <Text style={styles.avatarText}>AN</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* GREETING */}
      <View style={styles.greetingSection}>
        <Text style={styles.greetingSub}>Xin chào, người yêu cây!</Text>
        <Text style={styles.greetingMain}>
          Hôm nay khu vườn của bạn{'\n'}thế nào?
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#183B2B',
    marginLeft: 8,
    letterSpacing: -0.3,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bellButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#E2E8E4',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.avatarBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  greetingSection: {
    marginTop: 10,
  },
  greetingSub: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accentGreen,
    marginBottom: 4,
  },
  greetingMain: {
    fontSize: 24,
    fontWeight: '800',
    color: '#183B2B',
    lineHeight: 32,
    letterSpacing: -0.4,
  },
});
