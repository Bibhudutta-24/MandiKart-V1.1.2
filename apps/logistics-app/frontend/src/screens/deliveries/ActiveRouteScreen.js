import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, borderRadius, shadows, spacing } from '../../theme';
import AppButton from '../../components/common/AppButton';
import AppCard from '../../components/common/AppCard';
import OSMMapView from '../../components/delivery/OSMMapView';
import DeliveryStepper from '../../components/delivery/DeliveryStepper';
import { useDelivery } from '../../context/DeliveryContext';
import { ROUTES } from '../../navigation/routes';

export const ActiveRouteScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { activeDelivery, deliveryStage, updateStage } = useDelivery();

  const [currentStage, setCurrentStage] = useState(deliveryStage || 'IN_TRANSIT');

  const delivery = activeDelivery;

  const handleCall = (phoneNumber, name) => {
    if (!phoneNumber) {
      Alert.alert('Contact', `Calling ${name}...`);
      return;
    }
    Linking.openURL(`tel:${phoneNumber}`).catch(() => {
      Alert.alert('Call', `Dialing ${phoneNumber}`);
    });
  };

  const handleActionStep = async () => {
    if (currentStage === 'PICKUP') {
      await updateStage('IN_TRANSIT');
      setCurrentStage('IN_TRANSIT');
      Alert.alert('Cargo Picked Up', 'Produce loaded successfully. Now heading to destination yard.');
    } else if (currentStage === 'IN_TRANSIT') {
      await updateStage('DESTINATION');
      setCurrentStage('DESTINATION');
      Alert.alert('Arrived at Destination', 'You have arrived at Central Market. Collect delivery OTP and verify cargo.');
    } else {
      // Proceed to POD
      navigation.navigate(ROUTES.POD, { deliveryId: delivery.id });
    }
  };

  const getActionButtonTitle = () => {
    switch (currentStage) {
      case 'PICKUP':
        return 'Arrived at Pickup';
      case 'IN_TRANSIT':
        return 'Arrived at Destination';
      case 'DESTINATION':
      default:
        return 'Proceed to Proof of Delivery';
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <View style={styles.brandRow}>
          <View style={styles.brandIcon}>
            <MaterialIcons name="agriculture" size={18} color={colors.onPrimary} />
          </View>
          <Text style={styles.headerTitle}>Active Tracking</Text>
        </View>
        <TouchableOpacity
          style={styles.exceptionIconBtn}
          onPress={() =>
            navigation.navigate(ROUTES.DELIVERY_EXCEPTION, { deliveryId: delivery?.id })
          }
          activeOpacity={0.7}
        >
          <MaterialIcons name="report-problem" size={22} color={colors.error} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Order Status Banner */}
        <View style={styles.statusBanner}>
          <View>
            <Text style={styles.orderNumberText}>Order #{delivery?.id || 'MK10284'}</Text>
            <Text style={styles.activeLabelText}>Active Delivery</Text>
          </View>
          <View style={styles.pulseBadge}>
            <View style={styles.pulseDot} />
            <Text style={styles.pulseText}>
              {currentStage === 'PICKUP'
                ? 'AT PICKUP'
                : currentStage === 'IN_TRANSIT'
                ? 'IN TRANSIT'
                : 'AT DESTINATION'}
            </Text>
          </View>
        </View>

        {/* Modular OpenStreetMap Routing Component */}
        <OSMMapView
          pickupLocation={delivery?.pickup}
          destinationLocation={delivery?.destination}
          driverLocation={delivery?.driverLocation}
          routeInfo={{
            duration: '14 min',
            distance: `${delivery?.distanceKm || 8.4} km`,
            fuelSaved: '₹32 fuel saved',
          }}
          onRecenter={() =>
            Alert.alert('GPS Centered', 'Map view recentered to your live bike coordinates.')
          }
        />

        {/* Milestone Route Stepper Card */}
        <View style={styles.milestoneCard}>
          <Text style={styles.milestoneTitle}>Route Milestones</Text>
          <DeliveryStepper
            orientation="vertical"
            stage={currentStage}
            milestones={delivery?.routeMilestones}
          />
        </View>

        {/* Cargo & Earnings Overview */}
        <AppCard style={styles.cargoCard}>
          <View style={styles.cargoTopRow}>
            <View>
              <Text style={styles.cargoSub}>CARGO</Text>
              <Text style={styles.cargoTitle}>
                {delivery?.title} ({delivery?.weight})
              </Text>
            </View>
            <View style={styles.earningBox}>
              <Text style={styles.earningLabel}>EARNING</Text>
              <Text style={styles.earningAmount}>₹{delivery?.earning}</Text>
            </View>
          </View>

          <View style={styles.cargoDivider} />

          {/* Quick Contact Buttons Row */}
          <View style={styles.contactRow}>
            <TouchableOpacity
              style={styles.contactAction}
              onPress={() => handleCall(delivery?.pickup?.phone, 'Farmer')}
              activeOpacity={0.7}
            >
              <MaterialIcons name="call" size={20} color={colors.secondary} />
              <Text style={styles.contactActionText}>Farmer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactAction}
              onPress={() => handleCall(delivery?.destination?.phone, 'Buyer')}
              activeOpacity={0.7}
            >
              <MaterialIcons name="local-shipping" size={20} color={colors.secondary} />
              <Text style={styles.contactActionText}>Buyer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactAction}
              onPress={() => navigation.navigate(ROUTES.SUPPORT)}
              activeOpacity={0.7}
            >
              <MaterialIcons name="support-agent" size={20} color={colors.error} />
              <Text style={styles.contactActionText}>Support</Text>
            </TouchableOpacity>
          </View>
        </AppCard>

        {/* Report Delivery Exception CTA */}
        <TouchableOpacity
          style={styles.exceptionBtn}
          onPress={() =>
            navigation.navigate(ROUTES.DELIVERY_EXCEPTION, { deliveryId: delivery?.id })
          }
          activeOpacity={0.8}
        >
          <MaterialIcons name="warning" size={18} color={colors.error} />
          <Text style={styles.exceptionBtnText}>
            Issue with produce, weight, or recipient? Report Exception
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Sticky Bottom Action */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        <AppButton
          title={getActionButtonTitle()}
          iconRight="arrow-forward"
          onPress={handleActionStep}
          style={styles.actionBtn}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
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
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exceptionIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(186, 26, 26, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.headlineSm,
    color: colors.onSurface,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceContainerLow,
    paddingHorizontal: spacing.containerMargin,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  orderNumberText: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
  },
  activeLabelText: {
    ...typography.headlineSm,
    color: colors.primary,
    marginTop: 2,
  },
  pulseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 81, 41, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    gap: 6,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  pulseText: {
    ...typography.labelSm,
    fontSize: 11,
    color: colors.primary,
    fontWeight: '700',
  },
  milestoneCard: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: borderRadius.xl,
    padding: 16,
    marginHorizontal: spacing.containerMargin,
    marginTop: -12,
    zIndex: 30,
    ...shadows.sm,
  },
  milestoneTitle: {
    ...typography.headlineSm,
    fontSize: 16,
    color: colors.onSurface,
    marginBottom: 10,
  },
  cargoCard: {
    marginHorizontal: spacing.containerMargin,
    marginTop: 14,
    padding: 16,
  },
  cargoTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cargoSub: {
    ...typography.labelSm,
    fontSize: 10,
    color: colors.onSurfaceVariant,
  },
  cargoTitle: {
    ...typography.headlineSm,
    color: colors.onSurface,
    marginTop: 2,
  },
  earningBox: {
    backgroundColor: 'rgba(174, 238, 191, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    alignItems: 'flex-end',
  },
  earningLabel: {
    ...typography.labelSm,
    fontSize: 9,
    color: colors.secondary,
  },
  earningAmount: {
    ...typography.headlineSm,
    color: colors.primary,
  },
  cargoDivider: {
    height: 1,
    backgroundColor: colors.surfaceVariant,
    marginVertical: 12,
  },
  contactRow: {
    flexDirection: 'row',
    gap: 10,
  },
  contactAction: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: borderRadius.md,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  contactActionText: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
  },
  exceptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: spacing.containerMargin,
    marginTop: 14,
    padding: 12,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(186, 26, 26, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(186, 26, 26, 0.2)',
  },
  exceptionBtnText: {
    ...typography.bodySm,
    fontSize: 12,
    color: colors.error,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.containerMargin,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
    ...shadows.lg,
  },
  actionBtn: {
    width: '100%',
  },
});

export default ActiveRouteScreen;
