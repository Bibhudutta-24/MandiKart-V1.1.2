import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, borderRadius, shadows, spacing } from '../../theme';
import AppButton from '../../components/common/AppButton';
import AppCard from '../../components/common/AppCard';
import { useDelivery } from '../../context/DeliveryContext';
import { ROUTES } from '../../navigation/routes';

export const PODScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { activeDelivery, completeDelivery } = useDelivery();
  const delivery = activeDelivery;

  // 4-digit OTP state
  const [otp, setOtp] = useState(['4', '8', '2', '1']);
  const [buyerConfirmed, setBuyerConfirmed] = useState(true);
  const [photoAdded, setPhotoAdded] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const otpInputs = useRef([]);

  const handleOtpChange = (text, index) => {
    const updated = [...otp];
    updated[index] = text;
    setOtp(updated);

    // Auto move to next input
    if (text && index < 3) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleConfirmPOD = async () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length < 4) {
      Alert.alert('Invalid OTP', 'Please enter the complete 4-digit delivery OTP.');
      return;
    }
    if (!buyerConfirmed) {
      Alert.alert('Confirmation Required', 'Please confirm that the buyer received the cargo.');
      return;
    }

    setSubmitting(true);
    try {
      await completeDelivery({
        otp: enteredOtp,
        buyerConfirmed,
        photoAdded,
      });
      setIsCompleted(true);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to submit Proof of Delivery.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Complete Delivery</Text>
        <View style={styles.orderBadge}>
          <Text style={styles.orderBadgeText}>#{delivery?.id || 'MK10284'}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Celebration Hero Badge */}
        <View style={styles.celebrationHero}>
          <View style={styles.celebrationCircle}>
            <MaterialIcons name="check-circle" size={48} color={colors.primary} />
          </View>
          <Text style={styles.heroTitle}>Delivery Completed</Text>
          <Text style={styles.heroSub}>
            Order #{delivery?.id || 'MK10284'} has been successfully delivered.
          </Text>
        </View>

        {/* Delivery Summary Card */}
        <AppCard style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Delivery Summary</Text>
            <View style={styles.deliveredChip}>
              <Text style={styles.deliveredChipText}>DELIVERED</Text>
            </View>
          </View>

          <View style={styles.cargoSummaryRow}>
            <View style={styles.cargoThumb}>
              <MaterialIcons name="eco" size={28} color={colors.secondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cargoName}>
                {delivery?.title || 'Fresh Tomatoes'} ({delivery?.weight || '120 kg'})
              </Text>
              <Text style={styles.routeSummary}>
                {delivery?.pickup?.name || 'Ramesh Farm'} to{' '}
                {delivery?.destination?.name || 'Central Market'}
              </Text>
            </View>
          </View>

          <View style={styles.statsStrip}>
            <View style={styles.statStripItem}>
              <MaterialIcons name="route" size={16} color={colors.onSurfaceVariant} />
              <Text style={styles.statStripText}>11.2 km</Text>
            </View>
            <View style={styles.stripDivider} />
            <View style={styles.statStripItem}>
              <MaterialIcons name="timer" size={16} color={colors.onSurfaceVariant} />
              <Text style={styles.statStripText}>42 min</Text>
            </View>
          </View>
        </AppCard>

        {/* Proof of Delivery Card */}
        <AppCard style={styles.card}>
          <Text style={styles.cardTitle}>Proof of Delivery</Text>

          <View style={styles.otpSection}>
            <Text style={styles.otpPrompt}>Enter 4-digit delivery OTP</Text>
            <View style={styles.otpInputsRow}>
              {[0, 1, 2, 3].map((i) => (
                <TextInput
                  key={i}
                  ref={(el) => (otpInputs.current[i] = el)}
                  style={styles.otpBox}
                  value={otp[i]}
                  onChangeText={(txt) => handleOtpChange(txt, i)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                />
              ))}
            </View>
            <TouchableOpacity
              onPress={() => Alert.alert('OTP Resent', 'A new 4-digit code was sent to the buyer.')}
              activeOpacity={0.7}
            >
              <Text style={styles.resendText}>Resend OTP</Text>
            </TouchableOpacity>
          </View>

          {/* Buyer Confirmation Checkbox */}
          <TouchableOpacity
            style={styles.confirmCheckboxRow}
            onPress={() => setBuyerConfirmed(!buyerConfirmed)}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.confirmCheckbox,
                buyerConfirmed && styles.confirmCheckboxActive,
              ]}
            >
              {buyerConfirmed && (
                <MaterialIcons name="check" size={16} color={colors.onPrimary} />
              )}
            </View>
            <Text style={styles.confirmLabel}>Buyer confirmed receipt & quality</Text>
          </TouchableOpacity>

          {/* Add Photo Button */}
          <TouchableOpacity
            style={[styles.photoButton, photoAdded && styles.photoButtonActive]}
            onPress={() => {
              setPhotoAdded(!photoAdded);
              Alert.alert('Photo Captured', 'Produce handover photo attached.');
            }}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name={photoAdded ? 'check-circle' : 'add-a-photo'}
              size={20}
              color={photoAdded ? colors.primary : colors.onSurfaceVariant}
            />
            <Text style={[styles.photoText, photoAdded && { color: colors.primary }]}>
              {photoAdded ? 'Delivery Photo Attached (pod_10284.jpg)' : 'Add Delivery Photo (Optional)'}
            </Text>
          </TouchableOpacity>
        </AppCard>

        {/* Quantity Verification Card */}
        <AppCard style={styles.card}>
          <View style={styles.qtyRow}>
            <View>
              <Text style={styles.qtyLabel}>Ordered</Text>
              <Text style={styles.qtyVal}>{delivery?.weight || '120 kg'}</Text>
            </View>
            <View style={styles.qtyDivider} />
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.qtyLabel}>Delivered</Text>
              <Text style={styles.qtyVal}>{delivery?.weight || '120 kg'}</Text>
            </View>
          </View>

          <View style={styles.qtyMatchBox}>
            <MaterialIcons name="check" size={18} color={colors.primary} />
            <Text style={styles.qtyMatchText}>Quantity matched perfectly</Text>
          </View>
        </AppCard>

        {/* Today's Delivery Earnings Breakdown Hero Card */}
        <View style={styles.earningsHeroCard}>
          <View style={styles.earningsHeroTop}>
            <Text style={styles.earningsHeroSubtitle}>Today's Delivery Earnings</Text>
            <Text style={styles.earningsHeroPrice}>₹{delivery?.earning || 95}</Text>
          </View>

          <View style={styles.earningsBreakdown}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownItem}>Base Pay</Text>
              <Text style={styles.breakdownPrice}>₹75</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownItem}>Distance (11.2km)</Text>
              <Text style={styles.breakdownPrice}>₹10</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownItem}>
                <MaterialIcons name="star" size={14} color={colors.white} /> Smart Route Bonus
              </Text>
              <Text style={[styles.breakdownPrice, { color: colors.white }]}>
                +₹10
              </Text>
            </View>
          </View>

          <View style={styles.walletCreditNotice}>
            <MaterialIcons name="account-balance-wallet" size={18} color={colors.white} />
            <Text style={styles.walletCreditText}>
              Payment successfully added to your daily earnings balance.
            </Text>
          </View>
        </View>

        {/* Daily Target Progress Card */}
        <AppCard style={styles.card}>
          <View style={styles.targetRow}>
            <View>
              <Text style={styles.targetCount}>19 / 20</Text>
              <Text style={styles.targetLabel}>Deliveries Today</Text>
            </View>
            <View style={styles.targetRatingBadge}>
              <MaterialIcons name="star" size={16} color={colors.tertiaryContainer} />
              <Text style={styles.targetRatingText}>4.8</Text>
            </View>
          </View>

          <View style={styles.targetProgressTrack}>
            <View style={[styles.targetProgressBar, { width: '95%' }]} />
          </View>
          <Text style={styles.targetCheerText}>
            Great job, Rahul! Just <Text style={{ fontWeight: '700' }}>1 more delivery</Text> to reach today's target.
          </Text>
        </AppCard>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {!isCompleted ? (
            <AppButton
              title="Confirm & Submit POD"
              onPress={handleConfirmPOD}
              loading={submitting}
              style={{ width: '100%', marginBottom: 12 }}
            />
          ) : (
            <>
              <AppButton
                title="View Today's Earnings"
                onPress={() =>
                  navigation.navigate(ROUTES.MAIN_TABS, { screen: ROUTES.EARNINGS })
                }
                style={{ width: '100%', marginBottom: 10 }}
              />
              <AppButton
                title="Back to Deliveries"
                variant="outline"
                onPress={() =>
                  navigation.navigate(ROUTES.MAIN_TABS, { screen: ROUTES.DELIVERIES })
                }
                style={{ width: '100%' }}
              />
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.containerMargin,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.headlineSm,
    color: colors.onSurface,
  },
  orderBadge: {
    backgroundColor: colors.surfaceContainer,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  orderBadgeText: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
  },
  scrollContent: {
    padding: spacing.containerMargin,
    paddingBottom: 40,
  },
  celebrationHero: {
    alignItems: 'center',
    marginVertical: 12,
  },
  celebrationCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(0, 81, 41, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  heroTitle: {
    ...typography.headlineLgMobile,
    color: colors.onSurface,
  },
  heroSub: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    marginBottom: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardTitle: {
    ...typography.headlineSm,
    fontSize: 16,
    color: colors.onSurface,
  },
  deliveredChip: {
    backgroundColor: 'rgba(0, 81, 41, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  deliveredChipText: {
    ...typography.labelSm,
    fontSize: 10,
    color: colors.primary,
    fontWeight: '700',
  },
  cargoSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cargoThumb: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cargoName: {
    ...typography.labelLg,
    color: colors.onSurface,
  },
  routeSummary: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  statsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainer,
    borderRadius: borderRadius.md,
    padding: 10,
    marginTop: 12,
  },
  statStripItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  statStripText: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
  },
  stripDivider: {
    width: 1,
    height: 18,
    backgroundColor: colors.outlineVariant,
  },
  otpSection: {
    alignItems: 'center',
    marginVertical: 8,
  },
  otpPrompt: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
    marginBottom: 10,
  },
  otpInputsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  otpBox: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceContainer,
    textAlign: 'center',
    ...typography.headlineMd,
    color: colors.onSurface,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
  },
  resendText: {
    ...typography.labelSm,
    color: colors.primary,
    marginTop: 10,
    fontWeight: '700',
  },
  confirmCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 8,
  },
  confirmCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmCheckboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  confirmLabel: {
    ...typography.bodyMd,
    color: colors.onSurface,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLow,
    marginTop: 8,
    gap: 8,
  },
  photoButtonActive: {
    borderColor: colors.primary,
    borderStyle: 'solid',
    backgroundColor: 'rgba(0, 81, 41, 0.06)',
  },
  photoText: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
  },
  qtyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  qtyLabel: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    marginBottom: 2,
  },
  qtyVal: {
    ...typography.headlineMd,
    color: colors.onSurface,
  },
  qtyDivider: {
    width: 30,
    height: 1,
    backgroundColor: colors.outlineVariant,
  },
  qtyMatchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 81, 41, 0.1)',
    borderRadius: borderRadius.md,
    padding: 10,
    marginTop: 12,
  },
  qtyMatchText: {
    ...typography.labelMd,
    color: colors.primary,
    fontWeight: '600',
  },
  earningsHeroCard: {
    backgroundColor: colors.primaryContainer,
    borderRadius: borderRadius.xl,
    padding: 18,
    marginBottom: 14,
    ...shadows.md,
  },
  earningsHeroTop: {
    marginBottom: 10,
  },
  earningsHeroSubtitle: {
    ...typography.labelMd,
    color: colors.onPrimaryContainer,
    opacity: 0.9,
  },
  earningsHeroPrice: {
    ...typography.headlineLg,
    color: colors.tertiaryFixed,
    fontSize: 32,
    marginTop: 2,
  },
  earningsBreakdown: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    paddingTop: 10,
    gap: 6,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  breakdownItem: {
    ...typography.bodySm,
    color: colors.onPrimary,
    opacity: 0.9,
  },
  breakdownPrice: {
    ...typography.labelMd,
    color: colors.onPrimary,
  },
  walletCreditNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    padding: 10,
    borderRadius: borderRadius.md,
    marginTop: 12,
  },
  walletCreditText: {
    ...typography.labelSm,
    fontSize: 11,
    color: colors.onPrimary,
    flex: 1,
  },
  targetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  targetCount: {
    ...typography.headlineSm,
    color: colors.onSurface,
  },
  targetLabel: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
  },
  targetRatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(122, 87, 0, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  targetRatingText: {
    ...typography.labelSm,
    color: colors.tertiaryContainer,
    fontWeight: '700',
  },
  targetProgressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceContainer,
    overflow: 'hidden',
    marginBottom: 8,
  },
  targetProgressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  targetCheerText: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  actionsContainer: {
    marginTop: 8,
  },
});

export default PODScreen;
