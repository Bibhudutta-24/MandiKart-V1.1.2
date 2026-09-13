import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, typography, borderRadius, shadows } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import StatusBadge from '../common/StatusBadge';
import AppButton from '../common/AppButton';

export const DeliveryCard = ({
  delivery,
  onPress,
  onAccept,
  showActions = true,
}) => {
  const { colors: themeColors, isDarkMode } = useTheme();
  const cardScale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(cardScale, {
      toValue: 0.975,
      useNativeDriver: true,
      speed: 35,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(cardScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 25,
      bounciness: 6,
    }).start();
  };

  if (!delivery) return null;

  return (
    <Animated.View style={{ transform: [{ scale: cardScale }] }}>
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: themeColors.card,
            borderColor: isDarkMode ? themeColors.border : colors.outlineVariant,
            shadowColor: isDarkMode ? '#00E676' : '#000000',
            shadowOpacity: isDarkMode ? 0.08 : 0.05,
          },
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
      {/* Top Tag & Distance Row */}
      <View style={styles.topRow}>
        <StatusBadge status={delivery.status} label={delivery.status === 'AVAILABLE' ? 'NEW DELIVERY' : undefined} />
        <View
          style={[
            styles.distanceBadge,
            { backgroundColor: isDarkMode ? themeColors.surfaceContainerHigh : 'rgba(0, 0, 0, 0.04)' },
          ]}
        >
          <MaterialIcons name="location-on" size={14} color={isDarkMode ? themeColors.primary : colors.onSurfaceVariant} />
          <Text style={[styles.distanceText, { color: isDarkMode ? themeColors.textSecondary : colors.onSurfaceVariant }]}>
            {delivery.distanceKm} km away
          </Text>
        </View>
      </View>

      {/* Title & Weight */}
      <View style={styles.titleSection}>
        <Text style={[styles.titleText, { color: themeColors.textPrimary }]}>{delivery.title}</Text>
        <Text style={[styles.weightText, { color: themeColors.textSecondary }]}>{delivery.weight} Total</Text>
      </View>

      {/* Route Pickup & Drop-off Graphic */}
      <View style={styles.routeContainer}>
        <View style={[styles.routeLine, { backgroundColor: isDarkMode ? themeColors.border : colors.outlineVariant }]} />
        
        <View style={styles.routePoint}>
          <View style={[styles.dot, styles.pickupDot, { borderColor: themeColors.card }]} />
          <View style={styles.pointTextWrapper}>
            <Text style={[styles.pointLabel, { color: themeColors.textSecondary }]}>PICKUP</Text>
            <Text style={[styles.pointName, { color: themeColors.textPrimary }]} numberOfLines={1}>
              {delivery.pickup?.name || 'Pickup Point'}
            </Text>
          </View>
        </View>

        <View style={[styles.routePoint, { marginTop: 12 }]}>
          <View style={[styles.dot, styles.dropDot, { borderColor: themeColors.card }]} />
          <View style={styles.pointTextWrapper}>
            <Text style={[styles.pointLabel, { color: themeColors.textSecondary }]}>DROP-OFF</Text>
            <Text style={[styles.pointName, { color: themeColors.textPrimary }]} numberOfLines={1}>
              {delivery.destination?.name || 'Destination Yard'}
            </Text>
          </View>
        </View>
      </View>

      {/* Metrics Row (Est Dist, Est Time, Earning) */}
      <View
        style={[
          styles.metricsContainer,
          {
            backgroundColor: isDarkMode ? themeColors.surfaceContainerHigh : colors.surfaceContainer,
            borderColor: isDarkMode ? themeColors.border : 'transparent',
            borderWidth: isDarkMode ? 1 : 0,
          },
        ]}
      >
        <View style={styles.metricItem}>
          <Text style={[styles.metricLabel, { color: themeColors.textSecondary }]}>Est. Dist</Text>
          <Text style={[styles.metricValue, { color: themeColors.textPrimary }]}>{delivery.distanceKm} km</Text>
        </View>
        <View style={[styles.metricDivider, { backgroundColor: isDarkMode ? themeColors.border : colors.outlineVariant }]} />
        <View style={styles.metricItem}>
          <Text style={[styles.metricLabel, { color: themeColors.textSecondary }]}>Est. Time</Text>
          <Text style={[styles.metricValue, { color: themeColors.textPrimary }]}>{delivery.estMinutes} min</Text>
        </View>
        <View style={[styles.metricDivider, { backgroundColor: isDarkMode ? themeColors.border : colors.outlineVariant }]} />
        <View style={styles.earningContainer}>
          <Text style={[styles.metricLabel, { color: themeColors.textSecondary }]}>Earning</Text>
          <Text style={[styles.earningValue, { color: themeColors.primary }]}>₹{delivery.earning}</Text>
        </View>
      </View>

      {/* Actions */}
      {showActions && delivery.status === 'AVAILABLE' && (
        <View style={styles.actionRow}>
          <AppButton
            title="Accept Delivery"
            onPress={() => onAccept && onAccept(delivery.id)}
            size="medium"
            style={styles.acceptBtn}
          />
          <AppButton
            title="View Details"
            onPress={onPress}
            variant="secondary"
            size="medium"
            style={[
              styles.detailsBtn,
              isDarkMode && {
                backgroundColor: themeColors.surfaceContainer,
                borderWidth: 1,
                borderColor: themeColors.border,
              },
            ]}
            textStyle={{ color: themeColors.primary }}
          />
        </View>
      )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: borderRadius.xl,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    ...shadows.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  distanceText: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
  },
  titleSection: {
    marginBottom: 12,
  },
  titleText: {
    ...typography.headlineMd,
    color: colors.onSurface,
  },
  weightText: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  routeContainer: {
    position: 'relative',
    paddingLeft: 18,
    marginVertical: 6,
  },
  routeLine: {
    position: 'absolute',
    left: 4,
    top: 8,
    bottom: 8,
    width: 2,
    backgroundColor: colors.outlineVariant,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    position: 'relative',
  },
  dot: {
    position: 'absolute',
    left: -18,
    top: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.surfaceContainerLowest,
  },
  pickupDot: {
    backgroundColor: colors.primary,
  },
  dropDot: {
    backgroundColor: colors.error,
  },
  pointTextWrapper: {
    marginLeft: 4,
  },
  pointLabel: {
    ...typography.labelSm,
    fontSize: 10,
    color: colors.onSurfaceVariant,
  },
  pointName: {
    ...typography.bodyMd,
    color: colors.onSurface,
    fontWeight: '500',
  },
  metricsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceContainer,
    borderRadius: borderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 14,
  },
  metricItem: {
    alignItems: 'flex-start',
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.outlineVariant,
  },
  metricLabel: {
    ...typography.labelSm,
    fontSize: 10,
    color: colors.onSurfaceVariant,
    marginBottom: 2,
  },
  metricValue: {
    ...typography.labelMd,
    color: colors.onSurface,
  },
  earningContainer: {
    alignItems: 'flex-end',
  },
  earningValue: {
    ...typography.headlineMd,
    color: colors.primary,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
  },
  acceptBtn: {
    flex: 1.4,
  },
  detailsBtn: {
    flex: 1,
    backgroundColor: 'rgba(0, 81, 41, 0.08)',
  },
});

export default DeliveryCard;
