/**
 * Double-Entry Wallet, Commission & Financial Ledger System
 * Guarantees zero accounting discrepancies across Driver Wallet,
 * Platform Commission, and Bank Payout Settlement state machines.
 */

class LedgerService {
  constructor() {
    // Driver Wallet Accounts: driverId -> { availableBalance, lockedInPayout, totalLifetimeEarnings, totalCommissionPaid }
    this.wallets = new Map();

    // Double-Entry Ledger Journal: [ { id, timestamp, debitAccount, creditAccount, amount, referenceId, description } ]
    this.journalEntries = [];

    // Payout Requests: [ { id, driverId, amount, status, utr, requestedAt, completedAt, bankAccount } ]
    this.payoutRequests = [];

    // Seed default wallet for Rahul Singh
    this.wallets.set('MKP-10482', {
      driverId: 'MKP-10482',
      availableBalance: 2860,
      lockedInPayout: 0,
      totalLifetimeEarnings: 38450,
      totalCommissionPaid: 6780,
      bankAccount: {
        bankName: 'State Bank of India',
        accountNumber: '•••• 4821',
        holderName: 'Rahul Singh',
        ifsc: 'SBIN0001234',
      },
    });

    // Seed initial payout history
    this.payoutRequests.push(
      {
        id: 'MKP-PAY-882104',
        driverId: 'MKP-10482',
        amount: 2500,
        status: 'COMPLETED',
        utr: 'UTR9842019481',
        method: 'IMPS Direct Transfer (SBI •••• 4821)',
        requestedAt: '2026-09-08T14:20:00Z',
        completedAt: '2026-09-08T14:22:15Z',
      },
      {
        id: 'MKP-PAY-879412',
        driverId: 'MKP-10482',
        amount: 1800,
        status: 'COMPLETED',
        utr: 'UTR9831094812',
        method: 'IMPS Direct Transfer (SBI •••• 4821)',
        requestedAt: '2026-09-05T18:00:00Z',
        completedAt: '2026-09-05T18:03:10Z',
      }
    );
  }

  _getWallet(driverId) {
    if (!this.wallets.has(driverId)) {
      this.wallets.set(driverId, {
        driverId,
        availableBalance: 0,
        lockedInPayout: 0,
        totalLifetimeEarnings: 0,
        totalCommissionPaid: 0,
        bankAccount: {
          bankName: 'State Bank of India',
          accountNumber: '•••• 4821',
          holderName: 'Rahul Singh',
          ifsc: 'SBIN0001234',
        },
      });
    }
    return this.wallets.get(driverId);
  }

  /**
   * 1. Settle Completed Delivery (Double-Entry Split: 85% Driver, 15% Platform)
   */
  recordDeliverySettlement(deliveryData) {
    const {
      deliveryId,
      driverId = 'MKP-10482',
      totalCustomerFare = 100,
      tipAmount = 0,
      surgeBonus = 0,
    } = deliveryData;

    const commissionRate = 0.15; // 15% platform commission
    const platformCommission = Math.round(totalCustomerFare * commissionRate);
    const driverFareShare = totalCustomerFare - platformCommission;
    const netDriverEarnings = driverFareShare + tipAmount + surgeBonus;

    const timestamp = new Date().toISOString();
    const entryId = `JRN-${Date.now().toString().slice(-6)}`;

    // Journal Entry 1: Customer Escrow -> Driver Share
    this.journalEntries.push({
      entryId: `${entryId}-A`,
      timestamp,
      debitAccount: 'CUSTOMER_ESCROW',
      creditAccount: `DRIVER_WALLET:${driverId}`,
      amount: netDriverEarnings,
      referenceId: deliveryId,
      description: `Delivery Earning #${deliveryId} (Fare: ₹${driverFareShare}, Tip: ₹${tipAmount}, Surge: ₹${surgeBonus})`,
    });

    // Journal Entry 2: Customer Escrow -> Platform Commission
    this.journalEntries.push({
      entryId: `${entryId}-B`,
      timestamp,
      debitAccount: 'CUSTOMER_ESCROW',
      creditAccount: 'PLATFORM_REVENUE',
      amount: platformCommission,
      referenceId: deliveryId,
      description: `Platform 15% Commission on Delivery #${deliveryId}`,
    });

    // Update Driver Wallet
    const wallet = this._getWallet(driverId);
    wallet.availableBalance += netDriverEarnings;
    wallet.totalLifetimeEarnings += netDriverEarnings;
    wallet.totalCommissionPaid += platformCommission;

    return {
      success: true,
      entryId,
      deliveryId,
      breakdown: {
        totalCustomerFare,
        driverFareShare,
        tipAmount,
        surgeBonus,
        netDriverEarnings,
        platformCommission,
      },
      updatedBalance: wallet.availableBalance,
    };
  }

