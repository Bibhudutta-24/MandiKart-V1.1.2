/**
 * Dynamic Fare & Driver Earnings Engine
 * Transparent, industrial pricing model for agricultural and mandi delivery logistics.
 */

// Rates based on vehicle type
const VEHICLE_PRICING = {
  'Motorcycle with Cargo Rack': { baseFare: 35, perKmRate: 10, freeWeightKg: 15 },
  'Electric Cargo 2-Wheeler': { baseFare: 30, perKmRate: 9, freeWeightKg: 20 },
  'Three Wheeler (Auto / Piaggio)': { baseFare: 65, perKmRate: 16, freeWeightKg: 50 },
  'Mini Truck (Tata Ace / Pickup)': { baseFare: 130, perKmRate: 24, freeWeightKg: 150 },
};

// Daily milestone bonus tiers for drivers
const DAILY_INCENTIVES = [
  { minDeliveries: 5, bonus: 50, label: 'Starter Goal (5 Deliveries)' },
  { minDeliveries: 10, bonus: 120, label: 'Pro Partner (10 Deliveries)' },
  { minDeliveries: 15, bonus: 250, label: 'Mandi Superstar (15 Deliveries)' },
  { minDeliveries: 20, bonus: 400, label: 'Fleet Champion (20 Deliveries)' },
];

class FareCalculatorService {
  /**
   * Calculate customer delivery fare and driver payout
   * @param {Object} params - distanceKm, weightKg, vehicleType, isPeakHour, isRainSurge
   */
  calculateDeliveryFare({
    distanceKm = 4.2,
    weightKg = 10,
    vehicleType = 'Motorcycle with Cargo Rack',
    isPeakHour = false,
    isRainSurge = false,
  }) {
    const config = VEHICLE_PRICING[vehicleType] || VEHICLE_PRICING['Motorcycle with Cargo Rack'];

    // 1. Base Fare
    const baseFare = config.baseFare;

    // 2. Distance Charge
    const distanceCharge = Math.round(distanceKm * config.perKmRate);

    // 3. Weight Surcharge (Over free allowance)
    let weightSurcharge = 0;
    if (weightKg > config.freeWeightKg) {
      const extraKg = weightKg - config.freeWeightKg;
      weightSurcharge = Math.round(extraKg * 2); // ₹2 per extra kg
    }

    // 4. Surge Multiplier
    let surgeMultiplier = 1.0;
    if (isPeakHour) surgeMultiplier += 0.15;
    if (isRainSurge) surgeMultiplier += 0.2;

    const subtotal = (baseFare + distanceCharge + weightSurcharge) * surgeMultiplier;
    const finalFare = Math.round(subtotal);

    // Driver gets 85% of fare, platform fee is 15%
    const driverEarning = Math.round(finalFare * 0.85);
    const platformFee = finalFare - driverEarning;

    return {
      totalFare: finalFare,
      driverEarnings: driverEarning,
      platformFee,
      breakdown: {
        baseFare,
        distanceCharge,
        distanceKm,
        perKmRate: config.perKmRate,
        weightSurcharge,
        weightKg,
        surgeMultiplier: parseFloat(surgeMultiplier.toFixed(2)),
      },
    };
  }

  /**
   * Calculate daily driver incentives based on completed trips
   */
  calculateDailyBonus(completedTripsCount) {
    let earnedBonus = 0;
    let nextMilestone = null;

    for (const tier of DAILY_INCENTIVES) {
      if (completedTripsCount >= tier.minDeliveries) {
        earnedBonus = tier.bonus;
      } else if (!nextMilestone) {
        nextMilestone = {
          deliveriesNeeded: tier.minDeliveries - completedTripsCount,
          potentialBonus: tier.bonus,
          targetDeliveries: tier.minDeliveries,
        };
      }
    }

    return {
      completedTrips: completedTripsCount,
      earnedBonus,
      nextMilestone,
      incentiveTiers: DAILY_INCENTIVES,
    };
  }
}

module.exports = {
  fareCalculator: new FareCalculatorService(),
  VEHICLE_PRICING,
  DAILY_INCENTIVES,
};
