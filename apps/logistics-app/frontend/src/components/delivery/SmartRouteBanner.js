import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, typography, borderRadius, shadows } from '../../theme';
import { useTheme } from '../../context/ThemeContext';

export const SmartRouteBanner = ({
  savingKm = '6.8 km',
  extraEarning = '₹140',
  onPress,
}) => {
  const { colors: themeColors, isDarkMode } = useTheme();

  return (
    <View
      style={[
        styles.card,
        isDarkMode && {
          backgroundColor: '#062E19',
          borderColor: '#00E676',
          borderWidth: 1.5,
          shadowColor: '#00E676',
          shadowOpacity: 0.15,
        },
      ]}
    >
      <View style={styles.topRow}>
        <View
          style={[
            styles.iconCircle,
            isDarkMode && {
              backgroundColor: '#00E676',
            },
          ]}
        >
          <MaterialIcons name="route" size={20} color={isDarkMode ? '#000000' : colors.white} />
        </View>
        <View style={styles.headerTextCol}>
          <Text style={[styles.title, isDarkMode && { color: '#FFFFFF' }]}>Smart Delivery Match</Text>
          <Text style={[styles.subtitle, isDarkMode && { color: '#A7F3D0' }]}>
            AI found deliveries that can be combined to reduce travel distance.
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.statContainer,
          isDarkMode && {
            backgroundColor: 'rgba(0, 230, 118, 0.12)',
          },
        ]}
      >
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, isDarkMode && { color: '#A7F3D0' }]}>Potential saving</Text>
          <Text style={[styles.statValue, isDarkMode && { color: '#FFFFFF' }]}>{savingKm}</Text>
        </View>
        <View style={[styles.divider, isDarkMode && { backgroundColor: 'rgba(0, 230, 118, 0.25)' }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, isDarkMode && { color: '#A7F3D0' }]}>Extra earning</Text>
          <Text style={[styles.statValue, isDarkMode && { color: '#00E676' }]}>{extraEarning}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.actionBtn,
          isDarkMode && {
            backgroundColor: '#00E676',
          },
        ]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text style={[styles.actionBtnText, isDarkMode && { color: '#000000' }]}>View Smart Route</Text>
        <MaterialIcons name="arrow-forward" size={16} color={isDarkMode ? '#000000' : colors.onPrimary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primaryContainer,
    borderRadius: borderRadius.lg,
    padding: 16,
    marginVertical: 10,
    ...shadows.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextCol: {
    flex: 1,
  },
  title: {
    ...typography.headlineSm,
    color: colors.onPrimary,
  },
  subtitle: {
    ...typography.bodySm,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
    lineHeight: 18,
  },
  statContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: borderRadius.md,
    paddingVertical: 10,
    marginTop: 14,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    ...typography.labelSm,
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.75)',
  },
  statValue: {
    ...typography.headlineMd,
    color: colors.white,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    height: 42,
    borderRadius: borderRadius.md,
    marginTop: 12,
    gap: 6,
  },
  actionBtnText: {
    ...typography.labelMd,
    color: colors.onPrimary,
    fontWeight: '700',
  },
});

export default SmartRouteBanner;
