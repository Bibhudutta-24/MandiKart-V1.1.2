/**
 * Ranking Service Interface
 * Prepares endpoints for leaderboard, partner ranking, and daily gamification bonuses.
 */
import apiClient, { USE_MOCK_DATA } from '../api/apiClient';
import { API_ENDPOINTS } from '../api/endpoints';
import { mockRanking } from '../mock/ranking';

const getLocalLeaderboard = () => {
  const fullList = [
    ...mockRanking.topPerformers.map((p, idx) => ({
      ...p,
      id: p.id || `MKP-1000${idx + 1}`,
      score: p.score || (99 - idx * 1.5).toFixed(1),
    })),
    ...mockRanking.leaderboard.map((p, idx) => ({
      ...p,
      id: p.isCurrentUser ? 'MKP-10482' : `MKP-100${idx + 10}`,
      score: p.score || (94 - idx * 0.8).toFixed(1),
    })),
  ];

  return {
    currentUser: {
      rank: mockRanking.userRank.rank,
      name: 'Rahul Singh',
      partnerId: 'MKP-10482',
      deliveries: mockRanking.userRank.deliveriesCount || 20,
      score: 94.8,
      earnings: mockRanking.userRank.todayEarnings || 605,
      tier: 'Gold Partner',
      tierProgress: mockRanking.userRank.progressPercent || 85,
    },
    leaderboard: fullList,
    topPerformers: mockRanking.topPerformers,
    userRank: mockRanking.userRank,
  };
};

export const rankingService = {
  async getRanking(period = 'today') {
    if (USE_MOCK_DATA) {
      await new Promise((r) => setTimeout(r, 150));
      return mockRanking;
    }

    try {
      const data = await apiClient.get(API_ENDPOINTS.ranking, { period });
      return data || mockRanking;
    } catch (err) {
      return mockRanking;
    }
  },

  async getLeaderboard(period = 'today') {
    if (USE_MOCK_DATA) {
      await new Promise((r) => setTimeout(r, 150));
      return getLocalLeaderboard();
    }

    try {
      const data = await apiClient.get(API_ENDPOINTS.ranking, { period, type: 'leaderboard' });
      return data?.leaderboard ? data : getLocalLeaderboard();
    } catch (err) {
      return getLocalLeaderboard();
    }
  },

  async getDailyTarget() {
    const defaultTarget = {
      completed: 18,
      target: 20,
      reward: 100,
      remaining: 2,
    };

    if (USE_MOCK_DATA) {
      await new Promise((r) => setTimeout(r, 100));
      return defaultTarget;
    }

    try {
      const data = await apiClient.get(API_ENDPOINTS.dailyTarget);
      return data || defaultTarget;
    } catch (err) {
      return defaultTarget;
    }
  },
};

export default rankingService;
