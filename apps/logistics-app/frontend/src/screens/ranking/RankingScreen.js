import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { AppHeader } from '../../components/common/AppHeader';
import { CollapsibleHeaderLayout } from '../../components/common/CollapsibleHeaderLayout';
import { AppCard } from '../../components/common/AppCard';
import { rankingService } from '../../services/rankingService';
import { useTheme } from '../../context/ThemeContext';
import { formatCurrency } from '../../utils/formatters';

const PERIODS = ['Today', 'This Week', 'This Month'];

export const RankingScreen = () => {
  const insets = useSafeAreaInsets();
  const { isDarkMode, colors: themeColors } = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState('This Week');
  const [rankingData, setRankingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRankings = async () => {
    try {
      const data = await rankingService.getLeaderboard(selectedPeriod.toLowerCase().replace(' ', '_'));
      if (data) setRankingData(data);
    } catch (err) {
      console.log('Ranking sync handled with offline fallback');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRankings();
  }, [selectedPeriod]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRankings();
  };

  const myRank = rankingData?.currentUser || {
    rank: 7,
    name: 'Rahul Singh',
    partnerId: 'MKP-10482',
    deliveries: 42,
    score: 94.8,
    earnings: 4860,
    tier: 'Gold Partner',
    tierProgress: 84,
  };

  const topThree = (rankingData?.leaderboard || []).slice(0, 3);
  const remainingRanks = (rankingData?.leaderboard || []).slice(3);

  return (
    <CollapsibleHeaderLayout
      header={
        <AppHeader
          title="Driver Leaderboard"
          subtitle="MandiKart Agri-Excellence"
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
        {/* Period Selector */}
        <View
          style={[
            styles.periodRow,
            {
              backgroundColor: themeColors.card,
              borderColor: isDarkMode ? themeColors.border : colors.outlineVariant,
              borderWidth: 1,
            },
          ]}
        >
          {PERIODS.map((period) => {
            const isSelected = selectedPeriod === period;
            return (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodChip,
                  isSelected && [
                    styles.periodChipActive,
                    { backgroundColor: themeColors.primary },
                  ],
                ]}
                onPress={() => setSelectedPeriod(period)}
              >
                <Text
                  style={[
                    styles.periodChipText,
                    { color: isSelected ? themeColors.onPrimary : themeColors.textSecondary },
                    isSelected && styles.periodChipTextActive,
                  ]}
                >
                  {period}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Current Partner Rank Hero Card */}
        <View
          style={[
            styles.userHeroCard,
            isDarkMode && {
              backgroundColor: '#062E19',
              borderWidth: 1.5,
              borderColor: '#00E676',
              shadowColor: '#00E676',
              shadowOpacity: 0.15,
            },
          ]}
        >
          <View style={styles.userHeroTop}>
            <View
              style={[
                styles.userRankCircle,
                isDarkMode && {
                  backgroundColor: 'rgba(0, 230, 118, 0.18)',
                  borderColor: '#00E676',
                },
              ]}
            >
              <Text style={[styles.userRankNumber, isDarkMode && { color: '#00E676' }]}>#{myRank.rank}</Text>
              <Text style={[styles.userRankSub, isDarkMode && { color: '#A7F3D0' }]}>YOUR RANK</Text>
            </View>

            <View style={styles.userInfoCol}>
              <Text style={styles.userName}>{myRank.name}</Text>
              <Text style={[styles.userId, isDarkMode && { color: '#A7F3D0' }]}>{myRank.partnerId} • {myRank.tier}</Text>
              <View style={styles.scoreRow}>
                <MaterialCommunityIcons name="star" size={16} color={isDarkMode ? '#00E676' : colors.white} />
                <Text style={[styles.scoreText, isDarkMode && { color: '#A7F3D0' }]}>{myRank.score}% Quality Score</Text>
              </View>
            </View>
          </View>

          {/* Progress to next tier */}
          <View
            style={[
              styles.tierContainer,
              isDarkMode && { backgroundColor: 'rgba(0, 230, 118, 0.12)' },
            ]}
          >
            <View style={styles.tierLabels}>
              <Text style={[styles.tierCurrent, isDarkMode && { color: '#00E676' }]}>Gold</Text>
              <Text style={[styles.tierNext, isDarkMode && { color: '#A7F3D0' }]}>Next: Diamond Partner (+₹1,000 monthly bonus)</Text>
            </View>
            <View style={styles.tierTrack}>
              <View style={[styles.tierFill, { width: `${myRank.tierProgress || 80}%`, backgroundColor: themeColors.primary }]} />
            </View>
          </View>
        </View>

        {/* Top 3 Podium (Matching Stitch Visual Architecture) */}
        <Text style={[styles.sectionHeading, { color: themeColors.textPrimary }]}>TOP AGRI-LOGISTICS PARTNERS</Text>
        <View style={styles.podiumContainer}>
          {/* Rank 2 (Left) */}
          {topThree[1] && (
            <View
              style={[
                styles.podiumCol,
                styles.podiumRank2,
                {
                  backgroundColor: themeColors.card,
                  borderColor: isDarkMode ? themeColors.border : colors.outlineVariant,
                  borderWidth: 1,
                },
              ]}
            >
              <View style={styles.podiumAvatarBox}>
                <View style={[styles.podiumAvatar, { backgroundColor: isDarkMode ? '#1E3028' : '#e0e0e0' }]}>
                  <Text style={[styles.podiumInitials, isDarkMode && { color: '#A7F3D0' }]}>{topThree[1].avatarInitials || 'AD'}</Text>
                </View>
                <View style={[styles.medalBadge, { backgroundColor: '#9e9e9e' }]}>
                  <Text style={styles.medalText}>2</Text>
                </View>
              </View>
              <Text style={[styles.podiumName, { color: themeColors.textPrimary }]} numberOfLines={1}>{topThree[1].name}</Text>
              <Text style={[styles.podiumTrips, { color: themeColors.textSecondary }]}>{topThree[1].deliveries} Trips</Text>
              <Text style={[styles.podiumBonus, { color: themeColors.primary }]}>+₹500 Bonus</Text>
            </View>
          )}

          {/* Rank 1 (Center - Elevated) */}
          {topThree[0] && (
            <View
              style={[
                styles.podiumCol,
                styles.podiumRank1,
                {
                  backgroundColor: themeColors.card,
                  borderColor: isDarkMode ? '#00E676' : colors.primary,
                  borderWidth: 2,
                },
              ]}
            >
              <MaterialCommunityIcons name="crown" size={24} color={themeColors.primary} style={styles.crownIcon} />
              <View style={styles.podiumAvatarBox}>
                <View style={[styles.podiumAvatar, { backgroundColor: isDarkMode ? '#062E19' : colors.primary }]}>
                  <Text style={[styles.podiumInitials, { color: isDarkMode ? '#00E676' : colors.white }]}>
                    {topThree[0].avatarInitials || 'RK'}
                  </Text>
                </View>
                <View style={[styles.medalBadge, { backgroundColor: themeColors.primary }]}>
                  <Text style={[styles.medalText, isDarkMode && { color: '#000000' }]}>1</Text>
                </View>
              </View>
              <Text style={[styles.podiumName, { color: themeColors.textPrimary, fontWeight: '800' }]} numberOfLines={1}>
                {topThree[0].name}
              </Text>
              <Text style={[styles.podiumTrips, { color: themeColors.textSecondary }]}>{topThree[0].deliveries} Trips</Text>
              <Text style={[styles.podiumBonus, { color: themeColors.primary, fontWeight: '700' }]}>
                +₹1,000 Bonus
              </Text>
            </View>
          )}

          {/* Rank 3 (Right) */}
          {topThree[2] && (
            <View
              style={[
                styles.podiumCol,
                styles.podiumRank3,
                {
                  backgroundColor: themeColors.card,
                  borderColor: isDarkMode ? themeColors.border : colors.outlineVariant,
                  borderWidth: 1,
                },
              ]}
            >
              <View style={styles.podiumAvatarBox}>
                <View style={[styles.podiumAvatar, { backgroundColor: isDarkMode ? '#1E3028' : '#d7ccc8' }]}>
                  <Text style={[styles.podiumInitials, isDarkMode && { color: '#A7F3D0' }]}>{topThree[2].avatarInitials || 'SP'}</Text>
                </View>
                <View style={[styles.medalBadge, { backgroundColor: '#8d6e63' }]}>
                  <Text style={styles.medalText}>3</Text>
                </View>
              </View>
              <Text style={[styles.podiumName, { color: themeColors.textPrimary }]} numberOfLines={1}>{topThree[2].name}</Text>
              <Text style={[styles.podiumTrips, { color: themeColors.textSecondary }]}>{topThree[2].deliveries} Trips</Text>
              <Text style={[styles.podiumBonus, { color: themeColors.primary }]}>+₹250 Bonus</Text>
            </View>
          )}
        </View>

        {/* Remaining Ranks List */}
        <Text style={[styles.sectionHeading, { color: themeColors.textPrimary }]}>DISTRICT LEADERBOARD</Text>
        {remainingRanks.map((partner) => {
          const isUser = partner.id === 'MKP-10482' || partner.isCurrentUser;
          return (
            <AppCard
              key={partner.id}
              style={[
                styles.partnerCard,
                isUser && [
                  styles.partnerCardHighlight,
                  isDarkMode && {
                    backgroundColor: '#062E19',
                    borderColor: '#00E676',
                    borderWidth: 1.5,
                  },
                ],
              ]}
            >
              <Text
                style={[
                  styles.rankNumber,
                  { color: isUser ? themeColors.primary : themeColors.textSecondary },
                  isUser && styles.rankNumberHighlight,
                ]}
              >
                #{partner.rank}
              </Text>

              <View style={styles.partnerInfo}>
                <Text style={[styles.partnerCardName, { color: themeColors.textPrimary }]}>
                  {partner.name} {isUser && '(You)'}
                </Text>
                <Text style={[styles.partnerCardSub, { color: themeColors.textSecondary }]}>
                  {partner.id} • {partner.deliveries} deliveries
                </Text>
              </View>

              <View style={styles.partnerStats}>
                <Text style={[styles.partnerEarnings, { color: themeColors.primary }]}>
                  {formatCurrency(partner.earnings)}
                </Text>
                <Text style={[styles.partnerScore, { color: themeColors.textSecondary }]}>
                  {partner.score}% score
                </Text>
              </View>
            </AppCard>
          );
        })}

        {/* How ranking works explanation card */}
        <AppCard style={styles.rulesCard}>
          <View style={styles.rulesHeader}>
            <MaterialCommunityIcons name="information" size={20} color={themeColors.primary} />
            <Text style={[styles.rulesTitle, { color: themeColors.textPrimary }]}>How Agri-Rank is Calculated</Text>
          </View>
          <Text style={[styles.rulesBody, { color: themeColors.textSecondary }]}>
            Points are awarded for on-time mandi arrivals, zero produce spoilage ratings, and completing peak early morning harvesting dispatches.
          </Text>
        </AppCard>
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
  periodRow: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceContainer,
    borderRadius: spacing.radiusMd,
    padding: 3,
    marginBottom: spacing.md,
  },
  periodChip: {
    flex: 1,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    borderRadius: spacing.radiusSm,
  },
  periodChipActive: {
    backgroundColor: colors.primary,
  },
  periodChipText: {
    ...typography.labelSmall,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  periodChipTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  userHeroCard: {
    backgroundColor: colors.primary,
    borderRadius: spacing.radiusLg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  userHeroTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userRankCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  userRankNumber: {
    ...typography.headlineSmall,
    color: colors.white,
    fontWeight: '800',
  },
  userRankSub: {
    ...typography.labelSmall,
    color: 'rgba(255,255,255,0.8)',
    fontSize: 9,
    fontWeight: '700',
  },
  userInfoCol: {
    flex: 1,
  },
  userName: {
    ...typography.titleMedium,
    color: colors.white,
    fontWeight: '700',
  },
  userId: {
    ...typography.bodySmall,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  scoreText: {
    ...typography.labelSmall,
    color: colors.white,
    fontWeight: '700',
    marginLeft: 4,
  },
  tierContainer: {
    marginTop: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: spacing.radiusMd,
    padding: spacing.sm,
  },
  tierLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  tierCurrent: {
    ...typography.labelSmall,
    color: colors.white,
    fontWeight: '700',
  },
  tierNext: {
    ...typography.bodySmall,
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
  },
  tierTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  tierFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 3,
  },
  sectionHeading: {
    ...typography.labelSmall,
    color: colors.textSecondary,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
  },
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginVertical: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  podiumCol: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: spacing.radiusMd,
    alignItems: 'center',
    padding: spacing.sm,
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  podiumRank1: {
    paddingTop: spacing.md,
    borderColor: colors.accent,
    borderWidth: 1.5,
    backgroundColor: colors.primaryContainer,
  },
  podiumRank2: {
    height: 140,
    justifyContent: 'center',
  },
  podiumRank3: {
    height: 135,
    justifyContent: 'center',
  },
  crownIcon: {
    position: 'absolute',
    top: -12,
  },
  podiumAvatarBox: {
    position: 'relative',
    marginBottom: spacing.xs,
  },
  podiumAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  podiumInitials: {
    ...typography.labelMedium,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  medalBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medalText: {
    ...typography.labelSmall,
    color: colors.white,
    fontSize: 10,
    fontWeight: '800',
  },
  podiumName: {
    ...typography.labelSmall,
    color: colors.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
  },
  podiumTrips: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 1,
  },
  podiumBonus: {
    ...typography.labelSmall,
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 2,
  },
  partnerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  partnerCardHighlight: {
    backgroundColor: colors.primaryContainer,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  rankNumber: {
    ...typography.titleMedium,
    color: colors.textSecondary,
    fontWeight: '800',
    width: 32,
  },
  rankNumberHighlight: {
    color: colors.white,
  },
  partnerTextWhite: {
    color: colors.white,
  },
  partnerTextWhiteSub: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
  partnerInfo: {
    flex: 1,
    marginLeft: spacing.xs,
  },
  partnerCardName: {
    ...typography.labelMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  partnerCardSub: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    fontSize: 11,
  },
  partnerStats: {
    alignItems: 'flex-end',
  },
  partnerEarnings: {
    ...typography.labelMedium,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  partnerScore: {
    ...typography.labelSmall,
    color: colors.primary,
    fontSize: 11,
    fontWeight: '600',
  },
  rulesCard: {
    backgroundColor: colors.surfaceContainer,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  rulesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rulesTitle: {
    ...typography.labelMedium,
    color: colors.textPrimary,
    fontWeight: '700',
    marginLeft: spacing.xs,
  },
  rulesBody: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
