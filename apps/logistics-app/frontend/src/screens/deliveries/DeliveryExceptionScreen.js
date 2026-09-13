import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { AppHeader } from '../../components/common/AppHeader';
import { CollapsibleHeaderLayout } from '../../components/common/CollapsibleHeaderLayout';
import { AppButton } from '../../components/common/AppButton';
import { AppCard } from '../../components/common/AppCard';
import { useDelivery } from '../../context/DeliveryContext';
import { ROUTES } from '../../navigation/routes';

const EXCEPTION_REASONS = [
  { id: 'recipient_unavailable', label: 'Recipient / Mandi Trader Unavailable', icon: 'account-alert' },
  { id: 'damaged_produce', label: 'Damaged / Spoiled Produce', icon: 'food-apple' },
  { id: 'wrong_quantity', label: 'Weight / Crate Mismatch at Pickup', icon: 'scale-balance' },
  { id: 'vehicle_breakdown', label: 'Vehicle Breakdown or Puncture', icon: 'car-wrench' },
  { id: 'road_blocked', label: 'Route Blocked / Weather Hazard', icon: 'road-variant' },
  { id: 'rejected_quality', label: 'Trader Rejected Quality Grade', icon: 'close-octagon' },
  { id: 'other', label: 'Other Operational Issue', icon: 'dots-horizontal-circle' },
];

