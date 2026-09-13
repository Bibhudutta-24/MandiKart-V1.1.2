import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, typography } from '../../theme';

export const DeliveryStepper = ({
  stage = 'IN_TRANSIT', // 'PICKUP' | 'IN_TRANSIT' | 'DELIVERED'
  orientation = 'horizontal', // 'horizontal' | 'vertical'
  milestones,
}) => {
  const isPickupDone = stage === 'IN_TRANSIT' || stage === 'DELIVERED';
  const isInTransitActive = stage === 'IN_TRANSIT';
  const isDeliveredDone = stage === 'DELIVERED';

  if (orientation === 'vertical') {
    return (
      <View style={styles.verticalContainer}>
        {/* Step 1: Pickup */}
        <View style={styles.verticalRow}>
          <View style={styles.iconCol}>
            <View
              style={[
                styles.vCircle,
                isPickupDone ? styles.circleActive : styles.circlePending,
              ]}
            >
              {isPickupDone ? (
                <MaterialIcons name="check" size={14} color={colors.onPrimary} />
              ) : (
                <View style={styles.innerDot} />
              )}
            </View>
            <View
              style={[
                styles.vLine,
                isPickupDone ? styles.lineActive : styles.linePending,
              ]}
            />
          </View>
          <View style={styles.vTextCol}>
            <Text style={styles.vTitle}>
              {milestones?.[0]?.title || 'Pickup at Farmer Location'}
            </Text>
            <Text style={styles.vSubtitle}>
              {milestones?.[0]?.time || (isPickupDone ? 'Completed' : 'Pending')}
            </Text>
          </View>
        </View>

        {/* Step 2: Transit */}
        <View style={styles.verticalRow}>
          <View style={styles.iconCol}>
            <View
              style={[
                styles.vCircle,
                isInTransitActive
                  ? styles.circleCurrent
                  : isDeliveredDone
                  ? styles.circleActive
                  : styles.circlePending,
              ]}
            >
              {isDeliveredDone ? (
                <MaterialIcons name="check" size={14} color={colors.onPrimary} />
              ) : isInTransitActive ? (
                <View style={[styles.innerDot, { backgroundColor: colors.onTertiaryContainer }]} />
              ) : (
                <View style={styles.innerDot} />
              )}
            </View>
            <View
              style={[
                styles.vLine,
                isDeliveredDone ? styles.lineActive : styles.linePending,
              ]}
            />
          </View>
          <View style={styles.vTextCol}>
            <Text style={styles.vTitle}>
              {milestones?.[1]?.title || 'En route to Destination'}
            </Text>
            <Text
              style={[
                styles.vSubtitle,
                isInTransitActive && { color: colors.primary, fontWeight: '600' },
              ]}
            >
              {milestones?.[1]?.time || (isInTransitActive ? 'Est. arrival 10:45 AM' : 'Pending')}
            </Text>
          </View>
        </View>

        {/* Step 3: Destination */}
        <View style={styles.verticalRow}>
          <View style={styles.iconCol}>
            <View
              style={[
                styles.vCircle,
                isDeliveredDone ? styles.circleActive : styles.circlePending,
              ]}
            >
              {isDeliveredDone && (
                <MaterialIcons name="check" size={14} color={colors.onPrimary} />
              )}
            </View>
          </View>
          <View style={styles.vTextCol}>
            <Text style={styles.vTitle}>
              {milestones?.[2]?.title || 'Deliver to Market Yard'}
            </Text>
            <Text style={styles.vSubtitle}>
              {milestones?.[2]?.time || (isDeliveredDone ? 'Delivered' : 'Pending OTP verification')}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // Horizontal Stepper (used on Home Active Delivery Card)
  return (
    <View style={styles.hContainer}>
      {/* Pickup Node */}
      <View style={styles.hNode}>
        <View style={[styles.hCircle, styles.circleActive]}>
          <MaterialIcons name="check" size={12} color={colors.onPrimary} />
        </View>
        <Text style={[styles.hLabel, styles.labelActive]}>Pickup</Text>
      </View>

      {/* Line 1 */}
      <View
        style={[
          styles.hLine,
          isPickupDone ? styles.lineActive : styles.linePending,
        ]}
      />

      {/* Transit Node */}
      <View style={styles.hNode}>
        <View
          style={[
            styles.hCircle,
            isInTransitActive
              ? styles.circleCurrent
              : isDeliveredDone
              ? styles.circleActive
              : styles.circlePending,
          ]}
        >
          {isDeliveredDone ? (
            <MaterialIcons name="check" size={12} color={colors.onPrimary} />
          ) : (
            <View style={[styles.hInnerDot, isInTransitActive && styles.hInnerDotActive]} />
          )}
        </View>
        <Text
          style={[
            styles.hLabel,
            isInTransitActive
              ? styles.labelCurrent
              : isDeliveredDone
              ? styles.labelActive
              : styles.labelPending,
          ]}
        >
          In Transit
        </Text>
      </View>

      {/* Line 2 */}
      <View
        style={[
          styles.hLine,
          isDeliveredDone ? styles.lineActive : styles.linePending,
        ]}
      />

      {/* Delivered Node */}
      <View style={styles.hNode}>
        <View
          style={[
            styles.hCircle,
            isDeliveredDone ? styles.circleActive : styles.circlePending,
          ]}
        >
          {isDeliveredDone && (
            <MaterialIcons name="check" size={12} color={colors.onPrimary} />
          )}
        </View>
        <Text
          style={[
            styles.hLabel,
            isDeliveredDone ? styles.labelActive : styles.labelPending,
          ]}
        >
          Delivered
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Horizontal Stepper
  hContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginVertical: 6,
  },
  hNode: {
    alignItems: 'center',
    zIndex: 2,
    width: 68,
  },
  hCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  hInnerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.outlineVariant,
  },
  hInnerDotActive: {
    backgroundColor: colors.onTertiaryFixedVariant,
  },
  hLine: {
    flex: 1,
    height: 2,
    marginTop: -16,
    marginHorizontal: -8,
    zIndex: 1,
  },
  hLabel: {
    ...typography.labelSm,
    fontSize: 11,
    textAlign: 'center',
  },
  labelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  labelCurrent: {
    color: colors.onSurface,
    fontWeight: '700',
  },
  labelPending: {
    color: colors.onSurfaceVariant,
  },

  // Vertical Stepper
  verticalContainer: {
    paddingVertical: 4,
  },
  verticalRow: {
    flexDirection: 'row',
    minHeight: 52,
  },
  iconCol: {
    alignItems: 'center',
    width: 28,
  },
  vCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vLine: {
    width: 2,
    flex: 1,
    marginVertical: 3,
  },
  vTextCol: {
    flex: 1,
    marginLeft: 12,
    paddingTop: 1,
  },
  vTitle: {
    ...typography.bodyMd,
    fontWeight: '600',
    color: colors.onSurface,
  },
  vSubtitle: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },

  // Color mappings
  circleActive: {
    backgroundColor: colors.primary,
  },
  circleCurrent: {
    backgroundColor: colors.tertiaryFixedDim,
    borderWidth: 2,
    borderColor: colors.surfaceContainerLowest,
  },
  circlePending: {
    backgroundColor: colors.surfaceVariant,
  },
  innerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.outlineVariant,
  },
  lineActive: {
    backgroundColor: colors.primary,
  },
  linePending: {
    backgroundColor: colors.surfaceVariant,
  },
});

export default DeliveryStepper;
