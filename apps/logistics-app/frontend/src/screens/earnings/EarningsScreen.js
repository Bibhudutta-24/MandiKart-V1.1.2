import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { AppHeader } from '../../components/common/AppHeader';
import { CollapsibleHeaderLayout } from '../../components/common/CollapsibleHeaderLayout';
import { AppButton } from '../../components/common/AppButton';
import { AppCard } from '../../components/common/AppCard';
import { earningsService } from '../../services/earningsService';
import { useTheme } from '../../context/ThemeContext';
import { formatCurrency, formatShortDate } from '../../utils/formatters';
import { ROUTES } from '../../navigation/routes';

const { width } = Dimensions.get('window');

export const EarningsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { isDarkMode, colors: themeColors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [earningsData, setEarningsData] = useState(() => earningsService.getLocalSummary());

  const fetchEarnings = useCallback(async () => {
    try {
      const data = await earningsService.getEarningsSummary();
      if (data) setEarningsData(data);
    } catch (err) {
      console.log('Earnings sync handled with offline fallback');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchEarnings();
    }, [fetchEarnings])
  );

  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEarnings();
  };

  const [selectedDayIndex, setSelectedDayIndex] = useState(3); // Thursday (Today)

  const currentMonth = earningsData?.currentMonth || { total: 4860, trips: 38, tips: 340, incentives: 520 };
  const today = earningsData?.today || { total: 720, basePay: 480, surgeBonus: 120, tips: 120, trips: 18 };
  const weekly = (earningsData?.weeklyTrend && earningsData.weeklyTrend.length > 0)
    ? earningsData.weeklyTrend
    : (earningsData?.weeklyBreakdown && earningsData.weeklyBreakdown.length > 0)
    ? earningsData.weeklyBreakdown
    : [
        { day: 'Mon', fullDay: 'Monday', date: '04 Sep', amount: 540, trips: 6, hours: '6.5h', isToday: false },
        { day: 'Tue', fullDay: 'Tuesday', date: '05 Sep', amount: 680, trips: 8, hours: '7.2h', isToday: false },
        { day: 'Wed', fullDay: 'Wednesday', date: '06 Sep', amount: 490, trips: 5, hours: '5.5h', isToday: false },
        { day: 'Thu', fullDay: 'Thursday', date: '07 Sep', amount: 920, trips: 9, hours: '8.0h', isBest: true, isToday: true },
        { day: 'Fri', fullDay: 'Friday', date: '08 Sep', amount: 760, trips: 8, hours: '7.0h', isToday: false },
        { day: 'Sat', fullDay: 'Saturday', date: '09 Sep', amount: 650, trips: 7, hours: '6.2h', isToday: false },
        { day: 'Sun', fullDay: 'Sunday', date: '10 Sep', amount: 820, trips: 8, hours: '7.5h', isToday: false },
      ];

  const totalWeekly = weekly.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const totalWeeklyTrips = weekly.reduce((acc, curr) => acc + (Number(curr.trips) || 0), 0);
  const avgDaily = weekly.length > 0 ? Math.round(totalWeekly / weekly.length) : 0;
  const maxWeeklyAmount = Math.max(...weekly.map((d) => Number(d.amount) || 0), 1000);
  const activeDayIndex = selectedDayIndex >= 0 && selectedDayIndex < weekly.length ? selectedDayIndex : 3;
  const selectedDay = weekly[activeDayIndex] || weekly[0];

  return (
    <CollapsibleHeaderLayout
      header={
        <AppHeader
          title="My Earnings"
          subtitle="Agri-Logistics Revenue"
          rightAction={{
            icon: 'history',
            onPress: () => navigation.navigate(ROUTES.PAYOUT_HISTORY),
          }}
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
            tintColor={themeColors.primary}
          />
        }
      >
        {/* Month Hero Card (Deep Forest Obsidian in Dark Mode) */}
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: isDarkMode ? '#062E19' : '#006738',
              borderWidth: isDarkMode ? 1.5 : 0,
              borderColor: isDarkMode ? '#00E676' : 'transparent',
              shadowColor: isDarkMode ? '#00E676' : '#006738',
              shadowOpacity: isDarkMode ? 0.2 : 0.15,
            },
          ]}
        >
          <View style={styles.heroBadgeRow}>
            <View
              style={[
                styles.monthBadge,
                isDarkMode && { backgroundColor: 'rgba(0, 230, 118, 0.18)' },
              ]}
            >
              <Text style={[styles.monthBadgeText, isDarkMode && { color: '#A7F3D0' }]}>SEPTEMBER 2026</Text>
            </View>
            <TouchableOpacity
              style={styles.payoutHistoryLink}
              onPress={() => navigation.navigate(ROUTES.PAYOUT_HISTORY)}
            >
              <Text style={styles.payoutHistoryLinkText}>Payout History</Text>
              <MaterialCommunityIcons name="chevron-right" size={16} color={colors.white} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.heroLabel, isDarkMode && { color: '#A7F3D0' }]}>Total Monthly Revenue</Text>
          <Text style={styles.heroAmount}>{formatCurrency(currentMonth.total)}</Text>

          {/* 3 Metric Pills */}
          <View
            style={[
              styles.metricsRow,
              isDarkMode && { backgroundColor: 'rgba(0, 230, 118, 0.12)' },
            ]}
          >
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{currentMonth.trips}</Text>
              <Text style={[styles.metricTitle, isDarkMode && { color: '#A7F3D0' }]}>Completed Trips</Text>
            </View>
            <View style={[styles.metricDivider, isDarkMode && { backgroundColor: 'rgba(0, 230, 118, 0.25)' }]} />
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{formatCurrency(currentMonth.tips)}</Text>
              <Text style={[styles.metricTitle, isDarkMode && { color: '#A7F3D0' }]}>Mandi Tips</Text>
            </View>
            <View style={[styles.metricDivider, isDarkMode && { backgroundColor: 'rgba(0, 230, 118, 0.25)' }]} />
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{formatCurrency(currentMonth.incentives)}</Text>
              <Text style={[styles.metricTitle, isDarkMode && { color: '#A7F3D0' }]}>Bonus Incentives</Text>
            </View>
          </View>

          {/* Direct Withdraw CTA */}
          <TouchableOpacity
            style={[
              styles.withdrawButton,
              isDarkMode && {
                backgroundColor: '#040705',
                borderWidth: 1,
                borderColor: '#00E676',
              },
            ]}
            activeOpacity={0.85}
            onPress={() => navigation.navigate(ROUTES.PAYOUT_HISTORY)}
          >
            <MaterialCommunityIcons name="bank-transfer" size={20} color={themeColors.primary} />
            <Text style={[styles.withdrawButtonText, isDarkMode && { color: '#00E676' }]}>Request Bank Payout</Text>
          </TouchableOpacity>
        </View>

        {/* Today's Breakdown */}
        <Text style={[styles.sectionHeading, { color: themeColors.textPrimary }]}>TODAY'S BREAKDOWN</Text>
        <AppCard style={styles.breakdownCard}>
          <View style={styles.breakdownHeader}>
            <View>
              <Text style={[styles.breakdownDate, { color: themeColors.textPrimary }]}>Today, 10 Sep 2026</Text>
              <Text style={[styles.breakdownTrips, { color: themeColors.textSecondary }]}>{today.trips} Trips completed</Text>
            </View>
            <Text style={[styles.breakdownTotal, { color: themeColors.primary }]}>{formatCurrency(today.total)}</Text>
          </View>

          <View style={[styles.divider, isDarkMode && { backgroundColor: themeColors.border }]} />

          <View style={styles.breakdownRow}>
            <Text style={[styles.breakdownItemName, { color: themeColors.textSecondary }]}>Base Delivery Fare</Text>
            <Text style={[styles.breakdownItemVal, { color: themeColors.textPrimary }]}>{formatCurrency(today.basePay)}</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={[styles.breakdownItemName, { color: themeColors.textSecondary }]}>Mandi Peak Surge Bonus</Text>
            <Text style={[styles.breakdownItemVal, { color: themeColors.primary }]}>
              +{formatCurrency(today.surgeBonus)}
            </Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={[styles.breakdownItemName, { color: themeColors.textSecondary }]}>Farmer & Buyer Gratuity (Tips)</Text>
            <Text style={[styles.breakdownItemVal, { color: themeColors.primary }]}>
              +{formatCurrency(today.tips)}
            </Text>
          </View>
        </AppCard>

        {/* Weekly Trend Bar Chart */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionHeading, { color: themeColors.textPrimary }]}>WEEKLY EARNINGS TREND</Text>
          <View
            style={[
              styles.weeklyGrowthBadge,
              isDarkMode && {
                backgroundColor: 'rgba(0, 230, 118, 0.15)',
                borderColor: 'rgba(0, 230, 118, 0.3)',
                borderWidth: 1,
              },
            ]}
          >
            <MaterialCommunityIcons name="trending-up" size={13} color={themeColors.primary} />
            <Text style={[styles.weeklyGrowthText, { color: themeColors.primary }]}>+16.4% this week</Text>
          </View>
        </View>

        <AppCard style={styles.chartCard}>
          {/* Top Row: Total Weekly Revenue & Average */}
          <View style={styles.chartHeader}>
            <View>
              <Text style={[styles.chartHeaderSub, { color: themeColors.textSecondary }]}>Weekly Revenue (04 - 10 Sep)</Text>
              <Text style={[styles.chartHeaderTotal, { color: themeColors.textPrimary }]}>{formatCurrency(totalWeekly)}</Text>
            </View>
            <View style={styles.chartHeaderRight}>
              <View
                style={[
                  styles.chartMetaPill,
                  isDarkMode && {
                    backgroundColor: themeColors.surfaceContainerHigh,
                    borderColor: themeColors.border,
                    borderWidth: 1,
                  },
                ]}
              >
                <Text style={[styles.chartMetaLabel, { color: themeColors.textSecondary }]}>Daily Average</Text>
                <Text style={[styles.chartMetaValue, { color: themeColors.primary }]}>₹{avgDaily}</Text>
              </View>
            </View>
          </View>

          {/* Interactive Selected Day Inspector Card */}
          {selectedDay && (
            <View
              style={[
                styles.dayInspectorBox,
                isDarkMode && {
                  backgroundColor: themeColors.surfaceContainerHigh,
                  borderColor: themeColors.border,
                  borderWidth: 1,
                },
              ]}
            >
              <View style={styles.dayInspectorLeft}>
                <View style={styles.dayInspectorTitleRow}>
                  <Text style={[styles.dayInspectorTitle, { color: themeColors.textPrimary }]}>
                    {selectedDay.fullDay || selectedDay.day}
                    {selectedDay.date ? `, ${selectedDay.date}` : ''}
                  </Text>
                  {selectedDay.isToday && (
                    <View style={styles.todayPill}>
                      <Text style={styles.todayPillText}>TODAY</Text>
                    </View>
                  )}
                  {selectedDay.isBest && (
                    <View style={styles.peakPill}>
                      <MaterialCommunityIcons name="star" size={11} color={colors.tertiary} />
                      <Text style={styles.peakPillText}>PEAK</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.dayInspectorSubtitle, { color: themeColors.textSecondary }]}>
                  {selectedDay.trips || 0} Deliveries Completed • {selectedDay.hours || '7h'} Active
                </Text>
              </View>
              <View style={styles.dayInspectorRight}>
                <Text style={[styles.dayInspectorAmount, { color: themeColors.primary }]}>{formatCurrency(selectedDay.amount)}</Text>
                <Text style={[styles.dayInspectorTripsAvg, { color: themeColors.textSecondary }]}>
                  ₹{selectedDay.trips ? Math.round(selectedDay.amount / selectedDay.trips) : 0}/trip
                </Text>
              </View>
            </View>
          )}

          {/* Benchmark guide line & Interactive Bars */}
          <View style={styles.chartAreaWrapper}>
            {/* Avg Benchmark Dashed Line */}
            <View
              style={[
                styles.avgBenchmarkLine,
                { bottom: `${Math.min(85, Math.max(22, (avgDaily / maxWeeklyAmount) * 100))}%` },
              ]}
            >
              <View style={[styles.avgDashedLine, isDarkMode && { borderColor: themeColors.border }]} />
              <View style={[styles.avgBenchmarkBadge, isDarkMode && { backgroundColor: themeColors.surfaceContainerHigh }]}>
                <Text style={[styles.avgBenchmarkText, isDarkMode && { color: themeColors.textSecondary }]}>Avg ₹{avgDaily}</Text>
              </View>
            </View>

            {/* 7 Interactive Day Bars */}
            <View style={styles.chartBarsContainer}>
              {weekly.map((item, index) => {
                const isSelected = index === activeDayIndex;
                const isToday = item.isToday || item.day === 'Thu';
                const heightPercent = Math.max(18, (item.amount / maxWeeklyAmount) * 100);

                return (
                  <TouchableOpacity
                    key={index}
                    activeOpacity={0.7}
                    onPress={() => setSelectedDayIndex(index)}
                    style={styles.barColumn}
                  >
                    {/* Amount Tag above bar */}
                    <View style={styles.barTopTagContainer}>
                      {isSelected ? (
                        <View style={[styles.barAmountPillActive, isDarkMode && { backgroundColor: themeColors.primary }]}>
                          <Text style={[styles.barAmountPillText, isDarkMode && { color: '#000000' }]}>₹{item.amount}</Text>
                        </View>
                      ) : item.isBest ? (
                        <MaterialCommunityIcons name="star" size={13} color={themeColors.primary} />
                      ) : (
                        <Text style={[styles.barAmountText, isDarkMode && { color: themeColors.textSecondary }]}>₹{item.amount}</Text>
                      )}
                    </View>

                    {/* Bar Track & Fill */}
                    <View
                      style={[
                        styles.barTrack,
                        isDarkMode && { backgroundColor: themeColors.surfaceContainerHigh },
                        isSelected && [styles.barTrackSelected, isDarkMode && { borderColor: themeColors.primary }],
                      ]}
                    >
                      <View
                        style={[
                          styles.barFill,
                          { height: `${heightPercent}%`, backgroundColor: themeColors.primary },
                          isSelected && styles.barFillSelected,
                          isToday && !isSelected && styles.barFillToday,
                          item.isBest && !isSelected && !isToday && styles.barFillBest,
                        ]}
                      />
                    </View>

                    {/* Day Label + Today indicator dot */}
                    <View style={styles.barLabelBox}>
                      <Text
                        style={[
                          styles.barDayText,
                          isDarkMode && { color: themeColors.textSecondary },
                          isSelected && [styles.barDayTextSelected, isDarkMode && { color: themeColors.primary }],
                          isToday && [styles.barDayTextToday, isDarkMode && { color: themeColors.primary }],
                        ]}
                      >
                        {item.day}
                      </Text>
                      {isToday && <View style={[styles.todayIndicatorDot, isDarkMode && { backgroundColor: themeColors.primary }]} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 3 Metric Pills Footer */}
          <View style={styles.chartFooterRow}>
            <View style={styles.chartFooterItem}>
              <Text style={[styles.chartFooterVal, { color: themeColors.textPrimary }]}>{formatCurrency(totalWeekly)}</Text>
              <Text style={[styles.chartFooterLabel, { color: themeColors.textSecondary }]}>7-Day Total</Text>
            </View>
            <View style={[styles.chartFooterDivider, isDarkMode && { backgroundColor: themeColors.border }]} />
            <View style={styles.chartFooterItem}>
              <Text style={[styles.chartFooterVal, { color: themeColors.textPrimary }]}>{totalWeeklyTrips} Trips</Text>
              <Text style={[styles.chartFooterLabel, { color: themeColors.textSecondary }]}>Completed</Text>
            </View>
            <View style={[styles.chartFooterDivider, isDarkMode && { backgroundColor: themeColors.border }]} />
            <View style={styles.chartFooterItem}>
              <Text style={[styles.chartFooterVal, { color: themeColors.primary }]}>
                {weekly.find((d) => d.isBest)?.day || 'Thu'} (₹{Math.max(...weekly.map((d) => d.amount))})
              </Text>
              <Text style={[styles.chartFooterLabel, { color: themeColors.textSecondary }]}>Peak Day 🏆</Text>
            </View>
          </View>
        </AppCard>

        {/* Daily Bonus Incentive Card */}
        <AppCard style={styles.incentiveCard}>
          <View style={styles.incentiveHeader}>
            <MaterialCommunityIcons name="trophy-award" size={24} color={themeColors.primary} />
            <View style={styles.incentiveTitleBox}>
              <Text style={[styles.incentiveTitle, { color: themeColors.textPrimary }]}>Daily Peak Cargo Challenge</Text>
              <Text style={[styles.incentiveSubtitle, { color: themeColors.textSecondary }]}>Complete 6 deliveries today to earn ₹150 extra</Text>
            </View>
          </View>

          {/* Progress bar */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, isDarkMode && { backgroundColor: themeColors.surfaceContainerHigh }]}>
              <View style={[styles.progressFill, { width: `${(today.trips / 6) * 100}%`, backgroundColor: themeColors.primary }]} />
            </View>
            <Text style={[styles.progressText, { color: themeColors.textSecondary }]}>{today.trips}/6 Trips (1 more to go!)</Text>
          </View>
        </AppCard>

        {/* Recent Transactions List */}
        <View style={styles.transactionsHeader}>
          <Text style={[styles.sectionHeading, { color: themeColors.textPrimary }]}>RECENT EARNINGS</Text>
          <TouchableOpacity onPress={() => navigation.navigate(ROUTES.DELIVERIES)}>
            <Text style={[styles.viewAllText, { color: themeColors.primary }]}>View All</Text>
          </TouchableOpacity>
        </View>

        {(earningsData?.recentTransactions || [
          { id: 'TXN-8902', type: 'Delivery Earning #DEL-01', amount: 95, time: '11:42 AM', status: 'credited' },
          { id: 'TXN-8891', type: 'Peak Morning Surge Bonus', amount: 40, time: '10:15 AM', status: 'credited' },
          { id: 'TXN-8840', type: 'Delivery Earning #DEL-03', amount: 85, time: '08:30 AM', status: 'credited' },
        ]).map((txn) => (
          <AppCard key={txn.id} style={styles.txnCard}>
            <View
              style={[
                styles.txnIconBox,
                {
                  backgroundColor: isDarkMode ? '#062E19' : '#ecfdf5',
                  borderColor: isDarkMode ? '#00E676' : '#a7f3d0',
                  borderWidth: 1,
                },
              ]}
            >
              <MaterialCommunityIcons
                name={txn.status === 'credited' ? 'arrow-bottom-left' : 'clock-outline'}
                size={20}
                color={isDarkMode ? '#00E676' : '#006738'}
              />
            </View>
            <View style={styles.txnInfo}>
              <Text style={[styles.txnTitle, { color: themeColors.textPrimary }]}>{txn.type}</Text>
              <Text style={[styles.txnSub, { color: themeColors.textSecondary }]}>{txn.id} • {txn.time}</Text>
            </View>
            <View style={styles.txnAmountBox}>
              <Text style={[styles.txnAmount, { color: themeColors.primary }]}>+{formatCurrency(txn.amount)}</Text>
              <Text style={[styles.txnStatus, { color: themeColors.textSecondary }]}>{txn.status}</Text>
            </View>
          </AppCard>
        ))}
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
    padding: spacing.md,
    paddingBottom: 84, // allow room for tab bar
  },
  heroCard: {
    backgroundColor: colors.primary,
    borderRadius: spacing.radiusLg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  monthBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: spacing.radiusSm,
  },
  monthBadgeText: {
    ...typography.labelSmall,
    color: colors.white,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  payoutHistoryLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  payoutHistoryLinkText: {
    ...typography.labelSmall,
    color: colors.white,
    marginRight: 2,
  },
  heroLabel: {
    ...typography.bodySmall,
    color: 'rgba(255,255,255,0.8)',
    marginTop: spacing.xs,
  },
  heroAmount: {
    ...typography.headlineLarge,
    color: colors.white,
    fontWeight: '800',
    marginVertical: spacing.xs,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: spacing.radiusMd,
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 4,
  },
  metricValue: {
    ...typography.labelLarge,
    color: colors.white,
    fontWeight: '700',
  },
  metricTitle: {
    ...typography.labelSmall,
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    marginTop: 2,
  },
  withdrawButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMd,
    paddingVertical: spacing.sm,
    marginTop: spacing.md,
  },
  withdrawButtonText: {
    ...typography.labelMedium,
    color: colors.primary,
    fontWeight: '700',
    marginLeft: spacing.xs,
  },
  sectionHeading: {
    ...typography.labelSmall,
    color: colors.textSecondary,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
  },
  breakdownCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownDate: {
    ...typography.titleMedium,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  breakdownTrips: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  breakdownTotal: {
    ...typography.headlineSmall,
    color: colors.primary,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.sm,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  breakdownItemName: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  breakdownItemVal: {
    ...typography.labelMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
  },
  weeklyGrowthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  weeklyGrowthText: {
    ...typography.labelSmall,
    color: colors.primary,
    fontWeight: '700',
    fontSize: 11,
    marginLeft: 3,
  },
  chartCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
    borderRadius: spacing.radiusLg,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  chartHeaderSub: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontSize: 12,
  },
  chartHeaderTotal: {
    ...typography.headlineMedium,
    color: colors.textPrimary,
    fontWeight: '800',
    marginTop: 2,
  },
  chartHeaderRight: {
    alignItems: 'flex-end',
  },
  chartMetaPill: {
    backgroundColor: colors.neutralVariant100,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: spacing.radiusMd,
    alignItems: 'flex-end',
  },
  chartMetaLabel: {
    fontSize: 10,
    color: colors.textTertiary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  chartMetaValue: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '700',
    marginTop: 1,
  },
  dayInspectorBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: spacing.radiusMd,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  dayInspectorLeft: {
    flex: 1,
  },
  dayInspectorTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayInspectorTitle: {
    ...typography.labelMedium,
    color: colors.textPrimary,
    fontWeight: '700',
    marginRight: 6,
  },
  todayPill: {
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    marginRight: 4,
  },
  todayPillText: {
    fontSize: 9,
    color: colors.white,
    fontWeight: '800',
  },
  peakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  peakPillText: {
    fontSize: 9,
    color: colors.tertiary,
    fontWeight: '800',
    marginLeft: 2,
  },
  dayInspectorSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  dayInspectorRight: {
    alignItems: 'flex-end',
  },
  dayInspectorAmount: {
    ...typography.titleMedium,
    color: colors.primary,
    fontWeight: '800',
  },
  dayInspectorTripsAvg: {
    fontSize: 10,
    color: colors.textTertiary,
    marginTop: 1,
  },
  chartAreaWrapper: {
    height: 155,
    justifyContent: 'flex-end',
    position: 'relative',
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  avgBenchmarkLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  avgDashedLine: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
  },
  avgBenchmarkBadge: {
    backgroundColor: colors.surfaceDim,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    marginLeft: 4,
  },
  avgBenchmarkText: {
    fontSize: 9,
    color: colors.textTertiary,
    fontWeight: '600',
  },
  chartBarsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: '100%',
    zIndex: 2,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  barTopTagContainer: {
    height: 22,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 4,
  },
  barAmountText: {
    fontSize: 9,
    color: colors.textTertiary,
    fontWeight: '500',
  },
  barAmountPillActive: {
    backgroundColor: colors.primary,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
  },
  barAmountPillText: {
    fontSize: 9,
    color: colors.white,
    fontWeight: '700',
  },
  barTrack: {
    width: 22,
    height: 96,
    backgroundColor: colors.neutralVariant100,
    borderRadius: 11,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  barTrackSelected: {
    backgroundColor: '#e6f4ea',
    borderColor: colors.primaryFixed,
  },
  barFill: {
    width: '100%',
    backgroundColor: '#a7f3d0',
    borderRadius: 11,
  },
  barFillSelected: {
    backgroundColor: colors.primary,
  },
  barFillToday: {
    backgroundColor: '#059669',
  },
  barFillBest: {
    backgroundColor: '#34d399',
  },
  barLabelBox: {
    alignItems: 'center',
    marginTop: 6,
    minHeight: 20,
  },
  barDayText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  barDayTextSelected: {
    color: colors.primary,
    fontWeight: '800',
  },
  barDayTextToday: {
    color: colors.primary,
    fontWeight: '700',
  },
  todayIndicatorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginTop: 2,
  },
  chartFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: spacing.radiusMd,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  chartFooterItem: {
    flex: 1,
    alignItems: 'center',
  },
  chartFooterDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.borderLight,
  },
  chartFooterVal: {
    ...typography.labelMedium,
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 13,
  },
  chartFooterLabel: {
    fontSize: 10,
    color: colors.textTertiary,
    marginTop: 2,
  },
  incentiveCard: {
    backgroundColor: colors.card,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  incentiveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  incentiveTitleBox: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  incentiveTitle: {
    ...typography.labelMedium,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  incentiveSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  progressContainer: {
    marginTop: spacing.sm,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.neutralVariant100,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 4,
  },
  progressText: {
    ...typography.labelSmall,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'right',
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  viewAllText: {
    ...typography.labelSmall,
    color: colors.primary,
    fontWeight: '700',
  },
  txnCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  txnIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  txnInfo: {
    flex: 1,
  },
  txnTitle: {
    ...typography.labelMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  txnSub: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    fontSize: 11,
  },
  txnAmountBox: {
    alignItems: 'flex-end',
  },
  txnAmount: {
    ...typography.labelMedium,
    color: colors.primary,
    fontWeight: '700',
  },
  txnStatus: {
    ...typography.labelSmall,
    color: colors.textTertiary,
    fontSize: 10,
    textTransform: 'capitalize',
  },
});
