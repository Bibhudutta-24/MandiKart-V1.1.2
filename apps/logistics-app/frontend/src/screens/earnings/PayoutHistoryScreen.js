import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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
import { StatusBadge } from '../../components/common/StatusBadge';
import { earningsService } from '../../services/earningsService';
import { formatCurrency, formatShortDate } from '../../utils/formatters';

const FILTER_OPTIONS = ['All', 'Processing', 'Completed'];

export const PayoutHistoryScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [payoutsData, setPayoutsData] = useState(null);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await earningsService.getPayoutHistory();
        setPayoutsData(data);
      } catch (err) {
        console.error('Failed to load payouts:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleWithdrawal = () => {
    const currentAmount = payoutsData?.availableForWithdrawal ?? 2860;
    if (currentAmount <= 0) {
      Alert.alert('Zero Balance', 'You currently have ₹0 available to withdraw. Complete more deliveries to accumulate earnings.');
      return;
    }

    const bankName = payoutsData?.bankAccount?.bankName || 'State Bank of India';
    const accNumber = payoutsData?.bankAccount?.accountNumber || '•••• 4821';

    Alert.alert(
      'Confirm Bank Transfer',
      `Transfer ${formatCurrency(currentAmount)} to ${bankName} (A/C: ${accNumber})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Transfer Now',
          onPress: async () => {
            setWithdrawing(true);
            try {
              const res = await earningsService.requestPayout(currentAmount);
              const newRecord = res.payout || {
                id: res.referenceId || 'MKP-PAY-' + Date.now().toString().slice(-6),
                amount: currentAmount,
                date: 'Today',
                status: 'PROCESSING',
                method: `Bank Transfer (${bankName} ${accNumber})`,
                utr: 'UTR' + Math.floor(1000000000 + Math.random() * 9000000000),
                time: 'Just now',
              };

              setPayoutsData((prev) => ({
                ...prev,
                availableForWithdrawal: 0,
                history: [newRecord, ...(prev?.history || [])],
              }));

              // Automatically show in Processing tab
              setActiveFilter('Processing');

              Alert.alert(
                'Withdrawal Initiated',
                `Your withdrawal of ${formatCurrency(currentAmount)} is currently in PROCESSING status and will arrive in your bank account within 2 hours via IMPS.`
              );
            } catch (err) {
              Alert.alert('Error', err.message || 'Failed to initiate withdrawal');
            } finally {
              setWithdrawing(false);
            }
          },
        },
      ]
    );
  };

  const filteredHistory = (payoutsData?.history || []).filter((item) => {
    if (activeFilter === 'All') return true;
    return item.status.toLowerCase() === activeFilter.toLowerCase();
  });

  return (
    <CollapsibleHeaderLayout
      header={
        <AppHeader
          title="Payout History"
          subtitle="Bank Transfers & Dispatches"
          showBack
          onBackPress={() => navigation.goBack()}
        />
      }
      headerHeight={60}
    >

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Available Balance Card */}
        <AppCard style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>AVAILABLE FOR WITHDRAWAL</Text>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceAmount}>
              {formatCurrency(payoutsData?.availableForWithdrawal || 2860)}
            </Text>
            <AppButton
              title="Withdraw"
              size="small"
              loading={withdrawing}
              onPress={handleWithdrawal}
              icon="payments"
            />
          </View>

          {/* Linked Bank Card */}
          <View style={styles.bankAccountRow}>
            <MaterialCommunityIcons name="bank" size={20} color={colors.primary} />
            <View style={styles.bankInfo}>
              <Text style={styles.bankName}>
                {payoutsData?.bankAccount?.bankName || 'State Bank of India (Mandi Branch)'}
              </Text>
              <Text style={styles.bankSub}>
                A/C: {payoutsData?.bankAccount?.accountNumber || '•••• 4821'} • IFSC: {payoutsData?.bankAccount?.ifsc || 'SBIN0004210'}
              </Text>
            </View>
            <MaterialCommunityIcons name="check-decagram" size={18} color={colors.primary} />
          </View>
        </AppCard>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          {FILTER_OPTIONS.map((filter) => {
            const isSelected = activeFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
                onPress={() => setActiveFilter(filter)}
              >
                <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Payout History List */}
        <Text style={styles.sectionHeading}>PAST SETTLEMENTS</Text>

        {filteredHistory.map((item) => (
          <AppCard key={item.id} style={styles.payoutCard}>
            <View style={styles.payoutTopRow}>
              <View style={styles.payoutTitleBox}>
                <Text style={styles.payoutDate}>{formatShortDate(item.date)}</Text>
                <Text style={styles.payoutRef}>UTR: {item.utr || item.id}</Text>
              </View>
              <View style={styles.payoutStatusBox}>
                <Text style={styles.payoutAmount}>{formatCurrency(item.amount)}</Text>
                <StatusBadge status={item.status} />
              </View>
            </View>

            <View style={styles.cardDivider} />

            <View style={styles.payoutFooterRow}>
              <Text style={styles.payoutMethod}>Method: {item.method || 'IMPS / Direct NEFT'}</Text>
              <Text style={styles.payoutTime}>{item.time || '11:45 AM'}</Text>
            </View>
          </AppCard>
        ))}

        {filteredHistory.length === 0 && (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="cash-remove" size={48} color={colors.neutralVariant300} />
            <Text style={styles.emptyTitle}>No settlements found</Text>
            <Text style={styles.emptyDesc}>No payouts match the filter "{activeFilter}".</Text>
          </View>
        )}
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
    paddingBottom: spacing.xxl,
  },
  balanceCard: {
    padding: spacing.md,
    backgroundColor: colors.card,
    marginBottom: spacing.md,
  },
  balanceLabel: {
    ...typography.labelSmall,
    color: colors.textSecondary,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.xs,
  },
  balanceAmount: {
    ...typography.headlineMedium,
    color: colors.primary,
    fontWeight: '800',
  },
  bankAccountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainer,
    borderRadius: spacing.radiusMd,
    padding: spacing.sm,
    marginTop: spacing.xs,
  },
  bankInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  bankName: {
    ...typography.labelMedium,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  bankSub: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    fontSize: 11,
    marginTop: 1,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.radiusFull,
    backgroundColor: colors.card,
    marginRight: spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    ...typography.labelSmall,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  sectionHeading: {
    ...typography.labelSmall,
    color: colors.textSecondary,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
  },
  payoutCard: {
    padding: spacing.md,
    marginBottom: spacing.xs,
  },
  payoutTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  payoutTitleBox: {
    flex: 1,
  },
  payoutDate: {
    ...typography.titleMedium,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  payoutRef: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    fontSize: 11,
    marginTop: 2,
  },
  payoutStatusBox: {
    alignItems: 'flex-end',
  },
  payoutAmount: {
    ...typography.titleMedium,
    color: colors.textPrimary,
    fontWeight: '800',
    marginBottom: 4,
  },
  cardDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.xs,
  },
  payoutFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  payoutMethod: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontSize: 11,
  },
  payoutTime: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    fontSize: 11,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    marginTop: spacing.lg,
  },
  emptyTitle: {
    ...typography.titleMedium,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  emptyDesc: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    marginTop: 2,
  },
});