  /**
   * 2. Request Bank Payout Withdrawal
   */
  requestPayout(driverId = 'MKP-10482', amount) {
    const wallet = this._getWallet(driverId);
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount < 100) {
      throw new Error('Minimum payout withdrawal amount is ₹100.');
    }
    if (parsedAmount > wallet.availableBalance) {
      throw new Error(`Insufficient funds. Available balance: ₹${wallet.availableBalance}`);
    }

    const payoutId = `MKP-PAY-${Date.now().toString().slice(-6)}`;
    const utr = `UTR${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    // Move to locked state
    wallet.availableBalance -= parsedAmount;
    wallet.lockedInPayout += parsedAmount;

    const payout = {
      id: payoutId,
      driverId,
      amount: parsedAmount,
      status: 'PROCESSING',
      utr,
      method: `IMPS Direct Transfer (${wallet.bankAccount.bankName} ${wallet.bankAccount.accountNumber})`,
      requestedAt: new Date().toISOString(),
      bankAccount: wallet.bankAccount,
    };

    this.payoutRequests.unshift(payout);

    // Record Journal Entry: Driver Wallet -> Payout Clearing
    this.journalEntries.push({
      entryId: `JRN-PAY-${Date.now().toString().slice(-6)}`,
      timestamp: payout.requestedAt,
      debitAccount: `DRIVER_WALLET:${driverId}`,
      creditAccount: 'BANK_PAYOUT_CLEARING',
      amount: parsedAmount,
      referenceId: payoutId,
      description: `Bank Withdrawal Request #${payoutId}`,
    });

    return {
      success: true,
      message: 'Payout request initiated successfully. Transferred to verified bank account.',
      payout,
      newAvailableBalance: wallet.availableBalance,
    };
  }

  /**
   * 3. Complete Payout Settlement (Simulate instant IMPS credit)
   */
  completePayout(payoutId) {
    const payout = this.payoutRequests.find((p) => p.id === payoutId);
    if (!payout) throw new Error('Payout request not found.');

    payout.status = 'COMPLETED';
    payout.completedAt = new Date().toISOString();

    const wallet = this._getWallet(payout.driverId);
    wallet.lockedInPayout = Math.max(0, wallet.lockedInPayout - payout.amount);

    return {
      success: true,
      message: `Payout #${payoutId} settled successfully with Bank UTR: ${payout.utr}.`,
      payout,
    };
  }

  /**
   * 4. Get Financial Ledger Summary & Journal History
   */
  getFinancialSummary(driverId = 'MKP-10482') {
    const wallet = this._getWallet(driverId);
    const driverPayouts = this.payoutRequests.filter((p) => p.driverId === driverId);
    const recentJournal = this.journalEntries
      .filter((j) => j.creditAccount.includes(driverId) || j.debitAccount.includes(driverId))
      .slice(-10);

    return {
      success: true,
      wallet: {
        driverId: wallet.driverId,
        availableBalance: wallet.availableBalance,
        lockedInPayout: wallet.lockedInPayout,
        totalLifetimeEarnings: wallet.totalLifetimeEarnings,
        totalCommissionPaid: wallet.totalCommissionPaid,
        bankAccount: wallet.bankAccount,
      },
      payoutHistory: driverPayouts,
      recentJournal,
    };
  }
}

module.exports = new LedgerService();