export const DeliveryExceptionScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { reportException, activeDelivery } = useDelivery();

  const deliveryId = route.params?.deliveryId || activeDelivery?.id;
  const [selectedReason, setSelectedReason] = useState('damaged_produce');
  const [description, setDescription] = useState('');
  const [hasPhoto, setHasPhoto] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) {
      Alert.alert('Required', 'Please select an exception reason.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Required', 'Please add a brief explanation for the mandi dispatch team.');
      return;
    }

    setSubmitting(true);
    try {
      await reportException(deliveryId, {
        reason: selectedReason,
        description,
        evidencePhoto: hasPhoto ? 'file://evidence-photo.jpg' : null,
      });

      Alert.alert(
        'Exception Reported',
        'Your report has been dispatched to MandiKart Control Room. Our logistics coordinator will review within 5 minutes.',
        [
          {
            text: 'OK',
            onPress: () =>
              navigation.navigate(ROUTES.MAIN_TABS, { screen: ROUTES.DELIVERIES }),
          },
        ]
      );
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to report exception');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <CollapsibleHeaderLayout
        header={
          <AppHeader
            title="Report Exception"
            subtitle={`Order #${deliveryId || 'MK-0000'}`}
            showBack
            onBackPress={() => navigation.goBack()}
          />
        }
        headerHeight={60}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        {/* Urgent notice card */}
        <View style={styles.alertBanner}>
          <MaterialCommunityIcons name="alert-circle" size={24} color={colors.error} />
          <View style={styles.alertTextWrapper}>
            <Text style={styles.alertTitle}>Agri-Cargo Issue Warning</Text>
            <Text style={styles.alertDesc}>
              Reporting an exception will alert the farmer, destination trader, and our 24x7 control room.
            </Text>
          </View>
        </View>

        {/* Reason selection */}
        <Text style={styles.sectionTitle}>SELECT REASON</Text>
        <View style={styles.reasonsList}>
          {EXCEPTION_REASONS.map((item) => {
            const isSelected = selectedReason === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.reasonCard,
                  isSelected && styles.reasonCardSelected,
                ]}
                activeOpacity={0.7}
                onPress={() => setSelectedReason(item.id)}
              >
                <View style={[
                  styles.reasonIconContainer,
                  isSelected && styles.reasonIconContainerSelected,
                ]}>
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={22}
                    color={isSelected ? colors.white : colors.primary}
                  />
                </View>
                <Text style={[
                  styles.reasonLabel,
                  isSelected && styles.reasonLabelSelected,
                ]}>
                  {item.label}
                </Text>
                <MaterialCommunityIcons
                  name={isSelected ? 'radiobox-marked' : 'radiobox-blank'}
                  size={20}
                  color={isSelected ? colors.white : colors.neutralVariant300}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Detailed Explanation */}
        <Text style={styles.sectionTitle}>EXPLANATION & FIELD NOTES</Text>
        <AppCard style={styles.notesCard}>
          <TextInput
            style={styles.textInput}
            multiline
            numberOfLines={4}
            placeholder="Explain the reason in detail (e.g. Crate 3 tomatoes crushed upon loading, trader refused receipt)..."
            placeholderTextColor={colors.textTertiary}
            value={description}
            onChangeText={setDescription}
            textAlignVertical="top"
          />
        </AppCard>

        {/* Evidence Photo */}
        <Text style={styles.sectionTitle}>EVIDENCE PHOTO (RECOMMENDED)</Text>
        <TouchableOpacity
          style={[styles.photoUploadBox, hasPhoto && styles.photoUploadBoxActive]}
          activeOpacity={0.8}
          onPress={() => setHasPhoto(!hasPhoto)}
        >
          <MaterialCommunityIcons
            name={hasPhoto ? 'check-circle' : 'camera-plus'}
            size={36}
            color={hasPhoto ? colors.primary : colors.textSecondary}
          />
          <Text style={[styles.photoUploadText, hasPhoto && styles.photoUploadTextActive]}>
            {hasPhoto ? 'Photo Attached (Tap to re-capture)' : 'Take Photo of Damaged Produce / Slip'}
          </Text>
          <Text style={styles.photoUploadSubtext}>
            {hasPhoto ? 'evidence_cargo_01.jpg • 2.4 MB' : 'Clear photo helps avoid partner penalty'}
          </Text>
        </TouchableOpacity>

        {/* Emergency Call Link */}
        <View style={styles.supportBox}>
          <MaterialCommunityIcons name="phone" size={20} color={colors.primary} />
          <Text style={styles.supportText}>
            Stuck on highway? Call Control Room directly:{' '}
            <Text
              style={styles.supportLink}
              onPress={() => navigation.navigate(ROUTES.SUPPORT)}
            >
              1800-419-AGRI
            </Text>
          </Text>
        </View>
      </ScrollView>
    </CollapsibleHeaderLayout>

      {/* Bottom Action bar */}
      <View style={styles.bottomBar}>
        <AppButton
          title="Submit Exception Report"
          variant="danger"
          loading={submitting}
          onPress={handleSubmit}
          icon="alert-octagon"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.errorContainer,
    borderRadius: spacing.radiusMd,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  alertTextWrapper: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  alertTitle: {
    ...typography.labelLarge,
    color: colors.error,
    fontWeight: '700',
  },
  alertDesc: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    marginTop: 2,
    lineHeight: 18,
  },
  sectionTitle: {
    ...typography.labelSmall,
    color: colors.textSecondary,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  reasonsList: {
    marginBottom: spacing.md,
  },
  reasonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: spacing.radiusMd,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  reasonCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryContainer,
  },
  reasonIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  reasonIconContainerSelected: {
    backgroundColor: colors.primary,
  },
  reasonLabel: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    flex: 1,
    fontWeight: '500',
  },
  reasonLabelSelected: {
    color: colors.white,
    fontWeight: '700',
  },
  notesCard: {
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  textInput: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    minHeight: 90,
  },
  photoUploadBox: {
    backgroundColor: colors.card,
    borderRadius: spacing.radiusMd,
    borderWidth: 1.5,
    borderColor: colors.borderMedium,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  photoUploadBoxActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryContainer,
    borderStyle: 'solid',
  },
  photoUploadText: {
    ...typography.labelMedium,
    color: colors.textPrimary,
    marginTop: spacing.xs,
    fontWeight: '600',
  },
  photoUploadTextActive: {
    color: colors.primary,
  },
  photoUploadSubtext: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    marginTop: 2,
  },
  supportBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: spacing.radiusMd,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  supportText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
    flex: 1,
  },
  supportLink: {
    color: colors.primary,
    fontWeight: '700',
  },
  bottomBar: {
    backgroundColor: colors.card,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
});
