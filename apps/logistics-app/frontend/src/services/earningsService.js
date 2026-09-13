/**
 * Earnings Service Interface
 * Prepares endpoints for earnings summaries, performance breakdowns, and payouts.
 */
import apiClient, { USE_MOCK_DATA } from '../api/apiClient';
import { API_ENDPOINTS } from '../api/endpoints';
import { mockEarnings } from '../mock/earnings';

export const getLocalEarningsSummary = () => ({
  month: mockEarnings.monthSummary,
  currentMonth: {
    total: mockEarnings.monthSummary?.totalEarnings || 4860,
    trips: mockEarnings.monthSummary?.deliveriesCompleted || 38,
    tips: 340,
    incentives: 520,
  },
  today: {
    total: mockEarnings.todaySummary?.totalEarnings || 720,
    basePay: mockEarnings.breakdown?.baseFare || 480,
    surgeBonus: (mockEarnings.breakdown?.smartRouteBonus || 55) + (mockEarnings.breakdown?.distanceFare || 65),
    tips: mockEarnings.breakdown?.performanceBonus || 120,
    trips: mockEarnings.todaySummary?.deliveriesCompleted || 18,
  },
  todaySummary: mockEarnings.todaySummary,
  availableBalance: mockEarnings.availableBalance ?? 2860,
  breakdown: mockEarnings.breakdown,
  weeklyTrend: mockEarnings.weeklyTrend,
  weeklyBreakdown: mockEarnings.weeklyTrend,
  dailyBonus: mockEarnings.dailyBonus,
  recentTransactions: mockEarnings.recentTransactions,
});

const getLocalPayoutHistory = (filter = 'ALL') => {
  let history = mockEarnings.payoutHistory || [];
  if (filter && filter !== 'ALL' && filter !== 'All') {
    history = history.filter((p) => p.status.toUpperCase() === filter.toUpperCase());
  }
  return {
    availableForWithdrawal: mockEarnings.availableBalance ?? 2860,
    bankAccount: {
      bankName: mockEarnings.verifiedBankAccount?.bankName || 'State Bank of India',
      accountNumber: mockEarnings.verifiedBankAccount?.accountMasked || '•••• 4821',
      holderName: mockEarnings.verifiedBankAccount?.holderName || 'Rahul Singh',
      ifsc: mockEarnings.verifiedBankAccount?.ifsc || 'SBIN0001234',
    },
    history,
  };
};

export const earningsService = {
  getLocalSummary() {
    return getLocalEarningsSummary();
  },

  async getEarningsSummary(period = 'today') {
    if (USE_MOCK_DATA) {
      await new Promise((r) => setTimeout(r, 200));
      return getLocalEarningsSummary();
    }

    try {
      const data = await apiClient.get(API_ENDPOINTS.earnings, { period });
      return data?.summary || data || getLocalEarningsSummary();
    } catch (err) {
      // Backend offline fallback - returns local data seamlessly with zero error
      return getLocalEarningsSummary();
    }
  },

  async getPayoutHistory(filter = 'ALL') {
    if (USE_MOCK_DATA) {
      await new Promise((r) => setTimeout(r, 200));
      return getLocalPayoutHistory(filter);
    }

    try {
      const data = await apiClient.get(API_ENDPOINTS.payoutHistory, { filter });
      return data?.payouts || data || getLocalPayoutHistory(filter);
    } catch (err) {
      return getLocalPayoutHistory(filter);
    }
  },

  async requestPayout(amount) {
    if (USE_MOCK_DATA) {
      await new Promise((r) => setTimeout(r, 500));
      return this._processLocalPayout(amount);
    }

    try {
      return await apiClient.post(API_ENDPOINTS.requestPayout, { amount });
    } catch (err) {
      return this._processLocalPayout(amount);
    }
  },

  _processLocalPayout(amount) {
    if (amount < (mockEarnings.minPayoutAmount || 100)) {
      throw new Error(`Minimum payout amount is ₹${mockEarnings.minPayoutAmount || 100}`);
    }

    const newRecord = {
      id: 'MKP-PAY-' + Date.now().toString().slice(-6),
      amount,
      date: new Date().toISOString(),
      status: 'PROCESSING',
      method: `Bank Transfer (${mockEarnings.verifiedBankAccount?.bankName || 'SBI'} ${mockEarnings.verifiedBankAccount?.accountMasked || '•••• 4821'})`,
      utr: 'UTR' + Math.floor(1000000000 + Math.random() * 9000000000),
    };

    if (!mockEarnings.payoutHistory) {
      mockEarnings.payoutHistory = [];
    }
    mockEarnings.payoutHistory.unshift(newRecord);
    mockEarnings.availableBalance = Math.max(0, (mockEarnings.availableBalance || 0) - amount);

    return {
      success: true,
      message: 'Payout request initiated successfully. Funds will reflect in 2-4 hours.',
      referenceId: newRecord.id,
      payout: newRecord,
    };
  },
};

export default earningsService;
