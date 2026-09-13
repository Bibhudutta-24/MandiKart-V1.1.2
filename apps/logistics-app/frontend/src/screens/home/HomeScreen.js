import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { colors, typography, borderRadius, shadows, spacing } from '../../theme';
import AppHeader from '../../components/common/AppHeader';
import { CollapsibleHeaderLayout } from '../../components/common/CollapsibleHeaderLayout';
import AppButton from '../../components/common/AppButton';
import DeliveryStepper from '../../components/delivery/DeliveryStepper';
import { useAuth } from '../../context/AuthContext';
import { useDelivery } from '../../context/DeliveryContext';
import { useTheme } from '../../context/ThemeContext';
import { earningsService } from '../../services/earningsService';
import { getTimeGreeting } from '../../utils/formatters';
import { ROUTES } from '../../navigation/routes';

export const HomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { isDarkMode, colors: themeColors } = useTheme();
  const { partner, isOnline } = useAuth();
  const { deliveries, activeDelivery, acceptDelivery, refreshDeliveries } = useDelivery();

  const [refreshing, setRefreshing] = useState(false);
  const [greeting, setGreeting] = useState(() => getTimeGreeting());
  const [earningsData, setEarningsData] = useState(() => earningsService.getLocalSummary());

  const loadEarnings = async () => {
    try {
      const data = await earningsService.getEarningsSummary();
      if (data) {
        setEarningsData(data);
      }
    } catch (e) {
      console.log('Home earnings sync notice:', e.message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadEarnings();
    }, [])
  );

  useEffect(() => {
    setGreeting(getTimeGreeting());
    loadEarnings();
    const timer = setInterval(() => {
      setGreeting(getTimeGreeting());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshDeliveries(), loadEarnings()]);
    setRefreshing(false);
  };

  const handleAcceptNearby = async (id) => {
    try {
      await acceptDelivery(id);
      Alert.alert(
        'Delivery Accepted',
        'Order accepted! You can now start the pickup navigation.',
        [
          {
            text: 'Open Active Route',
            onPress: () => navigation.navigate(ROUTES.ACTIVE_ROUTE),
          },
          { text: 'OK' },
        ]
      );
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to accept delivery.');
    }
  };

  const availableDeliveries = deliveries.filter((d) => d.status === 'AVAILABLE').slice(0, 2);

  return (
    <CollapsibleHeaderLayout
      header={
        <AppHeader
          title={`${greeting}, ${partner?.name?.split(' ')[0] || 'Rahul'} 👋`}
        />
      }
      headerHeight={110}
    >

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { backgroundColor: themeColors.background }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[themeColors.primary]}
          />
        }
      >
        {/* Offline Warning Banner if Offline */}
        {!isOnline && (
          <View
            style={[
              styles.offlineBanner,
              isDarkMode && {
                backgroundColor: '#2D1B05',
                borderColor: '#78350F',
                borderWidth: 1,
              },
            ]}
          >
            <MaterialIcons
              name="cloud-off"
              size={18}
              color={isDarkMode ? '#FDE68A' : colors.tertiaryContainer}
            />
            <Text
              style={[
                styles.offlineText,
                isDarkMode && { color: '#FDE68A' },
              ]}
            >
              You are currently OFFLINE. Toggle switch above to receive new orders.
            </Text>
          </View>
        )}

        {/* Today's Earnings Hero Card */}
        {(() => {
          const todayEarnings =
            earningsData?.todaySummary?.totalEarnings ||
            earningsData?.today?.total ||
            720;
          const completedCount =
            earningsData?.todaySummary?.deliveriesCompleted ||
            earningsData?.today?.trips ||
            18;
          const distanceKm =
            earningsData?.todaySummary?.distanceKm || 64.0;
          const onlineTimeStr =
            earningsData?.todaySummary?.onlineTimeStr || '7h 20m';
          const availableBalance =
            earningsData?.availableBalance ?? 2860;
          const percentChange =
            earningsData?.todaySummary?.percentChange || 12;

          return (
            <>
              <TouchableOpacity
                style={[
                  styles.earningsHeroCard,
                  {
                    backgroundColor: isDarkMode ? '#062E19' : '#00502a',
                    borderWidth: isDarkMode ? 1.5 : 0,
                    borderColor: isDarkMode ? '#00E676' : 'transparent',
                    shadowColor: isDarkMode ? '#00E676' : '#00502a',
                    shadowOpacity: isDarkMode ? 0.2 : 0.15,
                  },
                ]}
                onPress={() =>
                  navigation.navigate(ROUTES.MAIN_TABS, { screen: ROUTES.EARNINGS })
                }
                activeOpacity={0.9}
              >
                <View style={styles.heroDecoIcon}>
                  <MaterialIcons
                    name="payments"
                    size={110}
                    color={
                      isDarkMode
                        ? 'rgba(0, 230, 118, 0.12)'
                        : 'rgba(255, 255, 255, 0.1)'
                    }
                  />
                </View>

                <View style={styles.heroContent}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={[
                        styles.heroSubtitle,
                        { color: isDarkMode ? '#A7F3D0' : '#E8FFF3' },
                      ]}
                    >
                      Today's Earnings
                    </Text>

                    {/* Available Wallet Balance Pill */}
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: isDarkMode
                          ? 'rgba(0, 230, 118, 0.18)'
                          : 'rgba(255, 255, 255, 0.22)',
                        paddingHorizontal: 9,
                        paddingVertical: 3,
                        borderRadius: 14,
                        gap: 4,
                      }}
                    >
                      <MaterialIcons
                        name="account-balance-wallet"
                        size={13}
                        color={isDarkMode ? '#00E676' : '#FFFFFF'}
                      />
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: '700',
                          color: isDarkMode ? '#00E676' : '#FFFFFF',
                        }}
                      >
                        Wallet: ₹{availableBalance}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.heroPriceRow}>
                    <Text
                      style={[
                        styles.heroAmount,
                        { color: '#FFFFFF', fontWeight: '800' },
                      ]}
                    >
                      ₹{todayEarnings}
                    </Text>
                    <View
                      style={[
                        styles.growthBadge,
                        {
                          backgroundColor: isDarkMode ? 'rgba(0, 230, 118, 0.25)' : 'rgba(255, 255, 255, 0.22)',
                          borderColor: isDarkMode ? 'rgba(0, 230, 118, 0.5)' : 'rgba(255, 255, 255, 0.4)',
                          borderWidth: 1,
                        },
                      ]}
                    >
                      <MaterialIcons
                        name="arrow-upward"
                        size={12}
                        color={isDarkMode ? '#00E676' : '#FFFFFF'}
                      />
                      <Text
                        style={[
                          styles.growthText,
                          { color: isDarkMode ? '#00E676' : '#FFFFFF' },
                        ]}
                      >
                        {percentChange}% from yesterday
                      </Text>
                    </View>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: 4,
                    }}
                  >
                    <Text
                      style={[
                        styles.heroCountText,
                        { color: isDarkMode ? '#A7F3D0' : 'rgba(255, 255, 255, 0.95)' },
                      ]}
                    >
                      {completedCount} deliveries completed
                    </Text>
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: '700',
                        color: isDarkMode ? '#00E676' : '#FFFFFF',
                      }}
                    >
                      View Details →
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Quick Stats Grid (Completed, Distance, Online Time) */}
              <View style={styles.statsGrid}>
                <View
                  style={[
                    styles.statCard,
                    {
                      backgroundColor: themeColors.card,
                      borderColor: isDarkMode
                        ? themeColors.border
                        : colors.outlineVariant,
                      borderWidth: 1,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.statIconCircle,
                      {
                        backgroundColor: isDarkMode
                          ? 'rgba(0, 230, 118, 0.15)'
                          : 'rgba(0, 81, 41, 0.1)',
                      },
                    ]}
                  >
                    <MaterialIcons
                      name="check-circle"
                      size={18}
                      color={themeColors.primary}
                    />
                  </View>
                  <Text
                    style={[
                      styles.statNum,
                      { color: themeColors.textPrimary },
                    ]}
                  >
                    {completedCount}
                  </Text>
                  <Text
                    style={[
                      styles.statLabel,
                      { color: themeColors.textSecondary },
                    ]}
                  >
                    Completed
                  </Text>
                </View>

                <View
                  style={[
                    styles.statCard,
                    {
                      backgroundColor: themeColors.card,
                      borderColor: isDarkMode
                        ? themeColors.border
                        : colors.outlineVariant,
                      borderWidth: 1,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.statIconCircle,
                      {
                        backgroundColor: isDarkMode
                          ? 'rgba(0, 230, 118, 0.15)'
                          : 'rgba(0, 81, 41, 0.1)',
                      },
                    ]}
                  >
                    <MaterialIcons
                      name="route"
                      size={18}
                      color={themeColors.primary}
                    />
                  </View>
                  <Text
                    style={[
                      styles.statNum,
                      { color: themeColors.textPrimary },
                    ]}
                  >
                    {distanceKm}
                  </Text>
                  <Text
                    style={[
                      styles.statLabel,
                      { color: themeColors.textSecondary },
                    ]}
                  >
                    Distance (km)
                  </Text>
                </View>

                <View
                  style={[
                    styles.statCard,
                    {
                      backgroundColor: themeColors.card,
                      borderColor: isDarkMode
                        ? themeColors.border
                        : colors.outlineVariant,
                      borderWidth: 1,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.statIconCircle,
                      {
                        backgroundColor: isDarkMode
                          ? 'rgba(0, 230, 118, 0.15)'
                          : 'rgba(0, 81, 41, 0.1)',
                      },
                    ]}
                  >
                    <MaterialIcons
                      name="schedule"
                      size={18}
                      color={themeColors.primary}
                    />
                  </View>
                  <Text
                    style={[
                      styles.statNum,
                      { color: themeColors.textPrimary },
                    ]}
                  >
                    {onlineTimeStr}
                  </Text>
                  <Text
                    style={[
                      styles.statLabel,
                      { color: themeColors.textSecondary },
                    ]}
                  >
                    Online Time
                  </Text>
                </View>
              </View>
            </>
          );
        })()}

        {/* Active Delivery Section */}
        {activeDelivery && activeDelivery.status !== 'COMPLETED' ? (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>Active Delivery</Text>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate(ROUTES.MAIN_TABS, { screen: ROUTES.DELIVERIES })
                }
                activeOpacity={0.7}
              >
                <Text style={[styles.viewAllLink, { color: themeColors.primary }]}>
                  View All <MaterialIcons name="arrow-forward" size={14} />
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.activeCard,
                {
                  backgroundColor: themeColors.card,
                  borderColor: isDarkMode ? themeColors.border : colors.outlineVariant,
                },
              ]}
            >
              <View
                style={[
                  styles.activeTopBar,
                  { backgroundColor: themeColors.primary },
                ]}
              />

              <View style={styles.activeHeader}>
                <View>
                  <Text style={[styles.orderNumber, { color: themeColors.textSecondary }]}>Order #{activeDelivery.id}</Text>
                  <Text style={[styles.activeTitle, { color: themeColors.textPrimary }]}>
                    {activeDelivery.title}{' '}
                    <Text style={[styles.activeWeight, { color: themeColors.textSecondary }]}>({activeDelivery.weight})</Text>
                  </Text>
                </View>
                <View
                  style={[
                    styles.activePriceTag,
                    { backgroundColor: isDarkMode ? 'rgba(0, 230, 118, 0.18)' : 'rgba(0, 81, 41, 0.1)' },
                  ]}
                >
                  <Text style={[styles.activePriceText, { color: themeColors.primary }]}>₹{activeDelivery.earning}</Text>
                </View>
              </View>

              {/* Route Summary Box */}
              <View
                style={[
                  styles.routeBox,
                  {
                    backgroundColor: isDarkMode ? themeColors.surfaceContainerHigh : colors.surfaceContainerLowest,
                    borderColor: isDarkMode ? themeColors.border : 'transparent',
                    borderWidth: isDarkMode ? 1 : 0,
                  },
                ]}
              >
                <View style={styles.routeRow}>
                  <MaterialIcons name="storefront" size={18} color={themeColors.primary} />
                  <View style={styles.routeTextCol}>
                    <Text style={[styles.routeTypeLabel, { color: themeColors.textSecondary }]}>Pickup</Text>
                    <Text style={[styles.routeNameText, { color: themeColors.textPrimary }]}>{activeDelivery.pickup?.name}</Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.connectorLine,
                    { backgroundColor: isDarkMode ? themeColors.border : colors.outlineVariant },
                  ]}
                />

                <View style={styles.routeRow}>
                  <MaterialIcons name="location-on" size={18} color={colors.error} />
                  <View style={styles.routeTextCol}>
                    <Text style={[styles.routeTypeLabel, { color: themeColors.textSecondary }]}>Destination</Text>
                    <Text style={[styles.routeNameText, { color: themeColors.textPrimary }]}>
                      {activeDelivery.destination?.name}
                    </Text>
                    <Text style={[styles.routeDistanceText, { color: themeColors.textSecondary }]}>
                      {activeDelivery.distanceKm} km away
                    </Text>
                  </View>
                </View>
              </View>

              {/* Stepper Progress */}
              <DeliveryStepper stage={activeDelivery.statusStep || 'IN_TRANSIT'} />

              {/* Open Delivery CTA */}
              <AppButton
                title="Open Delivery"
                iconRight="launch"
                onPress={() => navigation.navigate(ROUTES.ACTIVE_ROUTE)}
                style={styles.openDeliveryBtn}
              />
            </View>
          </View>
        ) : null}

        {/* Available Deliveries Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>Available Deliveries</Text>
              <Text style={[styles.sectionSubtitle, { color: themeColors.textSecondary }]}>New opportunities near you</Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate(ROUTES.MAIN_TABS, { screen: ROUTES.DELIVERIES })
              }
              activeOpacity={0.7}
            >
              <Text style={[styles.viewAllLink, { color: themeColors.primary }]}>See All</Text>
            </TouchableOpacity>
          </View>

          {availableDeliveries.map((delivery) => (
            <View
              key={delivery.id}
              style={[
                styles.availableCard,
                {
                  backgroundColor: themeColors.card,
                  borderColor: isDarkMode ? themeColors.border : colors.outlineVariant,
                  borderWidth: 1,
                },
              ]}
            >
              <View style={styles.availLeftCol}>
                <View
                  style={[
                    styles.cropIconWrapper,
                    isDarkMode && {
                      backgroundColor: '#062E19',
                      borderWidth: 1,
                      borderColor: '#00E676',
                    },
                  ]}
                >
                  <MaterialIcons
                    name="eco"
                    size={24}
                    color={isDarkMode ? '#00E676' : colors.white}
                  />
                </View>
                <View>
                  <Text style={[styles.availTitle, { color: themeColors.textPrimary }]}>{delivery.title}</Text>
                  <Text style={[styles.availSub, { color: themeColors.textSecondary }]}>
                    {delivery.weight} • {delivery.distanceKm} km
                  </Text>
                </View>
              </View>

              <View style={styles.availRightCol}>
                <Text style={[styles.availPrice, { color: themeColors.primary }]}>₹{delivery.earning}</Text>
                <TouchableOpacity
                  style={[
                    styles.quickAcceptBtn,
                    {
                      backgroundColor: themeColors.primary,
                    },
                  ]}
                  onPress={() => handleAcceptNearby(delivery.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.quickAcceptText, { color: themeColors.onPrimary }]}>Accept</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Daily Performance Card */}
        <View
          style={[
            styles.performanceCard,
            {
              backgroundColor: themeColors.card,
              borderColor: isDarkMode ? themeColors.border : colors.outlineVariant,
              borderWidth: 1,
            },
          ]}
        >
          <Text style={[styles.perfTitle, { color: themeColors.textPrimary }]}>Your Performance</Text>

          <View style={styles.perfMetricsRow}>
            <View>
              <Text style={[styles.perfLabel, { color: themeColors.textSecondary }]}>Deliveries</Text>
              <Text style={[styles.perfVal, { color: themeColors.textPrimary }]}>
                18 <Text style={[styles.perfValSub, { color: themeColors.textSecondary }]}>/ 20</Text>
              </Text>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.perfLabel, { color: themeColors.textSecondary }]}>On-time rate</Text>
              <Text style={[styles.perfVal, { color: themeColors.primary }]}>96%</Text>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.perfLabel, { color: themeColors.textSecondary }]}>Rating</Text>
              <Text style={[styles.perfVal, { color: themeColors.textPrimary }]}>
                4.8{' '}
                <MaterialIcons name="star" size={16} color={colors.tertiaryFixedDim} />
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View
            style={[
              styles.progressTrack,
              { backgroundColor: isDarkMode ? themeColors.surfaceContainerHigh : colors.surfaceContainer },
            ]}
          >
            <View style={[styles.progressBar, { width: '90%', backgroundColor: themeColors.primary }]} />
          </View>

          <View
            style={[
              styles.perfTipRow,
              {
                backgroundColor: isDarkMode ? themeColors.surfaceContainerHigh : colors.surfaceContainerLow,
              },
            ]}
          >
            <MaterialIcons name="emoji-events" size={18} color={colors.tertiaryFixedDim} />
            <Text style={[styles.perfTipText, { color: themeColors.textSecondary }]}>
              Great work! 2 more deliveries to reach today's target.
            </Text>
          </View>
        </View>
      </ScrollView>
    </CollapsibleHeaderLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.containerMargin,
    paddingTop: 14,
    paddingBottom: 28,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.tertiaryFixed,
    padding: 10,
    borderRadius: borderRadius.md,
    marginBottom: 12,
    gap: 8,
  },
  offlineText: {
    ...typography.bodySm,
    color: colors.onTertiaryFixed,
    flex: 1,
  },
  earningsHeroCard: {
    backgroundColor: colors.primaryContainer,
    borderRadius: borderRadius.lg,
    padding: 18,
    position: 'relative',
    overflow: 'hidden',
    ...shadows.md,
    marginBottom: 16,
  },
  heroDecoIcon: {
    position: 'absolute',
    right: -20,
    top: -20,
  },
  heroContent: {
    zIndex: 2,
  },
  heroSubtitle: {
    ...typography.labelSm,
    color: 'rgba(255, 255, 255, 0.85)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
    marginTop: 4,
  },
  heroAmount: {
    ...typography.headlineLg,
    fontSize: 34,
    color: colors.onPrimary,
  },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(248, 189, 69, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 3,
  },
  growthText: {
    ...typography.labelSm,
    fontSize: 10,
    color: colors.white,
    fontWeight: '700',
  },
  heroCountText: {
    ...typography.bodyMd,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 6,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: borderRadius.md,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  statIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 81, 41, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statNum: {
    ...typography.headlineSm,
    color: colors.onSurface,
  },
  statLabel: {
    ...typography.labelSm,
    fontSize: 10,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    ...typography.headlineMd,
    color: colors.onSurface,
  },
  sectionSubtitle: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    marginTop: 1,
  },
  viewAllLink: {
    ...typography.labelMd,
    color: colors.primary,
    fontWeight: '600',
  },
  activeCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: borderRadius.xl,
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    ...shadows.md,
  },
  activeTopBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: colors.primary,
  },
  activeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 4,
    marginBottom: 10,
  },
  orderNumber: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
  },
  activeTitle: {
    ...typography.headlineMd,
    color: colors.onSurface,
    marginTop: 2,
  },
  activeWeight: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    fontWeight: 'normal',
  },
  activePriceTag: {
    backgroundColor: 'rgba(0, 81, 41, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  activePriceText: {
    ...typography.headlineSm,
    color: colors.primary,
  },
  routeBox: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: borderRadius.md,
    padding: 12,
    marginVertical: 10,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  routeTextCol: {
    flex: 1,
  },
  routeTypeLabel: {
    ...typography.labelSm,
    fontSize: 10,
    color: colors.onSurfaceVariant,
  },
  routeNameText: {
    ...typography.bodyMd,
    color: colors.onSurface,
    fontWeight: '600',
  },
  routeDistanceText: {
    ...typography.bodySm,
    fontSize: 11,
    color: colors.onSurfaceVariant,
    marginTop: 1,
  },
  connectorLine: {
    width: 2,
    height: 12,
    backgroundColor: colors.outlineVariant,
    marginLeft: 8,
    marginVertical: 2,
  },
  openDeliveryBtn: {
    marginTop: 12,
  },
  availableCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: borderRadius.lg,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    ...shadows.sm,
  },
  availLeftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  cropIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  availTitle: {
    ...typography.headlineSm,
    fontSize: 16,
    color: colors.onSurface,
  },
  availSub: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  availRightCol: {
    alignItems: 'flex-end',
    gap: 6,
  },
  availPrice: {
    ...typography.headlineSm,
    color: colors.primary,
  },
  quickAcceptBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: borderRadius.sm,
    backgroundColor: 'rgba(0, 81, 41, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 81, 41, 0.2)',
  },
  quickAcceptText: {
    ...typography.labelSm,
    color: colors.primary,
    fontWeight: '700',
  },
  performanceCard: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: borderRadius.xl,
    padding: 16,
    marginBottom: 20,
  },
  perfTitle: {
    ...typography.headlineMd,
    color: colors.onSurface,
    marginBottom: 10,
  },
  perfMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  perfLabel: {
    ...typography.labelSm,
    fontSize: 11,
    color: colors.onSurfaceVariant,
  },
  perfVal: {
    ...typography.headlineSm,
    color: colors.onSurface,
    marginTop: 2,
  },
  perfValSub: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    fontWeight: 'normal',
  },
  progressTrack: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceVariant,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  perfTipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0, 81, 41, 0.05)',
    padding: 8,
    borderRadius: borderRadius.sm,
  },
  perfTipText: {
    ...typography.bodySm,
    fontSize: 11,
    color: colors.onSurfaceVariant,
    flex: 1,
  },
});

export default HomeScreen;
