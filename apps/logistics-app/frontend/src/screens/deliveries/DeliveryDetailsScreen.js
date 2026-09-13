import React from 'react';
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
import StatusBadge from '../../components/common/StatusBadge';
import AppButton from '../../components/common/AppButton';
import AppCard from '../../components/common/AppCard';
import CargoInfoCard from '../../components/delivery/CargoInfoCard';
import { useDelivery } from '../../context/DeliveryContext';
import { ROUTES } from '../../navigation/routes';

export const DeliveryDetailsScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { deliveryId } = route.params || {};
  const { deliveries, activeDelivery, acceptDelivery } = useDelivery();

  const delivery =
    deliveries.find((d) => d.id === deliveryId) || activeDelivery || deliveries[0];

  const handleCall = (phoneNumber) => {
    if (!phoneNumber) return;
    Linking.openURL(`tel:${phoneNumber}`).catch(() => {
      Alert.alert('Call', `Dialing ${phoneNumber}`);
    });
  };

  const handleAccept = async () => {
    try {
      await acceptDelivery(delivery.id);
      Alert.alert(
        'Delivery Accepted',
        'You have accepted this delivery. Proceeding to Active Route tracking.',
        [
          {
            text: 'Open Route',
            onPress: () => navigation.navigate(ROUTES.ACTIVE_ROUTE),
          },
        ]
      );
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to accept delivery.');
    }
  };

  const isAlreadyActive = delivery.status === 'ACTIVE' || delivery.status === 'IN_TRANSIT';

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
        <Text style={styles.headerTitle}>Delivery Details</Text>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() =>
            Alert.alert('Options', 'Options: Share route, Report emergency, Contact support.')
          }
          activeOpacity={0.7}
        >
          <MaterialIcons name="more-vert" size={24} color={colors.onSurface} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Order ID & Status Header */}
        <View style={styles.orderHeaderRow}>
          <Text style={styles.orderIdText}>Order #{delivery.id}</Text>
          <StatusBadge status={delivery.status} />
        </View>

        {/* Overview Card */}
        <AppCard style={styles.overviewCard}>
          <View style={styles.cardHeaderRow}>
            <View>
              <Text style={styles.cargoTitle}>{delivery.title}</Text>
              <Text style={styles.cargoWeight}>{delivery.weight} • Bulk Agri Delivery</Text>
            </View>
            <View style={styles.priceCol}>
              <Text style={styles.priceAmount}>₹{delivery.earning}</Text>
              <Text style={styles.priceSub}>Estimated Earnings</Text>
            </View>
          </View>

          <View style={styles.metricChipsRow}>
            <View style={styles.metricChip}>
              <MaterialIcons name="route" size={18} color={colors.primary} />
              <Text style={styles.metricChipText}>{delivery.distanceKm} km</Text>
            </View>
            <View style={styles.metricChip}>
              <MaterialIcons name="schedule" size={18} color={colors.primary} />
              <Text style={styles.metricChipText}>{delivery.estMinutes} min</Text>
            </View>
          </View>
        </AppCard>

        {/* Route Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Route</Text>
          <AppCard style={styles.routeCard}>
            <View style={styles.routeCol}>
              <View style={styles.iconColumn}>
                <View style={styles.originIcon}>
                  <MaterialIcons name="trip-origin" size={16} color={colors.primary} />
                </View>
                <View style={styles.pathLine} />
                <View style={styles.destIcon}>
                  <MaterialIcons name="location-on" size={18} color={colors.error} />
                </View>
              </View>

              <View style={styles.locationDetails}>
                <View style={styles.locationItem}>
                  <Text style={styles.locationRole}>PICKUP</Text>
                  <Text style={styles.locationName}>{delivery.pickup?.name}</Text>
                  <Text style={styles.locationAddress}>{delivery.pickup?.address}</Text>
                </View>

                <View style={[styles.locationItem, { marginTop: 18 }]}>
                  <Text style={styles.locationRole}>DESTINATION</Text>
                  <Text style={styles.locationName}>{delivery.destination?.name}</Text>
                  <Text style={styles.locationAddress}>
                    {delivery.destination?.address}
                  </Text>
                </View>
              </View>
            </View>
          </AppCard>
        </View>

        {/* Contacts Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contacts</Text>

          {/* Farmer Contact Card */}
          <AppCard style={styles.contactCard}>
            <View style={styles.contactLeft}>
              <View style={styles.contactAvatar}>
                <MaterialIcons name="person" size={24} color={colors.onSurfaceVariant} />
              </View>
              <View>
                <Text style={styles.contactName}>
                  {delivery.pickup?.contactName || 'Ramesh Kumar'}
                </Text>
                <Text style={styles.contactRole}>
                  Pickup Contact • {delivery.pickup?.phone || '+91 98765 43210'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.callBtn}
              onPress={() => handleCall(delivery.pickup?.phone)}
              activeOpacity={0.7}
            >
              <MaterialIcons name="call" size={20} color={colors.primary} />
            </TouchableOpacity>
          </AppCard>

          {/* Buyer Contact Card */}
          <AppCard style={styles.contactCard}>
            <View style={styles.contactLeft}>
              <View style={styles.contactAvatar}>
                <MaterialIcons name="storefront" size={24} color={colors.onSurfaceVariant} />
              </View>
              <View>
                <Text style={styles.contactName}>
                  {delivery.destination?.contactName || 'Market Buyer'}
                </Text>
                <Text style={styles.contactRole}>
                  Drop-off Contact • {delivery.destination?.phone || '+91 91234 56789'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.callBtn}
              onPress={() => handleCall(delivery.destination?.phone)}
              activeOpacity={0.7}
            >
              <MaterialIcons name="call" size={20} color={colors.primary} />
            </TouchableOpacity>
          </AppCard>
        </View>

        {/* Cargo Info Card */}
        <CargoInfoCard
          title={delivery.title}
          weight={delivery.weight}
          packaging={delivery.packaging}
          instructions={delivery.instructions}
        />

        {/* Smart Route Recommendation */}
        <View style={styles.recommendationCard}>
          <View style={styles.recommendationTop}>
            <MaterialIcons name="tips-and-updates" size={22} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.recTitle}>Smart Route Recommendation</Text>
              <Text style={styles.recText}>
                Combine with 2 nearby orders to increase estimated earnings to{' '}
                <Text style={{ fontWeight: '700', color: colors.onSurface }}>₹140</Text>.
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.recBtn}
            onPress={() =>
              Alert.alert(
                'AI Route Match',
                'Smart route optimized: Ramesh Farm -> Patia Hub -> Central Market Yard.'
              )
            }
            activeOpacity={0.8}
          >
            <Text style={styles.recBtnText}>View Optimized Route</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Sticky Bottom Actions */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        {isAlreadyActive ? (
          <AppButton
            title="Resume Active Route"
            iconRight="arrow-forward"
            onPress={() => navigation.navigate(ROUTES.ACTIVE_ROUTE)}
            style={{ flex: 1 }}
          />
        ) : (
          <View style={styles.buttonRow}>
            <AppButton
              title="Decline"
              variant="outline"
              onPress={() => {
                Alert.alert('Decline Delivery', 'Are you sure you want to decline this delivery?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Decline', style: 'destructive', onPress: () => navigation.goBack() },
                ]);
              }}
              style={styles.declineBtn}
            />
            <AppButton
              title="Accept Delivery"
              onPress={handleAccept}
              style={styles.acceptBtn}
            />
          </View>
        )}
      </View>
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
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.headlineSm,
    color: colors.onSurface,
  },
  scrollContent: {
    paddingHorizontal: spacing.containerMargin,
    paddingTop: 16,
    paddingBottom: 110,
  },
  orderHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderIdText: {
    ...typography.headlineMd,
    color: colors.onSurface,
  },
  overviewCard: {
    marginBottom: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  cargoTitle: {
    ...typography.headlineSm,
    color: colors.onSurface,
  },
  cargoWeight: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  priceCol: {
    alignItems: 'flex-end',
  },
  priceAmount: {
    ...typography.headlineLgMobile,
    color: colors.primary,
  },
  priceSub: {
    ...typography.labelSm,
    fontSize: 10,
    color: colors.onSurfaceVariant,
  },
  metricChipsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceVariant,
  },
  metricChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceContainerLow,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
  },
  metricChipText: {
    ...typography.labelMd,
    color: colors.onSurface,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    ...typography.headlineSm,
    color: colors.onSurface,
    marginBottom: 10,
  },
  routeCard: {
    padding: 16,
  },
  routeCol: {
    flexDirection: 'row',
  },
  iconColumn: {
    alignItems: 'center',
    width: 24,
    marginRight: 12,
  },
  originIcon: {
    marginTop: 2,
  },
  pathLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.primary,
    marginVertical: 4,
  },
  destIcon: {
    marginBottom: 2,
  },
  locationDetails: {
    flex: 1,
  },
  locationItem: {},
  locationRole: {
    ...typography.labelSm,
    fontSize: 10,
    color: colors.onSurfaceVariant,
  },
  locationName: {
    ...typography.bodyMd,
    color: colors.onSurface,
    fontWeight: '600',
    marginTop: 2,
  },
  locationAddress: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    marginTop: 2,
    lineHeight: 18,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    marginBottom: 8,
  },
  contactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  contactAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactName: {
    ...typography.labelMd,
    color: colors.onSurface,
    fontWeight: '700',
  },
  contactRole: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    marginTop: 1,
  },
  callBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 81, 41, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recommendationCard: {
    backgroundColor: 'rgba(0, 81, 41, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 81, 41, 0.2)',
    borderRadius: borderRadius.lg,
    padding: 14,
    marginVertical: 12,
  },
  recommendationTop: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  recTitle: {
    ...typography.labelLg,
    color: colors.onSurface,
  },
  recText: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    marginTop: 2,
    lineHeight: 18,
  },
  recBtn: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 81, 41, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: borderRadius.sm,
    marginTop: 10,
  },
  recBtnText: {
    ...typography.labelSm,
    color: colors.primary,
    fontWeight: '700',
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
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  declineBtn: {
    flex: 1,
  },
  acceptBtn: {
    flex: 2,
  },
});

export default DeliveryDetailsScreen;
