import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, borderRadius } from '../../theme';
import { useTheme } from '../../context/ThemeContext';

export const StatusBadge = ({
  status,
  label,
  size = 'medium', // 'small' | 'medium'
  showPulse = false,
}) => {
  const { isDarkMode } = useTheme();
  const normalized = (status || '').toUpperCase();

  const getTheme = () => {
    switch (normalized) {
      case 'ACTIVE':
      case 'IN_TRANSIT':
      case 'IN TRANSIT':
        return {
          bg: isDarkMode ? 'rgba(56, 189, 248, 0.18)' : '#e0f2fe',
          text: isDarkMode ? '#38bdf8' : '#0284c7',
          border: isDarkMode ? 'rgba(56, 189, 248, 0.35)' : 'transparent',
          label: label || 'IN TRANSIT',
          pulse: true,
        };
      case 'COMPLETED':
      case 'DELIVERED':
      case 'VERIFIED':
      case 'RESOLVED':
        return {
          bg: isDarkMode ? 'rgba(0, 230, 118, 0.18)' : '#ecfdf5',
          text: isDarkMode ? '#00E676' : '#047857',
          border: isDarkMode ? 'rgba(0, 230, 118, 0.35)' : 'transparent',
          label: label || 'COMPLETED',
          pulse: false,
        };
      case 'PROCESSING':
      case 'PENDING':
      case 'IN_REVIEW':
        return {
          bg: isDarkMode ? 'rgba(251, 191, 36, 0.18)' : '#fef3c7',
          text: isDarkMode ? '#fbbf24' : '#b45309',
          border: isDarkMode ? 'rgba(251, 191, 36, 0.35)' : 'transparent',
          label: label || 'PROCESSING',
          pulse: false,
        };
      case 'EXCEPTION':
      case 'FAILED':
        return {
          bg: isDarkMode ? 'rgba(239, 68, 68, 0.18)' : '#fef2f2',
          text: isDarkMode ? '#f87171' : '#dc2626',
          border: isDarkMode ? 'rgba(239, 68, 68, 0.35)' : 'transparent',
          label: label || 'ISSUE REPORTED',
          pulse: false,
        };
      case 'AVAILABLE':
      case 'NEW':
      default:
        return {
          bg: isDarkMode ? 'rgba(0, 230, 118, 0.18)' : '#ecfdf5',
          text: isDarkMode ? '#00E676' : '#047857',
          border: isDarkMode ? 'rgba(0, 230, 118, 0.35)' : 'transparent',
          label: label || 'AVAILABLE',
          pulse: false,
        };
    }
  };

  const current = getTheme();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: current.bg,
          borderColor: current.border,
          borderWidth: isDarkMode ? 1 : 0,
        },
        size === 'small' && styles.badgeSmall,
      ]}
    >
      {(showPulse || current.pulse) && (
        <View style={[styles.pulseDot, { backgroundColor: current.text }]} />
      )}
      <Text
        style={[
          styles.badgeText,
          { color: current.text },
          size === 'small' && styles.badgeTextSmall,
        ]}
      >
        {current.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  badgeText: {
    ...typography.labelSm,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  badgeTextSmall: {
    fontSize: 10,
  },
});

export default StatusBadge;
