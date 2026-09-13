/**
 * Gamification, Milestone Incentives & Tier Progression Engine
 * Manages daily milestone bonuses, auto wallet credits, and driver tier advancement.
 */
const { store } = require('../config/db');

const DAILY_MILESTONES = [
  { targetTrips: 5, rewardAmount: 50, title: 'Starter Sprint', badge: '🥉' },
  { targetTrips: 10, rewardAmount: 120, title: 'Half-Century Hustle', badge: '🥈' },
  { targetTrips: 15, rewardAmount: 250, title: 'Mandi Marathon', badge: '🥇' },
  { targetTrips: 20, rewardAmount: 400, title: 'Legendary Partner', badge: '👑' },
];

const TIERS = {
  BRONZE: {
    tier: 'BRONZE',
    name: 'Bronze Partner',
    minTrips: 0,
    minRating: 4.0,
    platformFeePct: 15,
    perks: ['Standard Orders', 'Daily Payouts (Std Fees)'],
    badgeIcon: 'shield-outline',
  },
  SILVER: {
    tier: 'SILVER',
    name: 'Silver Partner',
    minTrips: 25,
    minRating: 4.6,
    platformFeePct: 13,
    perks: ['Priority Order Matching', '13% Reduced Commission', 'Weekly Fuel Vouchers'],
    badgeIcon: 'shield-check',
  },
  GOLD: {
    tier: 'GOLD',
    name: 'Gold Partner',
    minTrips: 60,
    minRating: 4.8,
    platformFeePct: 10,
    perks: ['10% Reduced Commission', 'Peak Surge Priority', 'Dedicated 24/7 Helpline'],
    badgeIcon: 'crown',
  },
  PLATINUM: {
    tier: 'PLATINUM',
    name: 'Platinum Partner',
    minTrips: 120,
    minRating: 4.9,
    platformFeePct: 8,
    perks: ['8% VIP Commission', 'Instant Zero-Fee Payouts', 'Highest Dispatch Priority'],
    badgeIcon: 'diamond',
  },
};

class GamificationEngine {
  constructor() {
    this.driverDailyProgress = new Map(); // driverId -> { date, tripsToday, claimedMilestones: Set() }
  }

  _getDailyState(driverId) {
    const today = new Date().toISOString().slice(0, 10);
    let state = this.driverDailyProgress.get(driverId);
    if (!state || state.date !== today) {
      state = {
        date: today,
        driverId,
        tripsToday: 18, // Rahul Singh default today
        claimedMilestones: new Set([5, 10, 15]), // Claimed previous
      };
      this.driverDailyProgress.set(driverId, state);
    }
    return state;
  }

  /**
   * 1. Record completed trip and check for milestone bonus unlock
   */
  recordTripCompletion(driverId, tripData = {}) {
    const state = this._getDailyState(driverId);
    state.tripsToday += 1;

    const newlyUnlocked = [];
    let bonusCredited = 0;

    for (const milestone of DAILY_MILESTONES) {
      if (state.tripsToday >= milestone.targetTrips && !state.claimedMilestones.has(milestone.targetTrips)) {
        state.claimedMilestones.add(milestone.targetTrips);
        newlyUnlocked.push(milestone);
        bonusCredited += milestone.rewardAmount;
      }
    }

    return {
      tripsToday: state.tripsToday,
      newlyUnlocked,
      totalBonusCredited: bonusCredited,
      message: newlyUnlocked.length
        ? `Congratulations! You unlocked the ${newlyUnlocked.map((m) => m.title).join(', ')} milestone bonus (+₹${bonusCredited})!`
        : `Trip recorded. ${state.tripsToday} trips completed today.`,
    };
  }

  /**
   * 2. Get Daily Milestone Progress
   */
  getDailyMilestones(driverId = 'MKP-10482') {
    const state = this._getDailyState(driverId);
    const trips = state.tripsToday;

    const nextMilestone = DAILY_MILESTONES.find((m) => trips < m.targetTrips) || null;
    const remainingToNext = nextMilestone ? nextMilestone.targetTrips - trips : 0;

    const milestonesWithStatus = DAILY_MILESTONES.map((m) => ({
      ...m,
      isCompleted: trips >= m.targetTrips,
      isClaimed: state.claimedMilestones.has(m.targetTrips),
      progressPct: Math.min(100, Math.round((trips / m.targetTrips) * 100)),
    }));

    return {
      success: true,
      driverId,
      date: state.date,
      tripsCompletedToday: trips,
      nextMilestone,
      remainingToNext,
      totalBonusEarnedToday: Array.from(state.claimedMilestones).reduce((sum, target) => {
        const found = DAILY_MILESTONES.find((m) => m.targetTrips === target);
        return sum + (found ? found.rewardAmount : 0);
      }, 0),
      milestones: milestonesWithStatus,
    };
  }

  /**
   * 3. Calculate Driver Tier & Perks Progression
   */
  calculateTierStatus(driverId = 'MKP-10482') {
    const driver = store.drivers.get(driverId) || {
      id: driverId,
      name: 'Rahul Singh',
      deliveriesCount: 68,
      rating: 4.85,
      onTimeDeliveryRate: 97.2,
    };

    const count = driver.deliveriesCount || 68;
    const rating = driver.rating || 4.85;

    let currentTier = TIERS.BRONZE;
    let nextTier = TIERS.SILVER;

    if (count >= TIERS.PLATINUM.minTrips && rating >= TIERS.PLATINUM.minRating) {
      currentTier = TIERS.PLATINUM;
      nextTier = null;
    } else if (count >= TIERS.GOLD.minTrips && rating >= TIERS.GOLD.minRating) {
      currentTier = TIERS.GOLD;
      nextTier = TIERS.PLATINUM;
    } else if (count >= TIERS.SILVER.minTrips && rating >= TIERS.SILVER.minRating) {
      currentTier = TIERS.SILVER;
      nextTier = TIERS.GOLD;
    }

    let progressToNextPct = 100;
    let tripsNeededForNext = 0;

    if (nextTier) {
      const prevMin = currentTier.minTrips;
      const nextMin = nextTier.minTrips;
      progressToNextPct = Math.min(100, Math.round(((count - prevMin) / (nextMin - prevMin)) * 100));
      tripsNeededForNext = Math.max(0, nextMin - count);
    }

    // Leaderboard composite score: (Trips * 10) + (Rating * 20) + (OnTime * 15)
    const compositeScore = parseFloat(
      (count * 10 + rating * 20 + (driver.onTimeDeliveryRate || 95) * 0.15).toFixed(1)
    );

    return {
      success: true,
      driver: {
        id: driver.id,
        name: driver.name,
        deliveriesTotal: count,
        rating,
        onTimeRate: driver.onTimeDeliveryRate || 97.2,
        compositeScore,
      },
      currentTier,
      nextTier,
      progressToNextPct,
      tripsNeededForNext,
    };
  }
}

module.exports = new GamificationEngine();
